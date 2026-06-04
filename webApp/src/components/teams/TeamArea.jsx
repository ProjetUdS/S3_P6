// src/components/teams/TeamArea.jsx
import React, { useState } from 'react';
import TeamChat from './TeamChat';
import TeamPlanning from './TeamPlanning';

/**
 * TeamArea  — the main content for a selected team.
 * Contains a tab bar that switches between Chat and Planning views.
 *
 * Props:
 *   team  – the selected team object
 */
export default function TeamArea({ team }) {
  const [activeTab, setActiveTab] = useState('planning'); // 'chat' | 'planning'

  return (
    <div className="main-area">
      {/* Tab Bar */}
      <div className="tab-bar" role="tablist" aria-label={`${team.name} team`}>
        <button
          role="tab"
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          aria-selected={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
        >
          💬  Chat
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'planning' ? 'active' : ''}`}
          aria-selected={activeTab === 'planning'}
          onClick={() => setActiveTab('planning')}
        >
          📋  Planning
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'chat'     && <TeamChat team={team} />}
      {activeTab === 'planning' && <TeamPlanning team={team} />}
    </div>
  );
}
