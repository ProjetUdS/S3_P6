// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import FriendsPanel from './components/friends/FriendsPanel';
import ChatView from './components/chat/ChatView';
import TeamsPanel from './components/teams/TeamsPanel';
import TeamArea from './components/teams/TeamArea';
import { getContacts, getConversations, getEquipes } from './services/api';
import { gradientForCip, initialsFromUser } from './utils/gradient';

import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

export default function App() {
    const { authenticated, user, loading } = useAuth();
    const [view, setView] = useState('messages');
    const [activeFriend, setActiveFriend] = useState(null);
    const [activeTeam, setActiveTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [expandedSections, setExpandedSections] = useState({ active: true, archived: false, blocked: false });
    const [hasNotif, setHasNotif] = useState(false);

    function handleNav(key) {
        if (key === 'messages') setView('messages');
        if (key === 'teams') setView('teams');
        if (key === 'notifs') {
            setHasNotif(false);
            setView('notifs');
        }
    }

  function loadConversations() {
    if (!user?.cip) return;
    getConversations(user.cip)
      .then(data => {
        const transformed = (data || []).map(c => ({
          id: c.cip,
          cip: c.cip,
          name: c.pseudo,
          initials: initialsFromPseudo(c.pseudo),
          status: 'online',
          sub: 'Active now',
          gradient: gradientForCip(c.cip),
          etat: c.etat,
          discussionId: c.discussionId || null,
        }));
        setConversations(transformed);

        if (activeFriend?.cip) {
          const updated = transformed.find(c => c.cip === activeFriend.cip);
          if (updated) {
            setActiveFriend(updated);
          }
        }
      })
      .catch(err => console.error('Failed to load conversations:', err));
  }

  function initialsFromPseudo(pseudo) {
    if (!pseudo) return '?';
    const parts = pseudo.split(/[\s_]+/).filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function loadTeams() {
    if (!user?.cip) return;
    getEquipes(user.cip)
      .then(data => {
        setTeams(data || []);
      })
      .catch(err => console.error('Failed to load teams:', err));
  }

  function handleTeamDeleted(deletedId) {
    loadTeams();
    if (activeTeam?.equipeId === deletedId) {
      setActiveTeam(null);
    }
  }

  useEffect(() => {
    if (authenticated && user?.cip) {
      loadConversations();
      loadTeams();
    }
  }, [authenticated, user?.cip]);

  useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0]);
    }
  }, [teams]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="app-shell">
        <div className="loading-screen">
          <p>Authentification en cours...</p>
        </div>
      </div>
    );
  }

    return (
        <div className="app-shell">
            <Sidebar activeView={view} onNav={handleNav} hasNotif={hasNotif} />

            {view === 'messages' && (
                <>
                    <FriendsPanel
                        activeFriendId={activeFriend?.id}
                        onSelectFriend={setActiveFriend}
                        conversations={conversations}
                        expandedSections={expandedSections}
                        onToggleSection={toggleSection}
                        existingCips={conversations.map(c => c.cip)}
                        onFriendAdded={loadConversations}
                    />
                    {activeFriend
                        ? <ChatView
                            friend={activeFriend}
                            key={activeFriend.id}
                            conversations={conversations}
                            discussionId={activeFriend.discussionId}
                            onDeleteConversation={() => setActiveFriend(null)}
                            onStateChanged={loadConversations}
                            activeFriend={activeFriend}
                            onNotif={() => setHasNotif(true)}
                        />
                        : (
                            <div className="main-area">
                                <div className="empty-state">
                                    <span className="empty-state-icon">💬</span>
                                    <span className="empty-state-text">Select a friend to start chatting</span>
                                </div>
                            </div>
                        )
                    }
                </>
            )}

            {view === 'teams' && (
                <>
                    <TeamsPanel
                        activeTeamId={activeTeam?.equipeId}
                        teams={teams}
                        onSelectTeam={setActiveTeam}
                        onTeamDeleted={handleTeamDeleted}
                        onTeamCreated={loadTeams}
                    />
                    {activeTeam
                        ? <TeamArea team={activeTeam} key={activeTeam.id} />
                        : (
                            <div className="main-area">
                                <div className="empty-state">
                                    <span className="empty-state-icon">👥</span>
                                    <span className="empty-state-text">Select or create a team</span>
                                </div>
                            </div>
                        )
                    }
                </>
            )}
        </div>
    );
}
