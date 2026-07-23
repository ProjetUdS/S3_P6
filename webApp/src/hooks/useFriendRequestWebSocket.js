import { useEffect, useRef } from 'react';

export function useFriendRequestWebSocket(cip, onRequestReceived) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!cip) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/ws/requeteAmi/${cip}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'friendRequest') {
                    onRequestReceived?.();
                }
            } catch (err) {
                console.error('FriendRequest WebSocket error:', err);
            }
        };

        socket.onerror = (err) => console.error('FriendRequest WebSocket error:', err);

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [cip]);
}