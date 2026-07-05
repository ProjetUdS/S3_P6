// src/components/shared/ChatInput.jsx
import React, { useState, useRef } from 'react';
import { getUploadUrl, uploadToUrl } from '../../services/api';

export default function ChatInput({
  onSend,
  placeholder,
  disabled = false,
  isReadOnly = false,
  onEmojiClick,
  children,
}) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  async function handleAttachClick() {
    fileInputRef.current?.click();
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map(f => ({ file: f, uploading: true, uploaded: false, fichierId: null, error: null }));
    setAttachments(prev => [...prev, ...newAttachments]);

    for (const f of files) {
      try {
        const presigned = await getUploadUrl(f.name);
        await uploadToUrl(presigned.uploadUrl, f);
        setAttachments(prev => prev.map(a => a.file === f ? { ...a, uploading: false, uploaded: true, fichierId: presigned.fichierId } : a));
      } catch (err) {
        console.error('Upload failed for', f.name, err);
        setAttachments(prev => prev.map(a => a.file === f ? { ...a, uploading: false, uploaded: false, error: err?.message || 'Upload failed' } : a));
      }
    }
    e.target.value = '';
  }

  function removeAttachment(file) {
    setAttachments(prev => prev.filter(a => a.file !== file));
  }

  async function handleSend() {
    const text = input.trim();
    const hasUploaded = (attachments || []).some(a => a.uploaded && a.fichierId);
    if (!text && !hasUploaded) return;

    setSending(true);
    try {
      await onSend(text, attachments);
      setInput('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (isReadOnly) {
    return (
      <div className="chat-input-bar">
        {children || null}
      </div>
    );
  }

  return (
    <div className="chat-input-bar">
      <div className="input-actions">
        <button className="action-btn" aria-label="Send image">🖼️</button>
        <button className="action-btn" aria-label="Send video">🎬</button>
        <button className="action-btn" aria-label="Attach file" onClick={handleAttachClick}>📎</button>
        {onEmojiClick && <button className="action-btn" aria-label="Emoji" onClick={() => onEmojiClick()}>😊</button>}
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple onChange={handleFilesSelected} />
      </div>

      {attachments.length > 0 && (
        <div className="attachments-row">
          {attachments.map((a, i) => (
            <div key={i} className="attachment-chip">
              <span className="attachment-name">{a.file.name}</span>
              <span className="attachment-state">{a.uploading ? 'Uploading…' : a.uploaded ? '✓' : a.error ? '✕' : ''}</span>
              <button className="attachment-remove" onClick={() => removeAttachment(a.file)} aria-label="Remove attachment">✕</button>
            </div>
          ))}
        </div>
      )}

      <textarea
        ref={inputRef}
        className="chat-text-input"
        placeholder={placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Message input"
        disabled={sending}
        rows={1}
        onInput={e => {
          const el = e.target;
          el.style.height = 'auto';
          el.style.height = Math.min(el.scrollHeight, 80) + 'px';
        }}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        aria-label="Send message"
        disabled={sending || (!(input.trim()) && !(attachments || []).some(a => a.uploaded && a.fichierId))}
      >
        ➤
      </button>
    </div>
  );
}
