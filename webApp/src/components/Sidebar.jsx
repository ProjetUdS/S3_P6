import React, { useEffect, useState } from 'react';
import {useNotifications} from '../hooks/useNotifications';
import { Avatar } from './shared/Avatar';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../services/settingsApi';
import { gradientForCip, initialsFromUser } from '../utils/gradient';
import teamIcon from '../assets/icons/team.png';
import settingIcon from '../assets/icons/setting.png';
import messageIcon from '../assets/icons/message.png'
import notifIcon from '../assets/icons/bell.png'
import logoIcon from '../assets/icons/logo.png'
import logoutIcon from '../assets/icons/logout.png'

import SettingsModal from './parametres/SettingsModal';

const NAV_ITEMS = [
    {key: 'messages', icon: messageIcon, label: 'Messages', isImage: true},
    {key: 'teams', icon: teamIcon, label: 'Teams', isImage: true},
    {key: 'notifs', icon: notifIcon, label: 'Notifications', isImage: true},
];

const gradient = 'linear-gradient(135deg, #3b82f6, #60a5fa)';

export default function Sidebar({ activeView, onNav, hasNotif }) {
    const { user, logout } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const {unreadCount} = useNotifications(user?.cip);

    const initials = initialsFromUser
        ? initialsFromUser(user)
        : (user?.pseudo || user?.preferred_username || 'JD').substring(0, 2).toUpperCase();

    const gradient = user?.cip
        ? gradientForCip(user.cip)
        : 'linear-gradient(135deg, #3b82f6, #60a5fa)';

    function loadAvatar() {
        if (!user?.cip) return;
        getAvatarUrl(user.cip)
            .then(setAvatarUrl)
            .catch(() => setAvatarUrl(null));
    }

    useEffect(() => {
        loadAvatar();
    }, [user?.cip]);

    // Se rafraîchit immédiatement quand la photo est changée depuis les
    // paramètres, sans attendre un rechargement de page.
    useEffect(() => {
        window.addEventListener('avatar-updated', loadAvatar);
        return () => window.removeEventListener('avatar-updated', loadAvatar);
    }, [user?.cip]);


    return (
        <aside className="sidebar">
            <img src={logoIcon} className="sidebar-logo" aria-label="App logo" alt='Logo' ></img>
            {NAV_ITEMS.map(({key, icon, label, badge, isImage}) => (
                <button
                    key={key}
                    className={`sidebar-icon ${activeView === key ? 'active' : ''}`}
                    onClick={() => onNav(key)}
                    aria-label={label}
                    title={label}
                >
                    {isImage ? <img src={icon} alt=""/> : icon}
                    {badge && unreadCount > 0 && (
                        <span className="notif-badge" aria-label={`${unreadCount} notifications non lues`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
                    )}
                </button>
            ))}

            <div className="sidebar-spacer"/>
            <button
                className="sidebar-icon"
                onClick={() => setSettingsOpen(true)}
                aria-label="Settings"
                title="Settings"
            >
                <img src={settingIcon} alt=""/>
            </button>
            <button
                className="sidebar-icon"
                onClick={logout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
            >
                <img src={logoutIcon} alt="Logout" className="logout-icon"/>
            </button>
            <div className="sidebar-avatar-wrap">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(15,23,42,0.1)',
                        }}
                    />
                ) : (
                    <Avatar
                        initials={initials}
                        gradient={gradient}
                        size="sm"
                        style={{border: '2px solid rgba(15,23,42,0.1)'}}
                    />
                )}
            </div>
            <a
                href="https://www.flaticon.com/authors/freepik"
                title="Icons"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-attribution"
            >
                Icons by Freepik - Flaticon
            </a>

            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </aside>
    );
}
