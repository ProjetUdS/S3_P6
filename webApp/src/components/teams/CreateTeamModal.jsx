import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { getContacts, createEquipe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateTeamModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedCips, setSelectedCips] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.cip) {
      getContacts(user.cip).then(setContacts).catch(() => setError('Failed to load contacts'));
    }
  }, [user]);

  function toggleContact(cip) {
    setSelectedCips(prev => {
      const next = new Set(prev);
      if (next.has(cip)) next.delete(cip); else next.add(cip);
      return next;
    });
  }

  async function handleCreate() {
    if (!teamName.trim()) return;
    setError(null);
    try {
      await createEquipe(teamName.trim(), user.cip, [...selectedCips]);
      onCreated();
    } catch (e) {
      setError(e.message || 'Failed to create team');
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Créer une équipe</h2>

        <input
          className="modal-input"
          placeholder="Nom de l'équipe"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />

        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)' }}>Membres</div>

        {loading && <div style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 8 }}>Chargement...</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</div>}

        <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 12 }}>
          {contacts.map(c => (
            <div
              key={c.cip}
              onClick={() => toggleContact(c.cip)}
              className="suggestion-item"
              style={{
                background: selectedCips.has(c.cip) ? 'var(--purple-bg)' : 'var(--bg-secondary)',
                borderColor: selectedCips.has(c.cip) ? 'var(--purple)' : 'var(--border)',
              }}
            >
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: `2px solid ${selectedCips.has(c.cip) ? 'var(--purple)' : 'var(--border)'}`,
                flexShrink: 0,
              }} />
              <Avatar initials={c.pseudo?.substring(0, 2).toUpperCase() || '?'} gradient="var(--grad-sr)" size="sm" />
              <div className="suggestion-info">
                <div className="suggestion-name">{c.prenom} {c.nom}</div>
                <div className="suggestion-email">{c.courriel}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={!teamName.trim()}
            style={{ opacity: teamName.trim() ? 1 : 0.5 }}
          >Créer</button>
        </div>
      </div>
    </div>
  );
}
