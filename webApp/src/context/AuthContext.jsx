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
      setToken(result.token);
      setLoading(false);

      if (result.authenticated) {
        try {
          const res = await fetch('/api/utilisateur/login', {
            method: 'GET',
            headers: { Authorization: `Bearer ${result.token}` },
          });
          const dbUser = await res.json();
          // Fusionne le token Keycloak (cip, roles, etc.) avec les données
          // BD (pseudo custom, photoProfilId...). dbUser a priorité sur les
          // champs en commun car c'est la source de vérité pour le profil.
          setUser({ ...result.user, ...dbUser });
        } catch (e) {
          console.error('Failed to sync user with backend:', e);
          setUser(result.user);
        }

        interval = setInterval(async () => {
          await updateToken(5);
          const { getKeycloakInstance } = await import('../utils/keycloak.js');
          const kc = getKeycloakInstance();
          if (kc?.token) {
            setToken(kc.token);
            // IMPORTANT : on fusionne au lieu d'écraser, sinon ça efface
            // le pseudo/photoProfilId chargés depuis la BD (le token
            // Keycloak ne les connaît pas).
            setUser((prev) => ({ ...prev, ...kc.tokenParsed }));
          }
        }, 60000);
      } else {
        setUser(result.user);
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

  /**
   * Met à jour l'utilisateur en mémoire sans refaire d'appel réseau.
   * À utiliser après un PATCH/POST réussi (ex: changement de pseudo ou
   * de photo) pour que le reste de l'app (Sidebar, paramètres...) reflète
   * immédiatement le changement.
   */
  const updateUser = (partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  };

  const value = {
    authenticated,
    user,
    token,
    loading,
    logout: doLogout,
    updateUser,
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
