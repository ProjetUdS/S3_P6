// src/components/friends/AddFriendModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar } from '../shared/Avatar';
import { searchUsers, addContact, getSentFriendRequests } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';

export default function AddFriendModal({ onClose, existingCips, onAdded }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());
  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (user?.cip) {
      getSentFriendRequests(user.cip)
        .then(data => setSentRequests(new Set(data || [])))
        .catch(err => console.error('Failed to load sent requests:', err));
    }
  }, [user?.cip]);

  const performSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchUsers(searchQuery);
      const filtered = (data || []).filter(u => u.cip !== user?.cip);
      setResults(filtered);
    } catch (err) {
      console.error('Failed to search users:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.cip]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    searchTimerRef.current = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [query, performSearch]);

  async function handleAdd(cip) {
    if (!user?.cip || added.has(cip) || sentRequests.has(cip)) return;
    try {
      await addContact(user.cip, cip);
      setAdded(prev => new Set(prev).add(cip));
      setSentRequests(prev => new Set(prev).add(cip));
      onAdded?.();
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const existingCipSet = new Set(existingCips || []);

  function SearchResult({ u, isExisting, isSent }) {
    const addedTo = added.has(u.cip);
    const sent = sentRequests.has(u.cip);
    const { avatarUrl } = useAvatarUrl(u.cip);
    return (
      <li className="suggestion-item">
        <Avatar
          initials={initialsFromUser(u)}
          gradient={gradientForCip(u.cip)}
          size="md"
          src={avatarUrl}
          alt={u.pseudo || 'Photo de profil'}
        />
        <div className="suggestion-info">
          <div className="suggestion-name">{[u.prenom, u.nom].filter(Boolean).join(' ') || u.pseudo}</div>
          <div className="suggestion-email">{u.pseudo}</div>
        </div>
        <button
          className="suggestion-add"
          onClick={() => handleAdd(u.cip)}
          aria-label={`Add ${u.pseudo}`}
          disabled={addedTo || sent || isExisting}
        >
          {addedTo || sent ? '✓ Requested' : isExisting ? 'Already friend' : '+ Add'}
        </button>
      </li>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 className="modal-title" id="modal-title">Add a friend</h2>
        <p className="modal-subtitle">Search by name to find users</p>

        <input
          className="modal-input"
          type="text"
          placeholder="Enter name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          aria-label="Search for a friend"
        />

        {loading && <div className="loading-spinner" style={{ margin: '10px 0' }} />}

        {!loading && results.length > 0 && (
          <ul className="suggestion-list" aria-label="Search results">
            {results.map(u => (
              <SearchResult
                key={u.cip}
                u={u}
                isExisting={existingCipSet.has(u.cip)}
                isSent={sentRequests.has(u.cip)}
              />
            ))}
          </ul>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <span className="empty-state-text">No users found</span>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}