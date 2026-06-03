// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import FriendsPanel from './components/friends/FriendsPanel';
import ChatView from './components/chat/ChatView';
import TeamsPanel from './components/teams/TeamsPanel';
import TeamArea from './components/teams/TeamArea';
import { FRIENDS, TEAMS } from './data/mockData';

import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

export default function App() {
  const { authenticated, user, loading } = useAuth();
  const [view, setView] = useState('messages');
  const [activeFriend, setActiveFriend] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);
  const [friends, setFriends] = useState(FRIENDS);
  const [teams, setTeams] = useState(TEAMS);

  useEffect(() => {
    if (authenticated && user) {
      if (friends.length === 0) {
        setFriends([
          { id: 'sr', name: 'Sara R.', initials: 'SR', status: 'online', sub: 'Active now', gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)', unread: 3 },
          { id: 'tm', name: 'Tom M.', initials: 'TM', status: 'away', sub: 'Away · 2h ago', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
          { id: 'ak', name: 'Alex K.', initials: 'AK', status: 'online', sub: 'Active now', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          { id: 'pl', name: 'Priya L.', initials: 'PL', status: 'offline', sub: 'Offline', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        ]);
        setActiveFriend({ id: 'sr', name: 'Sara R.', initials: 'SR', status: 'online', sub: 'Active now', gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)', unread: 3 });
      }
      if (teams.length === 0) {
        setTeams([
          { id: 'product', name: 'Product', memberCount: 5, initials: 'P', gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)', unread: 2 },
          { id: 'design', name: 'Design', memberCount: 3, initials: 'D', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          { id: 'engineering', name: 'Engineering', memberCount: 8, initials: 'E', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        ]);
        setActiveTeam({ id: 'product', name: 'Product', memberCount: 5, initials: 'P', gradient: 'linear-gradient(135deg, #7c6af7, #a78bfa)', unread: 2 });
      }
    }
  }, [authenticated, user]);

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
