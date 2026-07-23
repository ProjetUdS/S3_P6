import { useEffect, useRef } from 'react';

export function useEquipeWebSocket(cip, onRequestReceived) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!cip) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/ws/equipe/${cip}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'teamCreated') {
                onRequestReceived?.();
            }
        };

        socket.onerror = (err) => console.error('Equipe WebSocket error:', err);

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [cip]);
}