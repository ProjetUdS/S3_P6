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

export async function deleteEquipe(equipeId) {
  const response = await api.delete(`/equipes/${equipeId}`);
  return response.data;
}

export async function createEquipe(teamName, adminCip, memberCips = []) {
  const idRes = await api.get('/equipes/nouveauID');
  const equipeId = idRes.data;
  const equipe = { equipeId, administrateurCip: adminCip, nomEquipe: teamName };
  const params = new URLSearchParams();
  memberCips.forEach(c => params.append('membersCip', c));
  const response = await api.post(`/equipes?${params.toString()}`, equipe);
  return response.data;
}

export async function getDeadlines(equipeId) {
  const response = await api.get('/tache/deadlines', { params: { equipeId } });
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

export async function updateTache(tacheId, tache) {
  const params = new URLSearchParams();
  if (tache.nomTache != null) params.set('nomTache', tache.nomTache);
  if (tache.status != null) params.set('status', tache.status);
  if (tache.description != null) params.set('description', tache.description);
  if (tache.dateDebut != null) params.set('dateDebut', tache.dateDebut);
  if (tache.dateFin != null) params.set('dateFin', tache.dateFin);
  const response = await api.put(`/tache/${tacheId}?${params.toString()}`);
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

export async function searchUsers(query) {
  const response = await api.get('/utilisateur', { params: { pseudo: query } });
  return response.data;
}

export async function addContact(userCip, contactCip) {
  const response = await api.post(`/utilisateur/${userCip}/contact/${contactCip}`);
  return response.data;
}

export async function getFriendConversation(userCip, friendCip, limit, offset) {
  const params = { cip1: userCip, cip2: friendCip };
  if (limit) params.limite = limit;
  if (offset) params.decalage = offset;
  const response = await api.get('/message/friendConversation', { params });
  return response.data;
}

// Fichiers (minio) helpers
export async function getUploadUrl(nomFichier) {
  const response = await api.get('/fichiers/upload-url', { params: { nomFichier } });
  return response.data;
}

// Upload directly to the presigned URL returned by the backend. We use the global axios
// instance so requests to the full URL work without the API baseURL interfering.
export async function uploadToUrl(uploadUrl, file) {
  return await axios.put(uploadUrl, file, {headers: {'Content-Type': file.type || 'application/octet-stream'}});
}

export async function getDownloadUrl(fichierId) {
  const response = await api.get(`/fichiers/download-url/${fichierId}`);
  return response.data;
}

export async function getCalendrierTasks(equipeId, dateMin, dateMax) {
  const response = await api.get('/tache/calendrier', { params: { equipeId, dateMin, dateMax } });
  return response.data;
}

export async function getTeamMembers(equipeId) {
  const response = await api.get(`/equipes/${equipeId}/members`);
  return response.data;
}

export async function addTeamMember(equipeId, memberCip) {
  const response = await api.post(`/equipes/${equipeId}/member`, { memberCip });
  return response.data;
}

export async function removeDiscussionMember(discussionId, cip) {
  const response = await api.delete('/discussionMember', { params: { discussionId, cip } });
  return response.data;
}

export async function changeDiscussionMemberState(discussionId, cip, etat) {
  const response = await api.post(`/discussionMember/${discussionId}`, undefined, { params: { cip, etat } });
  return response.data;
}

export async function getConversations(cip) {
  const response = await api.get('/discussionMember/conversations', { params: { cip } });
  return response.data;
}

export default api;
