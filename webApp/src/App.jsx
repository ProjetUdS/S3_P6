// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import FriendsPanel from './components/friends/FriendsPanel';
import ChatView from './components/chat/ChatView';
import TeamsPanel from './components/teams/TeamsPanel';
import TeamArea from './components/teams/TeamArea';
import NotificationsPanel from './components/notifications/NotificationsPanel';
import { getContacts, getConversations, getEquipes } from './services/api';
import { gradientForCip, initialsFromUser } from './utils/gradient';
import messageIcon from './assets/icons/message.png';
import teamIcon from './assets/icons/team.png'

import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';
import {useEquipeWebSocket} from "./hooks/useEquipeWebSocket.js";

export default function App() {
    const { authenticated, user, token, loading } = useAuth();
    const [view, setView] = useState('messages');
    const [activeFriend, setActiveFriend] = useState(null);
    const [activeTeam, setActiveTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [expandedSections, setExpandedSections] = useState({ active: true, archived: false, blocked: false });
    const [hasNotif, setHasNotif] = useState(false);
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);

    function handleNav(key) {
        if (key === view) {
            setIsLeftPanelVisible(prev => !prev);
        } else {
            setView(key);
            setIsLeftPanelVisible(true);
        }
        if (key === 'notifs') {
            setHasNotif(false);
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

  function handleSelectFriend(friend) {
    setActiveFriend(friend);
    if (friend && window.innerWidth <= 768) {
      setIsLeftPanelVisible(false);
    } else if (!friend) {
      setIsLeftPanelVisible(true);
    }
  }

  function handleSelectTeam(team) {
    setActiveTeam(team);
    if (team && window.innerWidth <= 768) {
      setIsLeftPanelVisible(false);
    } else if (!team) {
      setIsLeftPanelVisible(true);
    }
  }

  useEffect(() => {
    const handleTeamLeft = (e) => {
      loadTeams();
      if (activeTeam?.equipeId === e.detail.equipeId) {
        setActiveTeam(null);
      }
    };
    window.addEventListener('team-left', handleTeamLeft);
    return () => window.removeEventListener('team-left', handleTeamLeft);
  }, [activeTeam]);

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

  useEquipeWebSocket(user?.cip, token, () => {
      loadTeams();
  });

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
          <div className="loading-spinner" />
          <p>Authentification en cours...</p>
        </div>
      </div>
    );
  }

    return (
        <div className={`app-shell ${isLeftPanelVisible ? '' : 'left-panel-hidden'}`}>
            <Sidebar activeView={view} onNav={handleNav} hasNotif={hasNotif} />

            {view === 'messages' && (
                <>
                    <FriendsPanel
                        activeFriendId={activeFriend?.id}
                        onSelectFriend={handleSelectFriend}
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
                            onDeleteConversation={() => handleSelectFriend(null)}
                            onStateChanged={loadConversations}
                            activeFriend={activeFriend}
                            onNotif={() => setHasNotif(true)}
                        />
                        : (
                            <div className="main-area">
                                <div className="empty-state">
                                    <img src={messageIcon} alt="Message icon" className="empty-state-icon" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
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
                        onSelectTeam={handleSelectTeam}
                        onTeamDeleted={handleTeamDeleted}
                        onTeamCreated={loadTeams}
                    />
                    {activeTeam
                        ? <TeamArea team={activeTeam} key={activeTeam.id} />
                        : (
                            <div className="main-area">
                                <div className="empty-state">
                                    <img src={teamIcon} alt="Team icon" className="empty-state-icon" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                                    <span className="empty-state-text">Select or create a team</span>
                                </div>
                            </div>
                        )
                    }
                </>
            )}
            {view === 'notifs' && (
                <NotificationsPanel />
            )}
        </div>
    );
}
