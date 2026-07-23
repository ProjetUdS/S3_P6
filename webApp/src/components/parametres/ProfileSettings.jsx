import React, { useRef, useState } from 'react';
import { Avatar } from '../shared/Avatar';
import { updatePseudo, uploadAvatar, removeAvatar } from '../../services/settingsApi';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';
import { useAuth } from '../../context/AuthContext';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';

export default function ProfileSettings({ user }) {
    const { updateUser } = useAuth();
    const fileInputRef = useRef(null);
    const { avatarUrl } = useAvatarUrl(user?.cip);

    const [pseudo, setPseudo] = useState(user?.pseudo || user?.preferred_username || '');

    const [savingPseudo, setSavingPseudo] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    const initials = initialsFromUser
        ? initialsFromUser(user)
        : (user?.preferred_username || 'JD').substring(0, 2).toUpperCase();

    const gradient = user?.cip
        ? gradientForCip(user.cip)
        : 'linear-gradient(135deg, #3b82f6, #60a5fa)';

    const pseudoChanged = pseudo.trim() !== (user?.pseudo || user?.preferred_username || '');

    function flashSaved() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    function handleSavePseudo() {
        setError(null);
        setSavingPseudo(true);
        updatePseudo(user?.cip, pseudo)
            .then((updated) => {
                setSavingPseudo(false);
                updateUser({ pseudo: updated.pseudo });
                flashSaved();
            })
            .catch((err) => {
                setSavingPseudo(false);
                setError(err.message);
            });
    }

    function handlePhotoClick() {
        fileInputRef.current?.click();
    }

    function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        setUploadingPhoto(true);
        uploadAvatar(user?.cip, file)
            .then((url) => {
                setUploadingPhoto(false);
                window.dispatchEvent(new CustomEvent('avatar-updated'));
                flashSaved();
            })
            .catch((err) => {
                setUploadingPhoto(false);
                setError(err.message);
            })
            .finally(() => {
                e.target.value = '';
            });
    }

    function handleRemovePhoto() {
        setError(null);
        setUploadingPhoto(true);
        removeAvatar(user?.cip)
            .then(() => {
                setUploadingPhoto(false);
                window.dispatchEvent(new CustomEvent('avatar-updated'));
                flashSaved();
            })
            .catch((err) => {
                setUploadingPhoto(false);
                setError(err.message);
            });
    }

    return (
        <div className="settings-section">
            <h3 className="settings-section-title">Profil</h3>
            <p className="settings-section-desc">
                Ces informations sont visibles par les membres de tes équipes et tes contacts.
            </p>

            <div className="settings-field">
                <label className="settings-label">Photo de profil</label>
                <div className="settings-avatar-row">
                    <Avatar
                        initials={initials}
                        gradient={gradient}
                        size="lg"
                        src={avatarUrl}
                        alt={user?.pseudo || user?.preferred_username || 'Photo de profil'}
                    />
                    <div className="settings-avatar-actions">
                        <button
                            className="settings-btn settings-btn-secondary"
                            onClick={handlePhotoClick}
                            disabled={uploadingPhoto}
                        >
                            {uploadingPhoto ? 'Envoi…' : 'Changer la photo'}
                        </button>
                        {avatarUrl && (
                            <button
                                className="settings-btn settings-btn-ghost"
                                onClick={handleRemovePhoto}
                                disabled={uploadingPhoto}
                            >
                                Retirer
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="settings-file-input"
                            onChange={handlePhotoChange}
                        />
                    </div>
                </div>
            </div>

            <div className="settings-field">
                <label className="settings-label" htmlFor="settings-pseudo">Pseudo</label>
                <div className="settings-input-row">
                    <input
                        id="settings-pseudo"
                        type="text"
                        className="settings-input"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        placeholder="Ton pseudo"
                        maxLength={32}
                    />
                    <button
                        className="settings-btn settings-btn-primary"
                        onClick={handleSavePseudo}
                        disabled={!pseudoChanged || savingPseudo || !pseudo.trim()}
                    >
                        {savingPseudo ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {error && <div className="settings-error">{error}</div>}
            {saved && !error && <div className="settings-saved">Enregistré ✓</div>}
        </div>
    );
}