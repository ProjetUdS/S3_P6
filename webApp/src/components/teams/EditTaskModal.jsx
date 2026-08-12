import React, { useState, useEffect } from 'react';
import { getTache, updateTache } from '../../services/api';

/**
 * Helper to format date strings/objects to YYYY-MM-DD format for HTML date inputs.
 */
function formatDateForInput(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${r}`;
}

export default function EditTaskModal({ taskId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  // Form states
  const [nomTache, setNomTache] = useState('');
  const [status, setStatus] = useState('todo');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    getTache(taskId)
      .then(data => {
        setInitialData(data);
        setNomTache(data.nomTache || '');
        setStatus(data.status || 'todo');
        setDescription(data.description || '');
        setDateDebut(formatDateForInput(data.dateDebut));
        setDateFin(formatDateForInput(data.dateFin));
      })
      .catch(err => {
        console.error('Failed to load task:', err);
        setError('Impossible de charger les détails de la tâche.');
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nomTache.trim()) return;

    setSaving(true);
    setError(null);

    // Build diff payload
    const changes = {};
    if (nomTache.trim() !== (initialData.nomTache || '').trim()) {
      changes.nomTache = nomTache.trim();
    }
    if (status !== initialData.status) {
      changes.status = status;
    }
    const currentDesc = description || '';
    const initialDesc = initialData.description || '';
    if (currentDesc.trim() !== initialDesc.trim()) {
      changes.description = currentDesc.trim();
    }
    const currentStart = dateDebut || '';
    const initialStart = initialData.dateDebut ? formatDateForInput(initialData.dateDebut) : '';
    if (currentStart !== initialStart) {
      changes.dateDebut = currentStart || '';
    }
    const currentEnd = dateFin || '';
    const initialEnd = initialData.dateFin ? formatDateForInput(initialData.dateFin) : '';
    if (currentEnd !== initialEnd) {
      changes.dateFin = currentEnd || '';
    }

    try {
      // Only call API if there are actual changes
      if (Object.keys(changes).length > 0) {
        await updateTache(taskId, changes);
      }
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Erreur lors de la mise à jour de la tâche.');
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: '450px', maxWidth: '90%' }}>
        <h2 className="modal-title">Modifier la tâche</h2>
        <p className="modal-subtitle">Modifier les détails ci-dessous</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' }}>
            <div className="loading-spinner" />
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Chargement des détails...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div style={{ color: 'var(--red)', fontSize: '13px', padding: '8px', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Nom de la tâche
              </label>
              <input
                className="modal-input"
                style={{ marginBottom: 0 }}
                type="text"
                required
                value={nomTache}
                onChange={e => setNomTache(e.target.value)}
                placeholder="Ex: Rédiger le rapport"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Statut
              </label>
              <select
                className="modal-input"
                style={{ 
                  marginBottom: 0, 
                  appearance: 'none', 
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(120, 120, 120, 0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px',
                  paddingRight: '40px'
                }}
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="todo">À faire (Todo)</option>
                <option value="en_cours">En cours (Doing)</option>
                <option value="termine">Terminé (Done)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Description
              </label>
              <textarea
                className="modal-input"
                style={{ marginBottom: 0, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description de la tâche..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Date de début
                </label>
                <input
                  className="modal-input"
                  style={{ marginBottom: 0 }}
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Date de fin
                </label>
                <input
                  className="modal-input"
                  style={{ marginBottom: 0 }}
                  type="date"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || !nomTache.trim()}
                style={{ opacity: saving || !nomTache.trim() ? 0.6 : 1 }}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
