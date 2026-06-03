// src/components/chat/ChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { MESSAGES_SR } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

/**
 * ChatView  — the main 1-on-1 chat area.
 *
 * Props:
 *   friend  – the selected friend object
 */
export default function ChatView({ friend }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(MESSAGES_SR);
  const [input, setInput]       = useState('');
  const bottomRef = useRef(null);

  const me = {
    initials: user?.preferred_username
      ? user.preferred_username.substring(0, 2).toUpperCase()
      : 'JD',
    gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        from: 'jd',
        day: null,
        bubbles: [{ type: 'text', content: text }],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isOwn = msg => msg.from === me.initials;

  return (
    <div className="main-area">
      {/* Topbar */}
      <div className="chat-topbar">
        <Avatar initials={friend.initials} gradient={friend.gradient} size="md" status={friend.status} />
        <div className="chat-topbar-info">
          <div className="chat-topbar-name">{friend.name}</div>
          <div className="chat-topbar-sub">
            {friend.status === 'online' ? 'Active now' : friend.sub}
          </div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" aria-label="Voice call">📞</button>
          <button className="topbar-btn" aria-label="Video call">📹</button>
          <button className="topbar-btn" aria-label="More options">⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map(msg => (
          <MessageGroup
            key={msg.id}
            msg={msg}
            own={isOwn(msg)}
            friend={friend}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <div className="input-actions">
          <button className="action-btn" aria-label="Send image">🖼️</button>
          <button className="action-btn" aria-label="Send video">🎬</button>
          <button className="action-btn" aria-label="Attach file">📎</button>
          <button className="action-btn" aria-label="Emoji">😊</button>
        </div>
        <input
          className="chat-text-input"
          type="text"
          placeholder={`Message ${friend.name}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button className="send-btn" onClick={handleSend} aria-label="Send message">➤</button>
      </div>
    </div>
  );
}

// ── MessageGroup ─────────────────────────────────────────────────────────────
function MessageGroup({ msg, own, friend }) {
  const sender = own
    ? { initials: 'JD', gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)' }
    : { initials: friend.initials, gradient: friend.gradient };

  return (
    <>
      {/* Day divider */}
      {msg.day && <div className="day-divider">{msg.day}</div>}

      <div className={`msg-group ${own ? 'own' : ''}`}>
        <Avatar initials={sender.initials} gradient={sender.gradient} size="sm" />

        <div className="msg-content">
          {!own && <div className="msg-sender">{friend.name}</div>}

          {msg.bubbles.map((b, i) => (
            <Bubble key={i} bubble={b} own={own} />
          ))}

          <div className="msg-time">{msg.time}</div>
        </div>
      </div>
    </>
  );
}

// ── Bubble ────────────────────────────────────────────────────────────────────
function Bubble({ bubble, own }) {
  if (bubble.type === 'text') {
    return <div className={`bubble ${own ? 'own' : ''}`}>{bubble.content}</div>;
  }

  if (bubble.type === 'image') {
    return (
      <div className="img-attachment" role="img" aria-label={`Image: ${bubble.filename}`}>
        {/* Replace with <img src={...} alt={bubble.filename} /> once you have real assets */}
        <div className="img-placeholder">
          <span className="img-placeholder-icon" aria-hidden="true">🖼️</span>
          <span>{bubble.filename}</span>
        </div>
      </div>
    );
  }

  if (bubble.type === 'video') {
    return (
      <div className="video-attachment" role="button" aria-label={`Video: ${bubble.filename}`}>
        <div className="play-btn" aria-hidden="true">▶</div>
        <div className="video-label">{bubble.filename} · {bubble.duration}</div>
      </div>
    );
  }

  return null;
}
