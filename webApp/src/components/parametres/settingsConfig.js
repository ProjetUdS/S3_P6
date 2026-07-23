// src/components/settings/settingsConfig.js
//
// Pour ajouter une nouvelle section de paramètres :
// 1. Crée un composant dans ./sections/TonNouveauComposant.jsx
//    (il reçoit une prop `user` et peut appeler `onProfileUpdated` si besoin)
// 2. Importe-le ici
// 3. Ajoute une entrée dans SETTINGS_SECTIONS ci-dessous
//
// C'est tout — SettingsModal se charge d'afficher la nouvelle section
// automatiquement dans la nav de gauche.

import ProfileSettings from './ProfileSettings';

export const SETTINGS_SECTIONS = [
    {
        id: 'profile',
        label: 'Profil',
        icon: '👤',
        description: 'Pseudo, photo de profil',
        component: ProfileSettings,
    },

    // Exemple pour en ajouter une plus tard :
    // {
    //     id: 'notifications',
    //     label: 'Notifications',
    //     icon: '🔔',
    //     description: 'Préférences de notifications',
    //     component: NotificationSettings,
    // },
];
