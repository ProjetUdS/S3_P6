import React, { useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsAsRead, clearAllNotifications } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import notifIcon from '../../assets/icons/bell.png';

export default function NotificationsPanel() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.cip) return;

        // Fetch notifications
        getNotifications(user.cip)
            .then(data => {
                setNotifications(data || []);
            })
            .catch(err => console.error('Failed to load notifications:', err))
            .finally(() => setLoading(false));

        // Mark as read and reset badge
        markAllNotificationsAsRead(user.cip)
            .then(() => {
                window.dispatchEvent(new Event('notifications-read'));
            })
            .catch(err => console.error('Failed to mark notifications as read:', err));

    }, [user?.cip]);

    const handleClearAll = async () => {
        if (!user?.cip) return;
        try {
            await clearAllNotifications(user.cip);
            setNotifications([]);
            window.dispatchEvent(new Event('notifications-read'));
        } catch (err) {
            console.error('Failed to clear notifications:', err);
        }
    };

    if (loading) {
        return (
            <div className="main-area">
                <div className="empty-state">
                    <div className="loading-spinner" />
                    <span className="empty-state-text">Chargement des notifications...</span>
                </div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="main-area">
                <div className="empty-state">
                    <img src={notifIcon} alt="Notification icon" className="empty-state-icon" style={{ width: '44px', height: '44px', objectFit: 'contain', opacity: 0.5 }} />
                    <span className="empty-state-text">Aucune notification pour le moment</span>
                </div>
            </div>
        );
    }

    return (
        <div className="main-area" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: 'var(--text)' }}>Vos Notifications</h2>
                <button
                    onClick={handleClearAll}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--bg-lighter)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Clear All
                </button>
            </div>
            {notifications.map(notif => (
                <div key={notif.id} style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: notif.lu ? 'var(--bg-lighter)' : 'var(--bg-surface)',
                    border: notif.lu ? '1px solid var(--border)' : '1px solid var(--primary-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {getNotifTitle(notif.type)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(notif.dateCreation).toLocaleString()}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{notif.contenu}</p>
                </div>
            ))}
        </div>
    );
}

function getNotifTitle(type) {
    switch (type) {
        case 'taskAssigned': return 'Nouvelle Tâche Assignée';
        case 'taskUpdated': return 'Tâche Mise à Jour';
        case 'deadlineAlert': return 'Échéance Proche';
        case 'friendRequest': return 'Demande d\'Ami';
        case 'teamCreated': return 'Nouvelle Équipe';
        default: return 'Notification';
    }
}
