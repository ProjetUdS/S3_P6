import { useEffect, useRef } from 'react';

export function useTaskWebSocket(equipeId, token, onTaskUpdated) {
    const wsRef = useRef(null);
    const retryRef = useRef(null);
    const retryCount = useRef(0);
    const cleanupRef = useRef(false);

    useEffect(() => {
        if (!equipeId || !token) return;
        cleanupRef.current = false;
        retryCount.current = 0;

        function connect() {
            if (cleanupRef.current) return;
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const url = `${protocol}//${window.location.host}/ws/tache/${equipeId}?token=${encodeURIComponent(token)}`;
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onmessage = (event) => {
                retryCount.current = 0;
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'taskUpdated' || data.type === 'deadlineAlert') onTaskUpdated?.();
                } catch (err) {
                    console.error('Task WS parse error:', err);
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
    }, [equipeId, token]);
}
