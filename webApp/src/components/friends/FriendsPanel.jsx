// src/components/friends/FriendsPanel.jsx
import React, { useState } from 'react';
import { Avatar } from '../shared/Avatar';
import AddFriendModal from './AddFriendModal';

/**
 * FriendsPanel  — left panel showing the friends list + "Add friend" button.
 *
 * Props:
 *   activeFriendId  {string|null}  – id of currently selected friend
 *   onSelectFriend  (friend) => void
 *   friends         {Array}        – friends data from API
 */
export default function FriendsPanel({ activeFriendId, onSelectFriend, friends: friendsProp }) {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery]         = useState('');

  const friends = friendsProp || [];
  const filtered = query
    ? friends.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : friends;

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
          <div className="panel-section">Friends</div>

          <button className="panel-add-btn" onClick={() => setShowModal(true)}>
            <span aria-hidden="true">➕</span>
            Add a friend
          </button>

          {filtered.map(friend => (
            <div
              key={friend.id}
              className={`list-item ${activeFriendId === friend.id ? 'active' : ''}`}
              onClick={() => onSelectFriend(friend)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelectFriend(friend)}
              aria-current={activeFriendId === friend.id}
            >
              <Avatar
                initials={friend.initials}
                gradient={friend.gradient}
                size="md"
                status={friend.status}
              />
              <div className="list-item-info">
                <div className="list-item-name">{friend.name}</div>
                <div className="list-item-sub">{friend.sub}</div>
              </div>
              {friend.unread > 0 && (
                <span className="badge" aria-label={`${friend.unread} unread messages`}>
                  {friend.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showModal && <AddFriendModal onClose={() => setShowModal(false)} />}
    </>
  );
}
