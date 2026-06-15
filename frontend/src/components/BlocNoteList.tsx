import React, { useState, useEffect } from 'react';
import { BlocNoteDTO } from '../../dto/BlocNoteDTO';
import { blocNoteService } from '../../services/BlocNoteService';

interface BlocNoteListProps {
  onEdit: (note: BlocNoteDTO) => void;
  refreshTrigger?: number;
}

export const BlocNoteList: React.FC<BlocNoteListProps> = ({ onEdit, refreshTrigger }) => {
  const [notes, setNotes] = useState<BlocNoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await blocNoteService.getAll();
      setNotes(data);
    } catch (err) {
      setError('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await blocNoteService.delete(id);
        loadNotes();
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bloc-note-list">
      <h2>Notes QA</h2>
      {notes.length === 0 ? (
        <p>Aucune note disponible</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id} className="bloc-note-item">
              <h3>{note.title || 'Note sans titre'}</h3>
              <p>{note.content.substring(0, 100)}...</p>
              <small>Statut: {note.status} | Créé par: {note.createdByUsername}</small>
              <div className="actions">
                <button onClick={() => onEdit(note)}>Modifier</button>
                <button onClick={() => handleDelete(note.id)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};