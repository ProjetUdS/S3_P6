// src/components/chat/ChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { getFriendConversation, sendMessage, createDiscussion, deleteMessage, changeDiscussionMemberState } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

export default function ChatView({ friend, onDeleteConversation, conversations, discussionId: propDiscussionId, onStateChanged }) {
  const { user } = useAuth();
  const myCip = user?.cip;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [localDiscussionId, setLocalDiscussionId] = useState(null);
  const [topbarMenuOpen, setTopbarMenuOpen] = useState(false);
  const [confirmDeleteConversation, setConfirmDeleteConversation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const pendingActionRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const discussionId = propDiscussionId || localDiscussionId;

  const currentConvo = conversations?.find(c => c.cip === friend?.cip);
  const etat = currentConvo?.etat || friend?.etat || 'enabled';

  useEffect(() => {
    if (!friend?.cip || !myCip) return;
    if (!propDiscussionId) {
      getFriendConversation(myCip, friend.cip, 1, 0)
        .then(data => {
          if (data?.[0]?.discussionId) {
            setLocalDiscussionId(data[0].discussionId);
          }
        })
        .catch(() => {});
    }
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
            dateStr: m.date,
          };
        });
        setMessages(transformed);
      })
      .catch(err => {
        console.error('Failed to load messages:', err);
      });
  }, [friend?.cip, myCip]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close menus when clicking outside
  useEffect(() => {
    if (!menuMsgId && !topbarMenuOpen) return;
    const handler = () => {
      if (menuMsgId) setMenuMsgId(null);
      if (topbarMenuOpen) setTopbarMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuMsgId, topbarMenuOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !myCip || !friend?.cip) return;
    setSending(true);
    let discussionId;

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
          dateStr: m.date,
        };
      });
      setMessages(transformed);
      setTimeout(() => inputRef.current?.focus(), 0);
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

  function getRelativeTime(msg) {
    const msgDate = new Date(msg.dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msgDate.toDateString() === today.toDateString()) {
      return timeStr;
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    } else {
      const dateStr = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr}, ${timeStr}`;
    }
  }

  const isReadOnly = !['enabled', 'active'].includes(etat);

  const isUnarchiving = ['archived', 'disabled'].includes(etat);
  const isBlocking = etat === 'blocked';
  const isArchiving = ['enabled', 'active'].includes(etat);

  async function handleDelete(msgId) {
    if (isReadOnly) return;
    setMenuMsgId(null);
    setConfirmDelete(msgId);
  }

  async function confirmDeleteMessage() {
    if (!confirmDelete) return;
    try {
      await deleteMessage(confirmDelete);
      setMessages(prev => prev.filter(m => m.id !== confirmDelete));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
    setConfirmDelete(null);
  }

  function cancelDelete() {
    setConfirmDelete(null);
  }

  function getDiscussionState() {
    const action = pendingActionRef.current;
    if (action === 'block') return 'blocked';
    if (action === 'unarchive') return 'enabled';
    if (action === 'unblock') return 'enabled';
    if (action === 'archive') return 'archived';
    return 'archived';
  }

  function handleArchiveConversationToggle(e, action) {
    e.stopPropagation();
    if (topbarMenuOpen) {
      setTopbarMenuOpen(false);
    }
    setPendingAction(action);
    pendingActionRef.current = action;
    setConfirmDeleteConversation(true);
  }

  async function handleArchiveConversationConfirm() {
    if (!discussionId || !myCip) {
      setConfirmDeleteConversation(false);
      setPendingAction(null);
      pendingActionRef.current = null;
      if (onDeleteConversation) onDeleteConversation();
      return;
    }
    try {
      const newState = getDiscussionState();
      await changeDiscussionMemberState(discussionId, myCip, newState);
    } catch (err) {
      console.error('Failed to change conversation state:', err);
    }
    setConfirmDeleteConversation(false);
    setPendingAction(null);
    pendingActionRef.current = null;
    if (onStateChanged) {
      onStateChanged();
    }
    if (onDeleteConversation) {
      onDeleteConversation();
    }
  }

  function handleArchiveConversationCancel() {
    setConfirmDeleteConversation(false);
    setPendingAction(null);
    pendingActionRef.current = null;
  }

 function getModalTitle() {
    const action = pendingActionRef.current;
    if (action === 'unarchive') return 'Désarchiver la conversation';
    if (action === 'unblock') return 'Débloquer la conversation';
    if (action === 'block') return 'Bloquer l\'utilisateur';
    if (action === 'archive') return 'Archiver la conversation';
    return isUnarchiving ? 'Désarchiver la conversation'
      : isBlocking ? 'Débloquer la conversation'
      : isArchiving ? 'Archiver la conversation'
      : 'Bloquer l\'utilisateur';
  }

  function getModalSubtitle() {
    const action = pendingActionRef.current;
    if (action === 'block') return 'Voulez-vous vraiment bloquer cet utilisateur ? La conversation sera masquée et vous ne pourrez plus envoyer des messages.';
    if (action === 'unblock') return 'Voulez-vous vraiment débloquer cette conversation ? Vous pourrez à nouveau envoyer des messages.';
    if (action === 'unarchive') return 'Voulez-vous vraiment réactiver cette conversation ? Elle réapparaîtra dans vos conversations actives.';
    if (action === 'archive') return 'Voulez-vous vraiment archiver cette conversation ? Elle sera masquée de votre liste actuelle.';
    return isUnarchiving
      ? 'Voulez-vous vraiment réactiver cette conversation ? Elle réapparaîtra dans vos conversations actives.'
      : isBlocking
        ? 'Voulez-vous vraiment débloquer cette conversation ? Vous pourrez à nouveau envoyer des messages.'
        : isArchiving
          ? 'Voulez-vous vraiment archiver cette conversation ? Elle sera masquée de votre liste actuelle.'
          : 'Voulez-vous vraiment bloquer cet utilisateur ? La conversation sera masquée et vous ne pourrez plus envoyer des messages.';
  }

  function getModalButtonText() {
    const action = pendingActionRef.current;
    if (action === 'block') return 'Bloquer';
    if (action === 'unblock') return 'Débloquer';
    if (action === 'unarchive') return 'Désarchiver';
    if (action === 'archive') return 'Archiver';
    return isUnarchiving ? 'Désarchiver'
      : isBlocking ? 'Débloquer'
      : isArchiving ? 'Archiver'
      : 'Bloquer';
  }

  function getModalSubtitle() {
    if (pendingAction === 'block') return 'Voulez-vous vraiment bloquer cet utilisateur ? La conversation sera masquée et vous ne pourrez plus envoyer de messages.';
    if (pendingAction === 'unblock') return 'Voulez-vous vraiment débloquer cette conversation ? Vous pourrez à nouveau envoyer des messages.';
    if (pendingAction === 'unarchive') return 'Voulez-vous vraiment réactiver cette conversation ? Elle réapparaîtra dans vos conversations actives.';
    if (pendingAction === 'archive') return 'Voulez-vous vraiment archiver cette conversation ? Elle sera masquée de votre liste actuelle.';
    return isUnarchiving
      ? 'Voulez-vous vraiment réactiver cette conversation ? Elle réapparaîtra dans vos conversations actives.'
      : isBlocking
        ? 'Voulez-vous vraiment débloquer cette conversation ? Vous pourrez à nouveau envoyer des messages.'
        : isArchiving
          ? 'Voulez-vous vraiment archiver cette conversation ? Elle sera masquée de votre liste actuelle.'
          : 'Voulez-vous vraiment bloquer cet utilisateur ? La conversation sera masquée et vous ne pourrez plus envoyer de messages.';
  }

  function getModalButtonText() {
    if (pendingAction === 'block') return 'Bloquer';
    if (pendingAction === 'unblock') return 'Débloquer';
    if (pendingAction === 'unarchive') return 'Désarchiver';
    if (pendingAction === 'archive') return 'Archiver';
    return isUnarchiving ? 'Désarchiver'
      : isBlocking ? 'Débloquer'
      : isArchiving ? 'Archiver'
      : 'Bloquer';
  }

  function getActionButtonText() {
    if (isUnarchiving) return 'Désarchiver';
    if (isBlocking) return 'Débloquer';
    return 'Réactiver';
  }

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
          <div className="topbar-dropdown" onClick={e => e.stopPropagation()}>
            <button className="topbar-btn" aria-label="More options" onClick={() => setTopbarMenuOpen(!topbarMenuOpen)}>⋯</button>
            {topbarMenuOpen && (
              <div className="topbar-menu">
                {['enabled', 'active'].includes(etat) && (
                <button className="topbar-menu-item archive-item" onClick={(e) => handleArchiveConversationToggle(e, 'archive')}>
                  Archiver la conversation
                </button>
              )}
              {['archived', 'disabled'].includes(etat) && (
                <button className="topbar-menu-item unarchive-item" onClick={(e) => handleArchiveConversationToggle(e, 'unarchive')}>
                  Désarchiver la conversation
                </button>
              )}
              {etat === 'blocked' && (
                <button className="topbar-menu-item unblock-item" onClick={(e) => handleArchiveConversationToggle(e, 'unblock')}>
                  Débloquer la conversation
                </button>
              )}
              {['enabled', 'active', 'archived', 'disabled'].includes(etat) && (
                <button className="topbar-menu-item block-item" onClick={(e) => handleArchiveConversationToggle(e, 'block')}>
                  Bloquer l'utilisateur
                </button>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="empty-state-icon">💬</span>
            <span className="empty-state-text">No messages yet</span>
          </div>
        )        : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showDay = i === 0 || msg.day !== prevMsg.day;
            return (
              <MessageGroup
                key={msg.id}
                msg={msg}
                own={isOwn(msg)}
                friend={friend}
                myInitials={initialsFromUser(user)}
                myGradient={gradientForCip(myCip)}
                relativeTime={getRelativeTime(msg)}
                menuOpen={menuMsgId === msg.id}
                showDay={showDay}
                onHover={() => setHoveredMsgId(msg.id)}
                onHoverOut={() => setHoveredMsgId(null)}
                onMenuToggle={(e) => {
                  e.stopPropagation();
                  setMenuMsgId(menuMsgId === msg.id ? null : msg.id);
                }}
                onDelete={() => handleDelete(msg.id)}
                isReadOnly={isReadOnly}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar or action button for read-only */}
      <div className="chat-input-bar">
        {isReadOnly ? (
          <button
            className="conversation-action-btn"
            onClick={() => {
              if (isUnarchiving) {
                handleArchiveConversationToggle({ stopPropagation: () => {} }, 'unarchive');
              } else if (isBlocking) {
                handleArchiveConversationToggle({ stopPropagation: () => {} }, 'unblock');
              } else {
                handleArchiveConversationToggle({ stopPropagation: () => {} }, 'unarchive');
              }
            }}
          >
            {getActionButtonText()}
          </button>
        ) : (
          <>
            <div className="input-actions">
              <button className="action-btn" aria-label="Send image">🖼️</button>
              <button className="action-btn" aria-label="Send video">🎬</button>
              <button className="action-btn" aria-label="Attach file">📎</button>
              <button className="action-btn" aria-label="Emoji">😊</button>
            </div>
            <input
              ref={inputRef}
              className="chat-text-input"
              type="text"
              placeholder={etat === 'archived' ? 'Conversation archivée — lecture seule' : etat === 'disabled' ? 'Conversation désactivée — lecture seule' : etat === 'blocked' ? 'Conversation bloquée — lecture seule' : `Message ${friend?.name || 'friend'}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
              disabled={sending || !['enabled', 'active'].includes(etat)}
            />
            <button className="send-btn" onClick={handleSend} aria-label="Send message" disabled={sending || !input.trim()}>
              ➤
            </button>
          </>
        )}
      </div>

      {/* Delete message confirmation modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete message</div>
            <div className="modal-subtitle">Are you sure you want to delete this message? This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="btn-primary" style={{ background: 'var(--red)' }} onClick={confirmDeleteMessage}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive/unarchive/unblock/block confirmation modal */}
      {confirmDeleteConversation && (
        <div className="modal-overlay" onClick={handleArchiveConversationCancel}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{getModalTitle()}</div>
            <div className="modal-subtitle">{getModalSubtitle()}</div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleArchiveConversationCancel}>Annuler</button>
              <button className="btn-primary" onClick={handleArchiveConversationConfirm}>
                {getModalButtonText()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MessageGroup ─────────────────────────────────────────────────────────────
function MessageGroup({ msg, own, friend, myInitials, myGradient, relativeTime, menuOpen, showDay, onHover, onHoverOut, onMenuToggle, onDelete, isReadOnly }) {
  const sender = own
    ? { initials: myInitials, gradient: myGradient }
    : { initials: friend?.initials, gradient: friend?.gradient };

  return (
    <>
      {showDay && msg.day && <div className="day-divider">{msg.day}</div>}
      <div
        className={`msg-group ${own ? 'own' : ''}`}
        onMouseEnter={onHover}
        onMouseLeave={onHoverOut}
      >
        <Avatar initials={sender.initials} gradient={sender.gradient} size="sm" />
        <div className="msg-content">
          {!own && <div className="msg-sender">{friend?.name}</div>}
          <div className={`bubble-wrapper ${own ? 'own' : ''}`}>
            <div className={`bubble ${own ? 'own' : ''}`}>{msg.text}</div>
            {own && !isReadOnly && (
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
