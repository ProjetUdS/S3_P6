import React, { useState, useRef } from 'react';
import { TeamIcon } from '../shared/Avatar';
import { deleteEquipe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import CreateTeamModal from './CreateTeamModal';

import searchIcon from '../../assets/icons/search.png'

export default function TeamsPanel({ activeTeamId, teams: teamsProp, onSelectTeam, onTeamDeleted, onTeamCreated }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmEquipeId, setDeleteConfirmEquipeId] = useState(null);

  const teams = teamsProp || [];

  const filtered = teams.filter(t =>
    t.nomEquipe.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDeleteEquipe(equipeId) {
    try {
      await deleteEquipe(equipeId);
      if (onTeamDeleted) {
        onTeamDeleted(equipeId);
      }
    } catch (err) {
      console.error('Failed to delete team:', err);
    } finally {
      setDeleteConfirmEquipeId(null);
    }
  }

  return (
    <aside className="left-panel" aria-label="Teams">
      <div className="panel-header">
        <div className="panel-title">Équipes</div>
        <div className="search-bar">
            <img src={searchIcon} alt="Search" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <input
            placeholder="Rechercher"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <button
        className="panel-create-team-btn"
        onClick={() => setShowCreateModal(true)}
        aria-label="Créer une équipe"
      >
        + Nouvelle équipe
      </button>

      {filtered.length === 0 ? (
        <div className="panel-section">Aucune équipe</div>
      ) : (
        <ul className="panel-list" role="listbox">
          {filtered.map(team => (
            <li key={team.equipeId}>
              <button
                className={`list-item ${team.equipeId === activeTeamId ? 'active' : ''}`}
                onClick={() => onSelectTeam(team)}
                aria-label={team.nomEquipe}
              >
                <TeamIcon
                  initials={team.nomEquipe.substring(0, 1).toUpperCase()}
                  gradient="var(--grad-sr)"
                  size="md"
                />
                <div className="list-item-info">
                  <div className="list-item-name">{team.nomEquipe}</div>
                </div>
                {user?.cip === team.administrateurCip && (
                  <button
                    className="list-item-delete"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmEquipeId(team.equipeId); }}
                    aria-label="Delete team"
                    title="Delete team"
                  >
                    ×
                  </button>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Delete team confirmation modal */}
      {deleteConfirmEquipeId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmEquipeId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete team</div>
            <div className="modal-subtitle">Are you sure you want to delete this team? This action cannot be undone.</div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirmEquipeId(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => handleDeleteEquipe(deleteConfirmEquipeId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            if (onTeamCreated) onTeamCreated();
          }}
        />
      )}
    </aside>
  );
}
