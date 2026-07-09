// src/components/shared/MessageGroup.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { getDownloadUrl } from '../../services/api';
import api from '../../services/api';
import SecureImage from '../SecureImage';

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
            {fichiers && fichiers.length > 0 && (
              <div className="attachments-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {fichiers.map((f, i) => {
                  const isImage = f.typeMime && f.typeMime.startsWith('image/');
                  if (isImage) {
                    return (
                      <div key={i} className={`image-attachment ${own ? 'own' : ''}`} style={{ maxWidth: '300px', alignSelf: own ? 'flex-end' : 'flex-start' }}>
                        <SecureImage 
                          fichierId={f.fichierId} 
                          alt={f.nomOriginal} 
                          style={{ width: '100%', borderRadius: '12px', border: '1px solid #eee', display: 'block', cursor: 'pointer' }} 
                        />
                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px', textAlign: own ? 'right' : 'left' }}>
                          <button onClick={() => handleDownload(f)} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={`attachment-bubble bubble ${own ? 'own' : ''}`}>
                      <button className="attachment-link" onClick={() => handleDownload(f)} disabled={downloadingId === f.fichierId}>
                        📎 {f.nomOriginal} ({(f.tailleOctets / 1024).toFixed(1)}KB) {downloadingId === f.fichierId && '...'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
