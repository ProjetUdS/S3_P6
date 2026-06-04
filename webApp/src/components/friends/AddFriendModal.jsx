// src/components/friends/AddFriendModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar } from '../shared/Avatar';
import { searchUsers, addContact } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

export default function AddFriendModal({ onClose, existingCips, onAdded }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(new Set());
  const searchTimerRef = useRef(null);

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
    if (!user?.cip || added.has(cip)) return;
    try {
      await addContact(user.cip, cip);
      setAdded(prev => new Set(prev).add(cip));
      onAdded?.();
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const existingCipSet = new Set(existingCips || []);

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
            {results.map(u => {
              const isExisting = existingCipSet.has(u.cip);
              return (
                <li key={u.cip} className="suggestion-item">
                  <Avatar initials={initialsFromUser(u)} gradient={gradientForCip(u.cip)} size="md" />
                  <div className="suggestion-info">
                    <div className="suggestion-name">{[u.prenom, u.nom].filter(Boolean).join(' ') || u.pseudo}</div>
                    <div className="suggestion-email">{u.pseudo}</div>
                  </div>
                  <button
                    className="suggestion-add"
                    onClick={() => handleAdd(u.cip)}
                    aria-label={`Add ${u.pseudo}`}
                    disabled={added.has(u.cip) || isExisting}
                  >
                    {added.has(u.cip) ? '✓ Added' : isExisting ? 'Already friend' : '+ Add'}
                  </button>
                </li>
              );
            })}
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
