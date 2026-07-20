// src/components/chat/ChatView.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { ChatMessagesList } from '../shared/ChatMessagesList';
import { useChatMessages } from '../shared/useChatMessages';
import ChatInput from '../shared/ChatInput';
import { getFriendConversation, sendMessage, createDiscussion, changeDiscussionMemberState, getUploadUrl, uploadToUrl, getDownloadUrl, default as api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

export default function ChatView({ friend, onDeleteConversation, conversations, discussionId: propDiscussionId, onStateChanged, activeFriend, onNotif }) {
  const { user } = useAuth();
  const myCip = user?.cip;
  const [localDiscussionId, setLocalDiscussionId] = useState(null);
  const [topbarMenuOpen, setTopbarMenuOpen] = useState(false);
  const [confirmDeleteConversation, setConfirmDeleteConversation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const pendingActionRef = useRef(null);
  const messagesAreaRef = useRef(null);

    const {
        messages,
        setMessages,
        hoveredMsgId,
        setHoveredMsgId,
        menuMsgId,
        setMenuMsgId,
        confirmDelete,
        isOwn,
        getRelativeTime,
        transformMessages,
        handleDelete,
        confirmDeleteMessage,
        cancelDelete,
        connectWebSocket,
    } = useChatMessages(myCip, messagesAreaRef);

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
        const transformed = transformMessages(data);
        setMessages(transformed);
        console.debug('Loaded messages with fichiers:', transformed);
      })
      .catch(err => {
        console.error('Failed to load messages:', err);
      });
  }, [friend?.cip, myCip]);

  useEffect(() => {
    if (!topbarMenuOpen) return;
    const handler = () => setTopbarMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [topbarMenuOpen]);

    const isActiveConversationRef = useRef(false);

    useEffect(() => {
        isActiveConversationRef.current = true;
        return () => {
            isActiveConversationRef.current = false;
        };
    }, []);

    useEffect(() => {
        console.log('useEffect WebSocket - discussionId:', discussionId, 'friend?.cip:', friend?.cip);
        if (!discussionId || !friend?.cip) return;
        const cleanup = connectWebSocket(
            discussionId,
            friend.cip,
            () => isActiveConversationRef.current,
            onNotif
        );
        return cleanup;
    }, [discussionId, friend?.cip]);


  async function handleSend(text, attachments) {
    if (!myCip || !friend?.cip) return;

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
    if (!discussionId) return;

    const hasUploadedAttachments = (attachments || []).some(a => a.uploaded && a.fichierId);
    if (!text && !hasUploadedAttachments) return;

    const fichiersPayload = (attachments || []).filter(a => a.uploaded && a.fichierId).map(a => ({
      fichierId: a.fichierId,
      nomOriginal: a.file.name,
      typeMime: a.file.type,
      tailleOctets: a.file.size,
      cip: myCip,
    }));

    try {
      await sendMessage({
        contenu: text,
        cip: myCip,
        discussionId,
        destinataireCip: friend.cip,
        fichiers: fichiersPayload.length ? fichiersPayload : undefined,
      });
      const data = await getFriendConversation(myCip, friend.cip, 100, 0);
      const transformed = transformMessages(data);
      setMessages(transformed);
      console.debug('Refreshed messages after send, fichiers:', transformed);
      setTimeout(() => {
        document.querySelector('.chat-text-input')?.focus();
      }, 0);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }



  const isReadOnly = !['enabled', 'active'].includes(etat);

  const isUnarchiving = ['archived', 'disabled'].includes(etat);
  const isBlocking = etat === 'blocked';
  const isArchiving = ['enabled', 'active'].includes(etat);

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

  function getPlaceholder() {
    if (etat === 'archived') return 'Conversation archivée — lecture seule';
    if (etat === 'disabled') return 'Conversation désactivée — lecture seule';
    if (etat === 'blocked') return 'Conversation bloquée — lecture seule';
    return `Message ${friend?.name || 'friend'}…`;
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
      <div className="messages-area" ref={messagesAreaRef} role="log" aria-live="polite" aria-label="Chat messages">
        <ChatMessagesList
          messages={messages}
          isOwn={isOwn}
          getRelativeTime={getRelativeTime}
          hoveredMsgId={hoveredMsgId}
          setHoveredMsgId={setHoveredMsgId}
          menuMsgId={menuMsgId}
          setMenuMsgId={setMenuMsgId}
          handleDelete={handleDelete}
          getSender={(msg) => isOwn(msg)
            ? { initials: initialsFromUser(user), gradient: gradientForCip(myCip) }
            : { initials: friend?.initials, gradient: friend?.gradient, name: friend?.name }}
          emptyState={
            <div className="empty-state" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="empty-state-icon">💬</span>
              <span className="empty-state-text">No messages yet</span>
            </div>
          }
        />
      </div>

      {/* Input bar or action button for read-only */}
      <ChatInput
        onSend={handleSend}
        placeholder={getPlaceholder()}
        isReadOnly={isReadOnly}
      >
        {isReadOnly && (
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
        )}
      </ChatInput>

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
