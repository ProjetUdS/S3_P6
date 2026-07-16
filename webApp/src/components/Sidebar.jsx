import React from 'react';
import { Avatar } from './shared/Avatar';
import { useAuth } from '../context/AuthContext';
import teamIcon from '../assets/icons/team.png';
import settingIcon from '../assets/icons/setting.png';
import { useNotifications } from '../hooks/useNotifications';
import messageIcon from '../assets/icons/message.png'

const NAV_ITEMS = [
  { key: 'messages', icon: '💬', label: 'Messages' },
  { key: 'teams',    icon: teamIcon, label: 'Teams', isImage: true },
  { key: 'notifs',   icon: '🔔', label: 'Notifications', badge: true },
];

export default function Sidebar({ activeView, onNav, hasNotif }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.cip);

    const initials = user?.preferred_username
        ? user.preferred_username.substring(0, 2).toUpperCase()
        : 'JD';

    const gradient = 'linear-gradient(135deg, #3b82f6, #60a5fa)';

    const NAV_ITEMS = [
        { key: 'messages', icon: messageIcon, label: 'Messages', isImage: true },
        { key: 'teams',    icon: teamIcon, label: 'Teams', isImage: true },
        { key: 'notifs',   icon: '🔔', label: 'Notifications', badge: true },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo" aria-label="App logo">⚡</div>
            {NAV_ITEMS.map(({ key, icon, label, badge, isImage }) => (
                <button
                    key={key}
                    className={`sidebar-icon ${activeView === key ? 'active' : ''}`}
                    onClick={() => onNav(key)}
                    aria-label={label}
                    title={label}
                >
                    {isImage ? <img src={icon} alt="" /> : icon}
                    {badge && <span className="notif-dot" aria-hidden="true" />}
                </button>
            ))}
            <div className="sidebar-spacer" />
            <button className="sidebar-icon" aria-label="Settings" title="Settings">
                <img src={settingIcon} alt="" />
            </button>
            <button
                className="sidebar-icon"
                onClick={logout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
            >
                🚪
            </button>
            <div className="sidebar-avatar-wrap">
                <Avatar
                    initials={initials}
                    gradient={gradient}
                    size="sm"
                    style={{ border: '2px solid rgba(15,23,42,0.1)' }}
                />
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
        </aside>
    );
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" aria-label="App logo">⚡</div>

      {NAV_ITEMS.map(({ key, icon, label, badge, isImage }) => (
        <button
          key={key}
          className={`sidebar-icon ${activeView === key ? 'active' : ''}`}
          onClick={() => onNav(key)}
          aria-label={label}
          title={label}
        >
            {isImage ? <img src={icon} alt="" /> : icon}
            {badge && unreadCount > 0 && (
                <span className="notif-badge" aria-label={`${unreadCount} notifications non lues`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            )}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <button className="sidebar-icon" aria-label="Settings" title="Settings">
        <img src={settingIcon} alt="" />
      </button>

      <div className="sidebar-avatar-wrap">
        <Avatar
          initials={initials}
          gradient={gradient}
          size="sm"
          style={{ border: '2px solid rgba(15,23,42,0.1)' }}
        />
      </div>

      <a
        href="https://www.flaticon.com/free-icons/people"
        title="People icons"
        target="_blank"
        rel="noopener noreferrer"
        className="sidebar-attribution"
      >
        Icons by Freepik - Flaticon
      </a>
    </aside>
  );
}