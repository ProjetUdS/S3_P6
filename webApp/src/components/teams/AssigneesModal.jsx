import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { getAssignees, addAssignee, deleteAssignee } from '../../services/api';

export default function AssigneesModal({ taskId, taskName, teamMembers = [], onClose, onUpdated }) {
  const [initialCips, setInitialCips] = useState([]);
  const [assigneeCips, setAssigneeCips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;
    loadAssignees();
  }, [taskId]);

  async function loadAssignees() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssignees(taskId);
      const cips = data || [];
      setAssigneeCips(cips);
      setInitialCips(cips);
    } catch (err) {
      console.error('Failed to load assignees:', err);
      setError('Impossible de charger les personnes assignées.');
    } finally {
      setLoading(false);
    }
  }

  function handleAddAssignee(cip) {
    if (!assigneeCips.includes(cip)) {
      setAssigneeCips(prev => [...prev, cip]);
    }
  }

  function handleRemoveAssignee(cip) {
    setAssigneeCips(prev => prev.filter(c => c !== cip));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const added = assigneeCips.filter(cip => !initialCips.includes(cip));
    const removed = initialCips.filter(cip => !assigneeCips.includes(cip));

    try {
      if (added.length > 0 || removed.length > 0) {
        await Promise.all([
          ...added.map(cip => addAssignee(taskId, cip)),
          ...removed.map(cip => deleteAssignee(taskId, cip))
        ]);
        onUpdated();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save assignees:', err);
      setError('Erreur lors de la sauvegarde des assignations.');
      setSaving(false);
    }
  }

  // Find member details in teamMembers
  const getMemberDetails = (cip) => {
    return teamMembers.find(m => m.id === cip) || {
      id: cip,
      name: cip,
      initials: cip.substring(0, 2).toUpperCase(),
      gradient: 'var(--grad-sr)',
    };
  };

  const assignedMembers = assigneeCips.map(cip => getMemberDetails(cip));
  const unassignedMembers = teamMembers.filter(m => !assigneeCips.includes(m.id));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !saving && onClose()}>
      <div className="modal" style={{ width: '420px', maxWidth: '95%', position: 'relative' }}>
        <button
          onClick={onClose}
          disabled={saving}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px'
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="modal-title" style={{ wordBreak: 'break-word', paddingRight: '24px' }}>
          Assignations
        </h2>
        <p className="modal-subtitle" style={{ wordBreak: 'break-word' }}>
          Gérer les personnes assignées à la tâche : <strong>{taskName}</strong>
        </p>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '13px', padding: '8px', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' }}>
            <div className="loading-spinner" />
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Chargement...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Membres assignés */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Assignés ({assignedMembers.length})
              </div>
              {assignedMembers.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '6px 4px' }}>
                  Aucune personne assignée
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {assignedMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar initials={m.initials} gradient={m.gradient} size="sm" />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignee(m.id)}
                        disabled={saving}
                        className="kanban-task-cancel"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          border: '1px solid #fee2e2',
                          color: '#dc2626',
                          background: 'transparent',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter des membres */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Membres de l'équipe ({unassignedMembers.length})
              </div>
              {unassignedMembers.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '6px 4px' }}>
                  Tout le monde est assigné
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {unassignedMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar initials={m.initials} gradient={m.gradient} size="sm" />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                      <button
                        onClick={() => handleAddAssignee(m.id)}
                        disabled={saving}
                        className="kanban-task-btn"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                      >
                        Assigner
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
