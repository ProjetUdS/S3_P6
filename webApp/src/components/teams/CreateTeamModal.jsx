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
    } else {
      setLoading(false);
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

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  };
  const cardStyle = {
    background: '#fff', borderRadius: 14, padding: 24, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  };
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dcdce4',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const listStyle = { maxHeight: 200, overflowY: 'auto', marginTop: 12 };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Créer une équipe</h2>

        <input
          style={inputStyle}
          placeholder="Nom de l'équipe"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />

        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 500, color: '#5a5a6e' }}>Membres</div>

        {loading && <div style={{ color: '#a0a0b4', fontSize: 13, marginTop: 8 }}>Chargement...</div>}
        {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}</div>}

        <div style={listStyle}>
          {contacts.map(c => (
            <div
              key={c.cip}
              onClick={() => toggleContact(c.cip)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px',
                cursor: 'pointer', borderRadius: 8,
                background: selectedCips.has(c.cip) ? 'rgba(124,106,247,0.08)' : 'transparent',
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${selectedCips.has(c.cip) ? '#7c6af7' : '#dcdce4'}`, flexShrink: 0 }} />
              <Avatar initials={c.pseudo?.substring(0, 2).toUpperCase() || '?'} gradient="linear-gradient(135deg, #7c6af7, #a78bfa)" size="sm" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.prenom} {c.nom}</div>
                <div style={{ fontSize: 11, color: '#a0a0b4' }}>{c.courriel}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, background: 'transparent', color: '#5a5a6e',
            }}
          >Annuler</button>
          <button
            onClick={handleCreate}
            disabled={!teamName.trim()}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: teamName.trim() ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 500, background: teamName.trim() ? '#7c6af7' : '#dcdce4',
              color: '#fff',
            }}
          >Créer</button>
        </div>
      </div>
    </div>
  );
}
