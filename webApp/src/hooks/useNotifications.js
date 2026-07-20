import { useState, useEffect, useRef } from 'react';
import { getUnreadCount } from '../services/api';

/**
 * Gère le compteur de notifications non lues.
 * Charge le compte initial via l'API, puis écoute le WebSocket
 * pour l'incrémenter en temps réel à chaque nouvelle notification.
 */
export function useNotifications(cip) {
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!cip) return;

        // 1. Compte initial (les notifications déjà en base)
        getUnreadCount(cip)
            .then(count => setUnreadCount(count))
            .catch(err => console.error('Failed to load unread count:', err));

        // 2. Connexion WebSocket pour le temps réel
        //const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        //const url = `${protocol}//${window.location.host}/ws/notification/${cip}`;
        const url = `ws://localhost:8888/ws/notification/${cip}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onmessage = () => {
            // Une notification est arrivée : on incrémente le badge
            setUnreadCount(prev => prev + 1);
        };

        socket.onerror = (err) => {
            console.error('Notification WebSocket error:', err);
        };

        // 3. Nettoyage à la déconnexion / changement d'utilisateur
        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [cip]);

    return { unreadCount, setUnreadCount };
}