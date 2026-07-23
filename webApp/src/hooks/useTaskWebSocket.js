import { useEffect, useRef } from 'react';

export function useTaskWebSocket(equipeId, onTaskUpdated) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!equipeId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/ws/tache/${equipeId}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'taskUpdated' || data.type === 'deadlineAlert') {
                    onTaskUpdated?.();
                }
            } catch (err) {
                console.error('Task WebSocket error:', err);
            }
        };

        socket.onerror = (err) => console.error('Task WebSocket error:', err);

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [equipeId]);
}