// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import FriendsPanel from './components/friends/FriendsPanel';
import ChatView from './components/chat/ChatView';
import TeamsPanel from './components/teams/TeamsPanel';
import TeamArea from './components/teams/TeamArea';
import { getContacts } from './services/api';
import { gradientForCip, initialsFromUser } from './utils/gradient';

import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

export default function App() {
  const { authenticated, user, loading } = useAuth();
  const [view, setView] = useState('messages');
  const [activeFriend, setActiveFriend] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [friends, setFriends] = useState([]);

  function loadContacts() {
    if (!user?.cip) return;
    getContacts(user.cip)
      .then(data => {
        const transformed = (data || []).map(c => ({
          id: c.cip,
          cip: c.cip,
          name: `${c.prenom || ''} ${c.nom || ''}`.trim() || c.pseudo,
          initials: initialsFromUser(c),
          status: 'online',
          sub: 'Active now',
          gradient: gradientForCip(c.cip),
        }));
        setFriends(transformed);
      })
      .catch(err => console.error('Failed to load contacts:', err));
  }

  useEffect(() => {
    if (authenticated && user?.cip) {
      loadContacts();
    }
  }, [authenticated, user?.cip]);

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

  function handleNav(key) {
    if (key === 'messages') setView('messages');
    if (key === 'teams') setView('teams');
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={view} onNav={handleNav} />

      {view === 'messages' && (
        <>
          <FriendsPanel
            activeFriendId={activeFriend?.id}
            onSelectFriend={setActiveFriend}
            friends={friends}
            existingCips={friends.map(f => f.id)}
            onFriendAdded={loadContacts}
          />
          {activeFriend
            ? <ChatView friend={activeFriend} key={activeFriend.id} />
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
            activeTeamId={activeTeam?.id}
            onSelectTeam={setActiveTeam}
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
