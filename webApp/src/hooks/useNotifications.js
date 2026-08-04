import { useState, useEffect, useRef } from 'react';
import { getUnreadCount } from '../services/api';

export function useNotifications(cip, token) {
    const [unreadCount, setUnreadCount] = useState(0);
    const wsRef = useRef(null);
    const retryRef = useRef(null);
    const retryCount = useRef(0);
    const cleanupRef = useRef(false);

    useEffect(() => {
        if (!cip) return;
        cleanupRef.current = false;
        retryCount.current = 0;

        getUnreadCount(cip)
            .then(count => setUnreadCount(count))
            .catch(err => console.error('Failed to load unread count:', err));

        async function connect() {
            if (cleanupRef.current) return;
            const { getKeycloakInstance, updateToken } = await import('../utils/keycloak.js');
            await updateToken(5);
            const kc = getKeycloakInstance();
            if (!kc?.token) return;
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const url = `${protocol}//${window.location.host}/ws/notification/${cip}?token=${encodeURIComponent(kc.token)}`;
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onmessage = () => {
                retryCount.current = 0;
                setUnreadCount(prev => prev + 1);
            };

            socket.onopen = () => { retryCount.current = 0; };
            socket.onerror = () => {};
            socket.onclose = () => {
                if (cleanupRef.current) return;
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                retryCount.current++;
                retryRef.current = setTimeout(connect, delay);
            };
        }

        connect();

        const handleReadEvent = () => setUnreadCount(0);
        window.addEventListener('notifications-read', handleReadEvent);

        return () => {
            cleanupRef.current = true;
            window.removeEventListener('notifications-read', handleReadEvent);
            if (retryRef.current) clearTimeout(retryRef.current);
            if (wsRef.current) wsRef.current.close();
            wsRef.current = null;
        };
    }, [cip]);

    return { unreadCount, setUnreadCount };
}
