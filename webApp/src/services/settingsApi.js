// src/services/settingsApi.js
import api, { getUploadUrl, uploadToUrl } from './api';

/**
 * Met à jour le pseudo de l'utilisateur.
 * Backend: PATCH /api/utilisateur/:cip  { pseudo }
 */
export async function updatePseudo(cip, pseudo) {
    const response = await api.patch(`/utilisateur/${cip}`, { pseudo });
    return response.data; // Utilisateur à jour
}

/**
 * Upload une nouvelle photo de profil, en 3 étapes :
 * 1. demande une URL présignée au service /fichiers existant
 * 2. PUT le fichier directement sur MinIO
 * 3. confirme au backend utilisateur que ce fichier est la nouvelle photo
 *
 * Retourne l'URL de téléchargement à utiliser dans un <img src=...>.
 */
export async function uploadAvatar(cip, file) {
    if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image.');
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image trop grande (max 5 Mo).');
    }

    const { fichierId, uploadUrl } = await getUploadUrl(file.name);
    await uploadToUrl(uploadUrl, file);

    await api.post(`/utilisateur/${cip}/photo/confirm`, { fichierId });

    const { uploadUrl: downloadUrl } = await api.get(`/utilisateur/${cip}/photo/download-url`).then(r => r.data);
    return downloadUrl;
}

/**
 * Retire la photo de profil (retour aux initiales).
 * Backend: DELETE /api/utilisateur/:cip/photo
 */
export async function removeAvatar(cip) {
    const response = await api.delete(`/utilisateur/${cip}/photo`);
    return response.data; // Utilisateur à jour (photoProfilId = null)
}

/**
 * Récupère l'URL d'affichage de la photo de profil actuelle, si elle existe.
 * `photoProfilId` vient de l'objet Utilisateur (ex: depuis useAuth()/user).
 */
export async function getAvatarUrl(cip) {
    if (!cip) return null;
    try {
        const { data } = await api.get(`/utilisateur/${cip}/photo/download-url`);
        return data.uploadUrl; // même champ que pour l'upload dans PresignedUrlResponse
    } catch (err) {
        if (err.response?.status === 404) return null; // pas de photo, pas grave
        throw err;
    }
}