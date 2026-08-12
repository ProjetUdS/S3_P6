import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { getContacts, addTeamMember } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';

function ContactAvatar({ contact }) {
  const { avatarUrl } = useAvatarUrl(contact.cip);
  return (
    <Avatar
      initials={contact.pseudo?.substring(0, 2).toUpperCase() || '?'}
      gradient="var(--grad-sr)"
      size="sm"
      src={avatarUrl}
      alt={contact.pseudo}
    />
  );
}

export default function InviteMemberModal({ equipeId, existingMemberCips = [], onClose, onAdded }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCip, setSelectedCip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.cip) return;
    setLoading(true);
    setError(null);
    getContacts(user.cip)
      .then(data => {
        // Filter out contacts who are already members
        const filtered = (data || []).filter(c => !existingMemberCips.includes(c.cip));
        setContacts(filtered);
      })
      .catch(err => {
        console.error('Failed to load contacts:', err);
        setError('Impossible de charger les contacts.');
      })
      .finally(() => setLoading(false));
  }, [user?.cip, existingMemberCips]);

  async function handleInvite() {
    if (!selectedCip || !equipeId) return;
    setInviting(true);
    setError(null);
    try {
      await addTeamMember(equipeId, selectedCip);
      onAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add team member:', err);
      setError("Erreur lors de l'ajout du membre à l'équipe.");
    } finally {
      setInviting(false);
    }
  }

  // Filter contacts by search query
  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase();
    const fullName = `${c.prenom || ''} ${c.nom || ''}`.toLowerCase();
    const email = (c.courriel || '').toLowerCase();
    const pseudo = (c.pseudo || '').toLowerCase();
    const cip = (c.cip || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || pseudo.includes(q) || cip.includes(q);
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: '400px', maxWidth: '95%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px'
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="modal-title">Inviter un membre</h2>
        <p className="modal-subtitle">Sélectionnez un contact de votre liste d'amis à ajouter</p>

        <input
          className="modal-input"
          placeholder="Rechercher par nom, pseudo, courriel..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setSelectedCip(null); // Reset selection when searching
          }}
          autoFocus
        />

        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            Chargement des contacts...
          </div>
        ) : error ? (
          <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>
        ) : filteredContacts.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            {contacts.length === 0 ? "Vous n'avez pas de contacts dans votre liste d'amis." : 'Aucun contact correspondant.'}
          </div>
        ) : (
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {filteredContacts.map(c => {
              const isSelected = selectedCip === c.cip;
              return (
                <div
                  key={c.cip}
                  onClick={() => setSelectedCip(isSelected ? null : c.cip)}
                  className="suggestion-item"
                  style={{
                    background: isSelected ? 'var(--blue-bg)' : 'var(--bg-secondary)',
                    borderColor: isSelected ? 'var(--blue)' : 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--blue)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isSelected && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                    )}
                  </div>
                  <ContactAvatar contact={c} />
                  <div className="suggestion-info" style={{ flex: 1 }}>
                    <div className="suggestion-name" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.prenom} {c.nom}
                    </div>
                    <div className="suggestion-email" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {c.courriel} ({c.cip})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button className="btn-cancel" onClick={onClose} disabled={inviting}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleInvite}
            disabled={!selectedCip || inviting}
            style={{ opacity: selectedCip && !inviting ? 1 : 0.5 }}
          >
            {inviting ? 'Invitation...' : 'Inviter'}
          </button>
        </div>
      </div>
    </div>
  );
}