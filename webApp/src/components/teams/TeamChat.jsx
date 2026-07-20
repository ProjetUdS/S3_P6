// src/components/teams/TeamChat.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, TeamIcon } from '../shared/Avatar';
import { ChatMessagesList } from '../shared/ChatMessagesList';
import { useChatMessages } from '../shared/useChatMessages';
import ChatInput from '../shared/ChatInput';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, getDiscussions, getMessages, sendMessage, createDiscussion } from '../../services/api';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

import searchIcon from '../../assets/icons/search.png'
import usersIcon from '../../assets/icons/users.png'
import messageIcon from '../../assets/icons/message.png'

export default function TeamChat({ team }) {
  const { user } = useAuth();
  const myCip = user?.cip;
  const [members, setMembers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [discussionId, setDiscussionId] = useState(null);
  const messagesAreaRef = useRef(null);
  const wsRef = useRef(null);

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
  } = useChatMessages(myCip, messagesAreaRef);

    const loadDiscussion = useCallback(async () => {
        if (!team?.equipeId) return null;
        const discussions = await getDiscussions(null, team.equipeId).catch(() => []);
        if (discussions?.[0]) {
            setDiscussionId(discussions[0].discussionId);
            return discussions[0].discussionId;
        }
        return null;
    }, [team?.equipeId]);

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
        loadDiscussion().then(did => {
            if (!did) { setLoading(false); return; }
            return getMessages(did, 50, 0)
                .then(data => {
                    setMessages(transformMessages(data));
            setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load messages:', err);
                    setLoading(false);
                });
        }),
    ]);
  }, [team?.equipeId, loadDiscussion]);

    useEffect(() => {
        if (!discussionId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const ws = new WebSocket(`ws://localhost:8888/ws/message/${discussionId}`); //`${protocol}//${host}/ws/message/${discussionId}`
        wsRef.current = ws;

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'messageReceived') {
                const updated = await getMessages(discussionId, 50, 0);
                setMessages(transformMessages(updated));
            }
        };

        ws.onerror = (err) => console.error('Team WebSocket error:', err);
        ws.onclose = () => console.log('Team WebSocket fermé');

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [discussionId]);

    async function handleSend(text, attachments) {
    if (!myCip || !team?.equipeId) return;

    const hasUploaded = (attachments || []).some(a => a.uploaded && a.fichierId);
    if (!text && !hasUploaded) return;

        let did = discussionId;
        if (!did) {
            const newDiscussion = await createDiscussion({ equipeId: team.equipeId, members: (members || []).map(m => m.id) }).catch(err => {
        console.error('Failed to create discussion:', err);
        return null;
      });
      if (newDiscussion) {
          did = newDiscussion.discussionId || newDiscussion;
          setDiscussionId(did);
      }
    }

    if (!did) return;

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
        discussionId: did,
        fichiers: fichiersPayload.length ? fichiersPayload : undefined,
      });

      const updatedMessages = await getMessages(did, 50, 0);
      setMessages(transformMessages(updatedMessages));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }



  const MEMBER_MAP = Object.fromEntries(members.map(m => [m.id, m]));

  function getSender(msg) {
    if (isOwn(msg)) {
      return { initials: initialsFromUser(user), gradient: gradientForCip(myCip) };
    }
    const member = MEMBER_MAP[msg.from];
    return {
      initials: member?.initials || '?',
      gradient: member?.gradient || '#ccc',
      name: member?.name,
    };
  }

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
          <button className="topbar-btn" aria-label="Search in chat">
            <img src={searchIcon} alt="Search" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
          </button>
          <button className="topbar-btn" aria-label="Members">
              <img src={usersIcon} alt="Users" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
          </button>
          <button className="topbar-btn" aria-label="More options">⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area" ref={messagesAreaRef} role="log" aria-live="polite">
        <ChatMessagesList
          messages={messages}
          isOwn={isOwn}
          getRelativeTime={getRelativeTime}
          hoveredMsgId={hoveredMsgId}
          setHoveredMsgId={setHoveredMsgId}
          menuMsgId={menuMsgId}
          setMenuMsgId={setMenuMsgId}
          handleDelete={handleDelete}
          getSender={getSender}
          isLoading={loading}
          emptyState={
            <div className="empty-state" style={{ margin: '40px auto' }}>
              <span className="empty-state-icon">
                  <img src={messageIcon} alt="Message" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
              </span>
              <span className="empty-state-text">No messages yet</span>
            </div>
          }
        />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        placeholder={`Message ${team?.nomEquipe || 'team'}…`}
      />

      {confirmDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete message</div>
            <div className="modal-subtitle">Are you sure you want to delete this message? This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444' }} onClick={confirmDeleteMessage}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
