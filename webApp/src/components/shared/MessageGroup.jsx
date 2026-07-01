// src/components/shared/MessageGroup.jsx
import React from 'react';
import { Avatar } from './Avatar';

export function MessageGroup({
  msg,
  sender,
  own,
  relativeTime,
  menuOpen,
  showDay,
  onHover,
  onHoverOut,
  onMenuToggle,
  onDelete,
}) {
  return (
    <>
      {showDay && msg.day && <div className="day-divider">{msg.day}</div>}
      <div
        className={`msg-group ${own ? 'own' : ''}`}
        onMouseEnter={onHover}
        onMouseLeave={onHoverOut}
      >
        <Avatar initials={sender?.initials || '?'} gradient={sender?.gradient || '#ccc'} size="sm" />
        <div className="msg-content">
          {!own && sender?.name && <div className="msg-sender">{sender.name}</div>}
          <div className={`bubble-wrapper ${own ? 'own' : ''}`}>
            <div className={`bubble ${own ? 'own' : ''}`}>{msg.text}</div>
            {own && (
              <div className={`bubble-actions ${own ? 'own' : ''}`}>
                <div className={`delete-menu ${own ? 'own' : ''}`} style={{ display: menuOpen ? 'block' : 'none' }}>
                  <button className="delete-menu-item" onClick={onDelete}>Delete</button>
                </div>
                <button
                  className="bubble-menu-btn"
                  onClick={onMenuToggle}
                  aria-label="Message options"
                >
                  ⋯
                </button>
              </div>
            )}
          </div>
          <div className="msg-time">{relativeTime}</div>
        </div>
      </div>
    </>
  );
}
