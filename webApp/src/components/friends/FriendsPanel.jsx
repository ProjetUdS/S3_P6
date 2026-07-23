// src/components/friends/FriendsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import AddFriendModal from './AddFriendModal';
import { useAuth } from '../../context/AuthContext';
import { getFriendRequests, acceptFriendRequest, refuseFriendRequest } from '../../services/api';
import { gradientForCip } from '../../utils/gradient';
import searchIcon from "../../assets/icons/search.png";
import { useFriendRequestWebSocket } from '../../hooks/useFriendRequestWebSocket';
import addIcon from "../../assets/icons/add.png";

import boxIcon from "../../assets/icons/box.png";
import forbiddenIcon from "../../assets/icons/forbidden.png";
import pauseIcon from "../../assets/icons/pause-button.png";

export default function FriendsPanel({ activeFriendId, onSelectFriend, conversations: conversationsProp, expandedSections, onToggleSection, existingCips, onFriendAdded }) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState([]);

  const loadRequests = () => {
    if (user?.cip) {
      getFriendRequests(user.cip)
        .then(data => setFriendRequests(data || []))
        .catch(err => console.error('Failed to load friend requests:', err));
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user?.cip]);

  useFriendRequestWebSocket(user?.cip, (type) => {
    if (type === 'friendRequest') {
      loadRequests();
    } else if (type === 'friendAccept') {
      onFriendAdded?.();
    }
  });

  async function handleAcceptRequest(senderCip) {
    if (!user?.cip) return;
    try {
      await acceptFriendRequest(user.cip, senderCip);
      loadRequests();
      onFriendAdded?.();
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  }

  async function handleRefuseRequest(senderCip) {
    if (!user?.cip) return;
    try {
      await refuseFriendRequest(user.cip, senderCip);
      loadRequests();
    } catch (err) {
      console.error('Failed to refuse friend request:', err);
    }
  }

  const conversations = conversationsProp || [];
  const active = conversations.filter(c => ['enabled', 'active'].includes(c.etat));
  const archived = conversations.filter(c => ['archived', 'disabled'].includes(c.etat));
  const blocked = conversations.filter(c => c.etat === 'blocked');

  function renderSection(title, data, sectionKey) {
    const isExpanded = expandedSections[sectionKey];
    return (
      <>
        <div className="panel-section">
          <span className="panel-section-title">{title}</span>
          <span className="panel-section-count">{data.length}</span>
          <button className="panel-section-toggle" onClick={() => onToggleSection(sectionKey)} aria-label={isExpanded ? 'Réduire' : 'Développer'}>
            {isExpanded ? '▾' : '▸'}
          </button>
        </div>
        {isExpanded && data.map(convo => (
          <div
            key={convo.id}
            className={`list-item ${activeFriendId === convo.id ? 'active' : ''} ${convo.etat === 'archived' ? 'archived' : convo.etat === 'disabled' ? 'disabled-state' : convo.etat === 'blocked' ? 'blocked' : convo.etat === 'active' ? 'active-state' : ''}`}
            onClick={() => onSelectFriend(convo)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelectFriend(convo)}
            aria-current={activeFriendId === convo.id}
          >
            <Avatar
              initials={convo.initials}
              gradient={convo.gradient}
              size="md"
              status={convo.status}
            />
            <div className="list-item-info">
              <div className="list-item-name">{convo.name}</div>
              <div className="list-item-sub">{convo.sub}</div>
            </div>
            <span className={`conversation-badge ${convo.etat}`}>
              {convo.etat === 'archived' ? (
                <img src={boxIcon} alt="Archived" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              ) : convo.etat === 'disabled' ? (
                <img src={pauseIcon} alt="Disabled" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              ) : convo.etat === 'blocked' ? (
                <img src={forbiddenIcon} alt="Blocked" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
              ) : (
                ''
              )}
            </span>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="left-panel">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title">Messages</div>
          <div className="search-bar">
            <span aria-hidden="true">
                <img src={searchIcon} alt="Search" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            </span>
            <input
              type="text"
              placeholder="Search friends…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search friends"
            />
          </div>
        </div>

        {/* Friend Requests List */}
        {friendRequests.length > 0 && (
          <div className="friend-requests-section" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Friend Requests ({friendRequests.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {friendRequests.map(reqCip => (
                <div key={reqCip} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '12px' }}>
                    <Avatar initials={reqCip.substring(0, 2).toUpperCase()} gradient={gradientForCip(reqCip)} size="sm" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{reqCip}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => handleAcceptRequest(reqCip)}
                      style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRefuseRequest(reqCip)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Refuse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div className="panel-list">
          {renderSection('Conversations actives', active, 'active')}
          {renderSection('Archivées', archived, 'archived')}
          {renderSection('Bloquées', blocked, 'blocked')}

          <button className="panel-add-btn" onClick={() => setShowModal(true)}>
              <img src={addIcon} alt="Add" style={{ width: '10px', height: '10px', objectFit: 'contain' }}/>
              Add a friend
          </button>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showModal && <AddFriendModal onClose={() => setShowModal(false)} existingCips={existingCips} onAdded={onFriendAdded} />}
    </>
  );
}
