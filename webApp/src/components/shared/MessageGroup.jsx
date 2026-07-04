// src/components/shared/MessageGroup.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { getDownloadUrl } from '../../services/api';
import api from '../../services/api';

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
  fichiers,
}) {

  const [downloadingId, setDownloadingId] = React.useState(null);

  async function handleDownload(fichier) {
    try {
      setDownloadingId(fichier.fichierId);
      const presigned = await getDownloadUrl(fichier.fichierId);
      try {
        const proxyRes = await api.get(`/fichiers/download-proxy/${fichier.fichierId}`, { params: { filename: fichier.nomOriginal }, responseType: 'blob' });
        const blob = proxyRes.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = fichier.nomOriginal || 'download';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        setDownloadingId(null);
        return;
      } catch {
        console.warn('Proxy download failed, falling back');
      }
      try {
        const response = await fetch(presigned.uploadUrl, { mode: 'cors', credentials: 'omit' });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = fichier.nomOriginal || 'download';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } catch {
        console.warn('Fetch download failed, opening presigned URL');
        const a = document.createElement('a');
        a.href = presigned.uploadUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingId(null);
    }
  }

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
                <div className={`attachment-bubble bubble ${own ? 'own' : ''}`}>
                  {fichiers.map((f, i) => (
                      <button key={i} className="attachment-link" onClick={() => handleDownload(f)} disabled={downloadingId === f.fichierId}>
                        📎 {f.nomOriginal} ({(f.tailleOctets / 1024).toFixed(1)}KB) {downloadingId === f.fichierId && '...'}
                      </button>
                  ))}
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
