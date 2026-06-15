import React, { useState, useEffect } from 'react';
import { BlocNoteDTO, BlocNoteRequest } from '../../dto/BlocNoteDTO';
import { blocNoteService } from '../../services/BlocNoteService';

interface BlocNoteFormProps {
  note?: BlocNoteDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BlocNoteForm: React.FC<BlocNoteFormProps> = ({ note, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BlocNoteRequest>({
    title: note?.title || '',
    content: note?.content || '',
    applicationId: note?.applicationId || undefined,
    sessionId: note?.sessionId || undefined,
    testId: note?.testId || undefined,
    status: note?.status || 'DRAFT',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (note?.id) {
        await blocNoteService.update(note.id, formData);
      } else {
        await blocNoteService.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bloc-note-form">
      <h2>{note?.id ? 'Modifier la note' : 'Nouvelle note QA'}</h2>
      
      {error && <div className="error">{error}</div>}

      <div>
        <label>Titre</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          maxLength={255}
        />
      </div>

      <div>
        <label>Contenu *</label>
        <textarea
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          required
          rows={5}
        />
      </div>

      <div>
        <label>Statut</label>
        <select
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      <div>
        <label>ID Application (optionnel)</label>
        <input
          type="number"
          value={formData.applicationId || ''}
          onChange={e => setFormData({ ...formData, applicationId: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div>
        <label>ID Session (optionnel)</label>
        <input
          type="number"
          value={formData.sessionId || ''}
          onChange={e => setFormData({ ...formData, sessionId: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div>
        <label>ID Test (optionnel)</label>
        <input
          type="number"
          value={formData.testId || ''}
          onChange={e => setFormData({ ...formData, testId: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : note?.id ? 'Mettre à jour' : 'Créer'}
        </button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
};