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

  return (
    <aside className="left-panel" aria-label="Teams">
      <div className="panel-header">
        <div className="panel-title">Équipes</div>
        <div className="search-bar">
          <span>🔍</span>
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

      {loading ? (
        <div className="loading-spinner" style={{ margin: '40px auto' }} />
      ) : filtered.length === 0 ? (
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
