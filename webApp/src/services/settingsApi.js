// src/services/settingsApi.js
//
// Ces fonctions sont volontairement isolées de services/api.js pour ne
// rien casser en attendant que les vrais endpoints backend soient prêts.
// Une fois l'API dispo, remplace le contenu de chaque fonction par un
// vrai appel axios (le shape des paramètres/retour ne change pas,
// donc ProfileSettings.jsx n'aura rien à modifier).

const MOCK_DELAY = 500;

/**
 * Met à jour le pseudo de l'utilisateur.
 * TODO backend: PUT /api/users/:cip  { pseudo }
 */
export function updatePseudo(cip, pseudo) {
    // Exemple une fois le backend prêt :
    // return api.put(`/users/${cip}`, { pseudo }).then(res => res.data);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!pseudo || pseudo.trim().length < 2) {
                reject(new Error('Le pseudo doit contenir au moins 2 caractères.'));
                return;
            }
            resolve({ cip, pseudo: pseudo.trim() });
        }, MOCK_DELAY);
    });
}

/**
 * Upload une nouvelle photo de profil.
 * TODO backend: POST /api/users/:cip/avatar (multipart/form-data)
 * Retourne l'URL (ou dataURL en attendant) de l'avatar.
 */
export function uploadAvatar(cip, file) {
    // Exemple une fois le backend prêt :
    // const form = new FormData();
    // form.append('avatar', file);
    // return api.post(`/users/${cip}/avatar`, form).then(res => res.data.url);

    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Le fichier doit être une image.'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Image trop grande (max 5 Mo).'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setTimeout(() => resolve(reader.result), MOCK_DELAY);
        reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Retire la photo de profil (retour aux initiales).
 * TODO backend: DELETE /api/users/:cip/avatar
 */
export function removeAvatar(cip) {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ cip, avatarUrl: null }), MOCK_DELAY);
    });
}
