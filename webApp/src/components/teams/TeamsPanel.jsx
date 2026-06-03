import React, { useState, useEffect, useRef } from 'react';
import { TeamIcon } from '../shared/Avatar';
import { getEquipes } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateTeamModal from './CreateTeamModal';

export default function TeamsPanel({ activeTeamId, onSelectTeam }) {
  const { user } = useAuth();
  const userRef = useRef(user);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (user?.cip) {
      getEquipes(user.cip)
        .then(data => { setTeams(data || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const filtered = teams.filter(t =>
    t.nomEquipe.toLowerCase().includes(search.toLowerCase())
  );

  const gradient = 'linear-gradient(135deg, #7c6af7, #a78bfa)';

  return (
    <aside className="left-panel" aria-label="Teams">
      <input
        className="panel-search"
        placeholder="Rechercher une équipe"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <button
        className="panel-add-btn"
        onClick={() => setShowCreateModal(true)}
        aria-label="Créer une équipe"
      >
        + Créer une équipe
      </button>

      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-list">Aucune équipe</div>
      ) : (
        <ul className="panel-list" role="listbox">
          {filtered.map(team => (
            <li key={team.equipeId}>
              <button
                className={`panel-item ${team.equipeId === activeTeamId ? 'active' : ''}`}
                onClick={() => onSelectTeam(team)}
                aria-label={team.nomEquipe}
              >
                <TeamIcon
                  initials={team.nomEquipe.substring(0, 1).toUpperCase()}
                  gradient={gradient}
                  size="md"
                />
                <span className="panel-item-label">{team.nomEquipe}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            getEquipes(userRef.current.cip).then(data => setTeams(data || []));
          }}
        />
      )}
    </aside>
  );
}
