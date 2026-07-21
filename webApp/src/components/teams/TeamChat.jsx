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

    useEffect(() => {
        if (!team?.equipeId || !myCip) {
            setLoading(false);
            return;
        }

        setLoading(true);
        let cancelled = false;

        async function init() {
            const memberData = await getTeamMembers(team.equipeId).catch(err => {
                console.error('Failed to load team members:', err);
                return [];
            });
            const transformed = (memberData || []).map(m => {
                const name = [m.prenom, m.nom].filter(Boolean).join(' ') || m.pseudo || 'Unknown';
                return {
                    id: m.cip,
                    name,
                    initials: m.pseudo?.substring(0, 2).toUpperCase() || '?',
                    gradient: gradientForCip(m.cip),
                };
            });
            if (cancelled) return;
            setMembers(transformed);

            const memberCips = transformed.map(m => m.id);
            const discussions = await getDiscussions(null, team.equipeId).catch(() => []);
            let did = discussions?.[0]?.discussionId;

            if (!did) {
                console.log('TeamChat: creating discussion for equipe', team.equipeId);
                const newDiscussion = await createDiscussion({
                    equipeId: team.equipeId,
                    members: memberCips,
                }).catch(err => {
                    console.error('Failed to create discussion:', err);
                    return null;
                });
                if (newDiscussion) {
                    did = newDiscussion.discussionId || newDiscussion;
                    console.log('TeamChat: createDiscussion returned', did);
                    const verify = await getDiscussions(null, team.equipeId).catch(() => []);
                    if (verify?.[0]) {
                        const verifiedDid = verify[0].discussionId;
                        console.log('TeamChat: verify returned discussion', verifiedDid, '(was', did + ')');
                        did = verifiedDid;
                    }
                }
            } else {
                console.log('TeamChat: found existing discussion', did);
            }

            if (!did || cancelled) {
                if (!cancelled) setLoading(false);
                return;
            }

            console.log('TeamChat: using discussion', did);
            setDiscussionId(did);

            const data = await getMessages(did, 50, 0).catch(err => {
                console.error('Failed to load messages:', err);
                return [];
            });
            if (!cancelled) {
                setMessages(transformMessages(data));
                setLoading(false);
            }
        }

        init();

        return () => { cancelled = true; };
    }, [team?.equipeId, myCip]);

    useEffect(() => {
        if (!discussionId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/message/${discussionId}`;
        console.log('TeamChat WS connecting to', wsUrl);
        const ws = new WebSocket(`${protocol}//${host}/ws/message/${discussionId}`);
        wsRef.current = ws;

        ws.onopen = () => console.log('TeamChat WS open for', discussionId);

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('TeamChat WS got', data.type, 'for', data.discussionId);
                if (data.type === 'messageReceived') {
                    const updated = await getMessages(discussionId, 50, 0);
                    console.log('TeamChat WS reloaded', updated.length, 'msgs');
                    setMessages(transformMessages(updated));
                }
            } catch (err) {
                console.error('Team WS msg err:', err);
            }
        };

        ws.onerror = (err) => console.error('Team WS err:', err);
        ws.onclose = (e) => console.log('Team WS close:', e.code, e.reason);

        return () => {
            console.log('TeamChat WS cleanup');
            ws.close();
            wsRef.current = null;
        };
    }, [discussionId]);

/*
    useEffect(() => {
        if (!discussionId) return;

        console.log('TeamChat start polling for', discussionId);
        const timer = setInterval(async () => {
            try {
                const data = await getMessages(discussionId, 50, 0);

        setMessages(transformMessages(data));
    } catch (err) {
        console.error('Team polling err:', err);
    }
}, 2000);
return () => {
    clearInterval(timer);
    console.log('TeamChat stop polling');
};
}, [discussionId]);*/

    async function handleSend(text, attachments) {
        if (!myCip || !team?.equipeId || !discussionId) return;

        const hasUploaded = (attachments || []).some(a => a.uploaded && a.fichierId);
        if (!text && !hasUploaded) return;

        const fichiersPayload = (attachments || []).filter(a => a.uploaded && a.fichierId).map(a => ({
            fichierId: a.fichierId,
            nomOriginal: a.file.name,
            typeMime: a.file.type,
            tailleOctets: a.file.size,
            cip: myCip,
        }));

        try {
            console.log('TeamChat: sending message to discussion', discussionId);
            await sendMessage({
                contenu: text,
                cip: myCip,
                discussionId: discussionId,
                fichiers: fichiersPayload.length ? fichiersPayload : undefined,
            });
            console.log('TeamChat: message sent to discussion', discussionId);

            const updatedMessages = await getMessages(discussionId, 50, 0);
            console.log('TeamChat: reloaded', updatedMessages.length, 'messages from discussion', discussionId);
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