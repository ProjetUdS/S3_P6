import React, { useEffect, useState } from 'react';
import { SETTINGS_SECTIONS } from './settingsConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/settings.css';

export default function SettingsModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeSectionId, setActiveSectionId] = useState(SETTINGS_SECTIONS[0]?.id);

    // Ferme sur Escape
    useEffect(() => {
        if (!isOpen) return;
        function handleKey(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const activeSection = SETTINGS_SECTIONS.find((s) => s.id === activeSectionId) || SETTINGS_SECTIONS[0];
    const ActiveComponent = activeSection?.component;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div
                className="settings-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Paramètres"
                onClick={(e) => e.stopPropagation()}
            >
                <nav className="settings-nav">
                    <div className="settings-nav-header">Paramètres</div>
                    <div className="settings-nav-list">
                        {SETTINGS_SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                className={`settings-nav-item ${activeSectionId === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSectionId(section.id)}
                            >
                                <span className="settings-nav-icon">{section.icon}</span>
                                <span className="settings-nav-text">
                                    <span className="settings-nav-label">{section.label}</span>
                                    <span className="settings-nav-desc">{section.description}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="settings-content">
                    <button className="settings-close" onClick={onClose} aria-label="Fermer les paramètres">
                        ✕
                    </button>
                    {ActiveComponent && <ActiveComponent user={user} />}
                </div>
            </div>
        </div>
    );
}
