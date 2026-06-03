import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const { getKeycloakInstance } = await import('../utils/keycloak.js');
  const kc = getKeycloakInstance();
  if (kc?.token) {
    config.headers.Authorization = `Bearer ${kc.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { updateToken, initKeycloak, logout } = await import('../utils/keycloak.js');
    const kc = error.response?.config?.keycloakUsed;

    if (error.response?.status === 401 && kc?.authenticated) {
      const refreshed = await updateToken();
      if (refreshed) {
        error.response.config.headers.Authorization = `Bearer ${kc.token}`;
        return api.request(error.response.config);
      }
    }

    if (error.response?.status === 401) {
      const result = await initKeycloak();
      if (!result.authenticated) {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export async function login() {
  const response = await api.get('/utilisateur/login');
  return response.data;
}

export async function getDiscussions(cip, equipeId) {
  const params = {};
  if (cip) params.cip = cip;
  if (equipeId) params.equipeId = equipeId;
  const response = await api.get('/discussion', { params });
  return response.data;
}

export async function getDiscussion(discussionId) {
  const response = await api.get(`/discussion/${discussionId}`);
  return response.data;
}

export async function createDiscussion(discussion) {
  const response = await api.post('/discussion', discussion);
  return response.data;
}

export async function getMessages(discussionId, limit, offset) {
  const params = { discussionId };
  if (limit) params.limite = limit;
  if (offset) params.decalage = offset;
  const response = await api.get('/message', { params });
  return response.data;
}

export async function getMessage(messageId) {
  const response = await api.get(`/message/${messageId}`);
  return response.data;
}

export async function sendMessage(message) {
  const response = await api.post('/message', message);
  return response.data;
}

export async function deleteMessage(messageId) {
  const response = await api.delete(`/message/${messageId}`);
  return response.data;
}

export async function getEquipes(cip) {
  const params = {};
  if (cip) params.usersCip = [cip];
  const response = await api.get('/equipes', { params });
  return response.data;
}

export async function getEquipe(equipeId) {
  const response = await api.get(`/equipes/${equipeId}`);
  return response.data;
}

export async function createEquipe(equipe) {
  const response = await api.post('/equipes', equipe);
  return response.data;
}

export async function getTaches(equipeId) {
  const response = await api.get('/tache', { params: { equipeId } });
  return response.data;
}

export async function getTache(tacheId) {
  const response = await api.get(`/tache/${tacheId}`);
  return response.data;
}

export async function createTache(tache) {
  const response = await api.post('/tache', tache);
  return response.data;
}

export async function deleteTache(tacheId) {
  const response = await api.delete(`/tache/${tacheId}`);
  return response.data;
}

export async function getContacts(cip) {
  const response = await api.get('/utilisateur/contacts', { params: { userCip: cip } });
  return response.data;
}

export async function getTeamMembers(equipeId) {
  const response = await api.get('/equipes', { params: { equipeId } });
  return response.data;
}

export async function addTeamMember(equipeId, memberCip) {
  const response = await api.post(`/equipes/${equipeId}/member`, { memberCip });
  return response.data;
}

export default api;
