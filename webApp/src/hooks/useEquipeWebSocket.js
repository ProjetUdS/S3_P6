import { useEffect, useRef } from 'react';

export function useEquipeWebSocket(cip, token, onEvent) {
    const wsRef = useRef(null);
    const retryRef = useRef(null);
    const retryCount = useRef(0);
    const cleanupRef = useRef(false);

    useEffect(() => {
        if (!cip) return;
        cleanupRef.current = false;
        retryCount.current = 0;

        async function connect() {
            if (cleanupRef.current) return;
            const { getKeycloakInstance, updateToken } = await import('../utils/keycloak.js');
            await updateToken(5);
            const kc = getKeycloakInstance();
            if (!kc?.token) return;
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const url = `${protocol}//${window.location.host}/ws/equipe/${cip}?token=${encodeURIComponent(kc.token)}`;
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onmessage = (event) => {
                retryCount.current = 0;
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'teamCreated') onEvent?.();
                } catch (err) {
                    console.error('Equipe WS parse error:', err);
                }
            };

            socket.onopen = () => { retryCount.current = 0; };
            socket.onclose = () => {
                if (cleanupRef.current) return;
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                retryCount.current++;
                retryRef.current = setTimeout(connect, delay);
            };
            socket.onerror = () => {};
        }

        connect();

        return () => {
            cleanupRef.current = true;
            if (retryRef.current) clearTimeout(retryRef.current);
            if (wsRef.current) wsRef.current.close();
            wsRef.current = null;
        };
    }, [cip]);
}
