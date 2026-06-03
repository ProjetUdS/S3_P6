// src/components/friends/AddFriendModal.jsx
import React, { useState } from 'react';
import { Avatar } from '../shared/Avatar';
import { SUGGESTIONS } from '../../data/mockData';

/**
 * AddFriendModal  — modal to search for and add a friend.
 *
 * Props:
 *   onClose  () => void
 */
export default function AddFriendModal({ onClose }) {
  const [query, setQuery]   = useState('');
  const [added, setAdded]   = useState(new Set());

  const results = query.length >= 2
    ? SUGGESTIONS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS; // show suggestions by default

  function handleAdd(id) {
    setAdded(prev => new Set(prev).add(id));
  }

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 className="modal-title" id="modal-title">Add a friend</h2>
        <p className="modal-subtitle">Search by name or email address</p>

        <input
          className="modal-input"
          type="text"
          placeholder="Name or email…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          aria-label="Search for a friend"
        />

        {results.length > 0 && (
          <ul className="suggestion-list" aria-label="Search results">
            {results.map(s => (
              <li key={s.id} className="suggestion-item">
                <Avatar initials={s.initials} gradient={s.gradient} size="md" />
                <div className="suggestion-info">
                  <div className="suggestion-name">{s.name}</div>
                  <div className="suggestion-email">{s.email}</div>
                </div>
                <button
                  className="suggestion-add"
                  onClick={() => handleAdd(s.id)}
                  aria-label={`Add ${s.name}`}
                  disabled={added.has(s.id)}
                >
                  {added.has(s.id) ? '✓ Added' : '+ Add'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onClose}>Send request</button>
        </div>
      </div>
    </div>
  );
}
