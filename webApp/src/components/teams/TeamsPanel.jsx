// src/components/teams/TeamsPanel.jsx
import React, { useState } from 'react';
import { TeamIcon } from '../shared/Avatar';
import { TEAMS } from '../../data/mockData';

/**
 * TeamsPanel  — left panel listing teams and a "Create a team" button.
 *
 * Props:
 *   activeTeamId   {string|null}
 *   onSelectTeam   (team) => void
 */
export default function TeamsPanel({ activeTeamId, onSelectTeam }) {
  const [query, setQuery] = useState('');

  const filtered = query
    ? TEAMS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : TEAMS;

  return (
    <div className="left-panel">
      <div className="panel-header">
        <div className="panel-title">Teams</div>
        <div className="search-bar">
          <span aria-hidden="true">🔍</span>
          <input
            type="text"
            placeholder="Search teams…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search teams"
          />
        </div>
      </div>

      <div className="panel-list">
        <div className="panel-section">My Teams</div>

        {filtered.map(team => (
          <div
            key={team.id}
            className={`list-item ${activeTeamId === team.id ? 'active' : ''}`}
            onClick={() => onSelectTeam(team)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelectTeam(team)}
            aria-current={activeTeamId === team.id}
          >
            <TeamIcon initials={team.initials} gradient={team.gradient} size="md" />
            <div className="list-item-info">
              <div className="list-item-name">{team.name}</div>
              <div className="list-item-sub">{team.memberCount} members</div>
            </div>
            {team.unread > 0 && (
              <span className="badge" aria-label={`${team.unread} unread`}>
                {team.unread}
              </span>
            )}
          </div>
        ))}

        <button className="panel-create-team-btn">
          <span aria-hidden="true">➕</span>
          Create a team
        </button>
      </div>
    </div>
  );
}
