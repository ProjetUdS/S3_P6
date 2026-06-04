// src/components/Sidebar.jsx
import React from 'react';
import { Avatar } from './shared/Avatar';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { key: 'messages', icon: '💬', label: 'Messages' },
  { key: 'teams',    icon: '👥', label: 'Teams'    },
  { key: 'notifs',   icon: '🔔', label: 'Notifications', badge: true },
];

export default function Sidebar({ activeView, onNav }) {
  const { user } = useAuth();

  const initials = user?.preferred_username
    ? user.preferred_username.substring(0, 2).toUpperCase()
    : 'JD';

  const gradient = 'linear-gradient(135deg, #7c6af7, #a78bfa)';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" aria-label="App logo">⚡</div>

      {NAV_ITEMS.map(({ key, icon, label, badge }) => (
        <button
          key={key}
          className={`sidebar-icon ${activeView === key ? 'active' : ''}`}
          onClick={() => onNav(key)}
          aria-label={label}
          title={label}
        >
          {icon}
          {badge && <span className="notif-dot" aria-hidden="true" />}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <button className="sidebar-icon" aria-label="Settings" title="Settings">⚙️</button>

      <div className="sidebar-avatar-wrap">
        <Avatar
          initials={initials}
          gradient={gradient}
          size="sm"
          style={{ border: '2px solid rgba(255,255,255,0.15)' }}
        />
      </div>
    </aside>
  );
}
