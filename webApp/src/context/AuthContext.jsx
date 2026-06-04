import React, { createContext, useState, useEffect, useContext } from 'react';
import { initKeycloak, updateToken, logout as kcLogout } from '../utils/keycloak.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let interval;

    const initAuth = async () => {
      const result = await initKeycloak();
      setAuthenticated(result.authenticated);
      setUser(result.user);
      setToken(result.token);
      setLoading(false);

      if (result.authenticated) {
        try {
          await fetch('/api/utilisateur/login', {
            method: 'GET',
            headers: { Authorization: `Bearer ${result.token}` },
          });
        } catch (e) {
          console.error('Failed to sync user with backend:', e);
        }

        interval = setInterval(async () => {
          await updateToken(5);
          const { getKeycloakInstance } = await import('../utils/keycloak.js');
          const kc = getKeycloakInstance();
          if (kc?.token) {
            setToken(kc.token);
            setUser(kc.tokenParsed);
          }
        }, 60000);
      }
    };

    initAuth();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const doLogout = () => {
    setAuthenticated(false);
    setUser(null);
    setToken(null);
    kcLogout();
  };

  const value = {
    authenticated,
    user,
    token,
    loading,
    logout: doLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
