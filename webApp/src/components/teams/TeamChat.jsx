// src/components/teams/TeamChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { TeamIcon } from '../shared/Avatar';
import { TEAM_MEMBERS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const INITIAL_MESSAGES = [
  {
    id: 1, from: 'sr', day: 'Today',
    text: 'Morning everyone! 👋 Just pushed the updated components to the branch.',
    time: '9:02 AM',
  },
  {
    id: 2, from: 'ak', day: null,
    text: 'Nice, reviewing now. Tests are passing 🎉',
    time: '9:15 AM',
  },
  {
    id: 3, from: 'jd', day: null,
    text: 'Great work team. Sprint review is at 10:00 — don\'t forget!',
    time: '9:20 AM',
  },
];

const MEMBER_MAP = Object.fromEntries(TEAM_MEMBERS.map(m => [m.id, m]));

export default function TeamChat({ team }) {
  const { user } = useAuth();
  const myId = user?.preferred_username?.substring(0, 2).toLowerCase() || 'jd';
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(), from: myId, day: null, text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <>
      {/* Topbar */}
      <div className="chat-topbar">
        <TeamIcon initials={team.initials} gradient={team.gradient} size="md" />
        <div className="chat-topbar-info">
          <div className="chat-topbar-name">{team.name}</div>
          <div className="chat-topbar-sub">{team.memberCount} members</div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" aria-label="Search in chat">🔍</button>
          <button className="topbar-btn" aria-label="Members">👥</button>
          <button className="topbar-btn" aria-label="More options">⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area" role="log" aria-live="polite">
        {messages.map(msg => {
          const member = MEMBER_MAP[msg.from];
          const own = msg.from === myId;
          return (
            <React.Fragment key={msg.id}>
              {msg.day && <div className="day-divider">{msg.day}</div>}
              <div className={`msg-group ${own ? 'own' : ''}`}>
                <Avatar initials={member?.initials || '?'} gradient={member?.gradient || '#ccc'} size="sm" />
                <div className="msg-content">
                  {!own && <div className="msg-sender">{member?.name}</div>}
                  <div className={`bubble ${own ? 'own' : ''}`}>{msg.text}</div>
                  <div className="msg-time">{msg.time}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="input-actions">
          <button className="action-btn" aria-label="Image">🖼️</button>
          <button className="action-btn" aria-label="Video">🎬</button>
          <button className="action-btn" aria-label="Attach">📎</button>
          <button className="action-btn" aria-label="Emoji">😊</button>
        </div>
        <input
          className="chat-text-input"
          type="text"
          placeholder={`Message ${team.name}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Team message input"
        />
        <button className="send-btn" onClick={handleSend} aria-label="Send">➤</button>
      </div>
    </>
  );
}
