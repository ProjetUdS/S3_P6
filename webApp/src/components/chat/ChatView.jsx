// src/components/chat/ChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { getFriendConversation, sendMessage, createDiscussion } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

export default function ChatView({ friend }) {
  const { user } = useAuth();
  const myCip = user?.cip;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!friend?.cip || !myCip) return;
    setLoading(true);
    getFriendConversation(myCip, friend.cip, 100, 0)
      .then(data => {
        const transformed = (data || []).sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
          const msgDate = new Date(m.date);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          let day = null;
          if (msgDate.toDateString() === today.toDateString()) day = 'Today';
          else if (msgDate.toDateString() === yesterday.toDateString()) day = 'Yesterday';
          return {
            id: m.id,
            from: m.cip,
            day,
            text: m.contenu,
            time: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        setMessages(transformed);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load messages:', err);
        setLoading(false);
      });
  }, [friend?.cip, myCip]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !myCip || !friend?.cip) return;
    setSending(true);
    let discussionId = null;

    const existing = await getFriendConversation(myCip, friend.cip, 1, 0).catch(() => []);
    if (existing.length > 0) {
      discussionId = existing[0].discussionId;
    } else {
      discussionId = await createDiscussion({ members: [myCip, friend.cip] }).catch(err => {
        console.error('Failed to create discussion:', err);
        return null;
      });
      if (discussionId) {
        discussionId = discussionId.discussionId || discussionId;
      }
    }
    if (!discussionId) { setSending(false); return; }

    try {
      await sendMessage({
        contenu: text,
        cip: myCip,
        discussionId,
      });
      setInput('');
      const data = await getFriendConversation(myCip, friend.cip, 100, 0);
      const transformed = (data || []).sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
        const msgDate = new Date(m.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let day = null;
        if (msgDate.toDateString() === today.toDateString()) day = 'Today';
        else if (msgDate.toDateString() === yesterday.toDateString()) day = 'Yesterday';
        return {
          id: m.id,
          from: m.cip,
          day,
          text: m.contenu,
          time: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
      setMessages(transformed);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const isOwn = msg => msg.from === myCip;

  return (
    <div className="main-area">
      {/* Topbar */}
      <div className="chat-topbar">
        <Avatar initials={friend?.initials} gradient={friend?.gradient} size="md" status={friend?.status} />
        <div className="chat-topbar-info">
          <div className="chat-topbar-name">{friend?.name}</div>
          <div className="chat-topbar-sub">
            {friend?.status === 'online' ? 'Active now' : friend?.sub}
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
        {loading && messages.length === 0 ? (
          <div className="loading-spinner" style={{ margin: '40px auto' }} />
        ) : messages.length === 0 ? (
          <div className="empty-state" style={{ margin: '40px auto' }}>
            <span className="empty-state-icon">💬</span>
            <span className="empty-state-text">No messages yet</span>
          </div>
        ) : (
          messages.map(msg => (
            <MessageGroup
              key={msg.id}
              msg={msg}
              own={isOwn(msg)}
              friend={friend}
              myInitials={initialsFromUser(user)}
              myGradient={gradientForCip(myCip)}
            />
          ))
        )}
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
          placeholder={`Message ${friend?.name || 'friend'}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
          disabled={sending}
        />
        <button className="send-btn" onClick={handleSend} aria-label="Send message" disabled={sending || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

// ── MessageGroup ─────────────────────────────────────────────────────────────
function MessageGroup({ msg, own, friend, myInitials, myGradient }) {
  const sender = own
    ? { initials: myInitials, gradient: myGradient }
    : { initials: friend?.initials, gradient: friend?.gradient };

  return (
    <>
      {msg.day && <div className="day-divider">{msg.day}</div>}
      <div className={`msg-group ${own ? 'own' : ''}`}>
        <Avatar initials={sender.initials} gradient={sender.gradient} size="sm" />
        <div className="msg-content">
          {!own && <div className="msg-sender">{friend?.name}</div>}
          <div className={`bubble ${own ? 'own' : ''}`}>{msg.text}</div>
          <div className="msg-time">{msg.time}</div>
        </div>
      </div>
    </>
  );
}
