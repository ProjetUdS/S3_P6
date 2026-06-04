import Keycloak from 'keycloak-js';

const KEYCLOAC_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'usager',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend',
};

let keycloak = null;

export function getKeycloakInstance() {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: KEYCLOAC_CONFIG.url,
      realm: KEYCLOAC_CONFIG.realm,
      clientId: KEYCLOAC_CONFIG.clientId,
    });
  }
  return keycloak;
}

export async function initKeycloak() {
  const kc = getKeycloakInstance();
  try {
    const authenticated = await kc.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });
    return { authenticated, token: authenticated ? kc.token : null, user: kc.tokenParsed };
  } catch (error) {
    console.error('Keycloak initialization failed:', error);
    return { authenticated: false, token: null, user: null };
  }
}

export async function updateToken(minValidity = 5) {
  const kc = getKeycloakInstance();
  if (!kc?.authenticated) return false;
  try {
    return await kc.updateToken(minValidity);
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

export function logout() {
  const kc = getKeycloakInstance();
  if (kc) {
    kc.logout({ redirectUri: window.location.origin });
  }
}
