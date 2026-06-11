// src/components/friends/FriendsPanel.jsx
import React, { useState } from 'react';
import { Avatar } from '../shared/Avatar';
import AddFriendModal from './AddFriendModal';

export default function FriendsPanel({ activeFriendId, onSelectFriend, conversations: conversationsProp, expandedSections, onToggleSection, existingCips, onFriendAdded }) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');

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
              {convo.etat === 'archived' ? '📦' : convo.etat === 'disabled' ? '⏸️' : convo.etat === 'blocked' ? '🚫' : convo.etat === 'active' ? '🔵' : ''}
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
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search friends…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search friends"
            />
          </div>
        </div>

        {/* List */}
        <div className="panel-list">
          {renderSection('Conversations actives', active, 'active')}
          {renderSection('Archivées', archived, 'archived')}
          {renderSection('Bloquées', blocked, 'blocked')}

          <button className="panel-add-btn" onClick={() => setShowModal(true)}>
            <span aria-hidden="true">➕</span>
            Add a friend
          </button>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showModal && <AddFriendModal onClose={() => setShowModal(false)} existingCips={existingCips} onAdded={onFriendAdded} />}
    </>
  );
}
