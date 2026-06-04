// src/components/teams/TeamChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { TeamIcon } from '../shared/Avatar';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, getDiscussions, getMessages, sendMessage, createDiscussion } from '../../services/api';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

export default function TeamChat({ team }) {
  const { user } = useAuth();
  const myCip = user?.cip;
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!team?.equipeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getTeamMembers(team.equipeId)
        .then(data => {
          const transformed = (data || []).map(m => {
            const name = [m.prenom, m.nom].filter(Boolean).join(' ') || m.pseudo || 'Unknown';
            return {
              id: m.cip,
              name,
              initials: m.pseudo?.substring(0, 2).toUpperCase() || '?',
              gradient: gradientForCip(m.cip),
            };
          });
          setMembers(transformed);
        })
        .catch(err => console.error('Failed to load team members:', err)),
      getDiscussions(null, team.equipeId)
        .then(discussions => {
          if (!discussions?.[0]) {
            setLoading(false);
            return;
          }
          const discussionId = discussions[0].discussionId;
          return getMessages(discussionId, 50, 0)
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
        })
        .catch(err => console.error('Failed to load discussions:', err)),
    ]);
  }, [team?.equipeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !myCip || !team?.equipeId) return;

    let discussionId = null;
    const discussions = await getDiscussions(null, team.equipeId).catch(err => {
      console.error('Failed to get discussions:', err);
      return [];
    });

    if (discussions?.[0]) {
      discussionId = discussions[0].discussionId;
    } else {
      const newDiscussion = await createDiscussion({ equipeId: team.equipeId }).catch(err => {
        console.error('Failed to create discussion:', err);
        return null;
      });
      if (newDiscussion) {
        discussionId = newDiscussion.discussionId || newDiscussion;
      }
    }

    if (!discussionId) return;

    try {
      await sendMessage({
        contenu: text,
        cip: myCip,
        discussionId,
      });
      setInput('');

      const updatedMessages = await getMessages(discussionId, 50, 0);
      const transformed = (updatedMessages || []).sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
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
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const MEMBER_MAP = Object.fromEntries(members.map(m => [m.id, m]));

  return (
    <>
      {/* Topbar */}
      <div className="chat-topbar">
        <TeamIcon initials={(team?.nomEquipe || '?').substring(0, 1).toUpperCase()} gradient="var(--grad-sr)" size="md" />
        <div className="chat-topbar-info">
          <div className="chat-topbar-name">{team?.nomEquipe || 'Team'}</div>
          <div className="chat-topbar-sub">{members.length} members</div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" aria-label="Search in chat">🔍</button>
          <button className="topbar-btn" aria-label="Members">👥</button>
          <button className="topbar-btn" aria-label="More options">⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area" role="log" aria-live="polite">
        {loading && messages.length === 0 ? (
          <div className="loading-spinner" style={{ margin: '40px auto' }} />
        ) : messages.length === 0 ? (
          <div className="empty-state" style={{ margin: '40px auto' }}>
            <span className="empty-state-icon">💬</span>
            <span className="empty-state-text">No messages yet</span>
          </div>
        ) : (
          messages.map(msg => {
            const member = MEMBER_MAP[msg.from];
            const own = msg.from === myCip;
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
          })
        )}
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
          placeholder={`Message ${team?.nomEquipe || 'team'}…`}
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
