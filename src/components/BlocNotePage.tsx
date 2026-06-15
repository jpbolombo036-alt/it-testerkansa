import React, { useState } from 'react';
import { BlocNoteDTO } from '../dto/BlocNoteDTO';
import { BlocNoteList } from './BlocNoteList';
import { BlocNoteForm } from './BlocNoteForm';

export const BlocNotePage: React.FC = () => {
  const [editingNote, setEditingNote] = useState<BlocNoteDTO | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setEditingNote(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bloc-note-page">
      <div className="main-content">
        <BlocNoteList onEdit={setEditingNote} refreshTrigger={refreshTrigger} />
      </div>
      
      {editingNote && (
        <div className="modal">
          <BlocNoteForm
            note={editingNote}
            onSuccess={handleSuccess}
            onCancel={() => setEditingNote(null)}
          />
        </div>
      )}
      
      {!editingNote && (
        <button 
          className="fab"
          onClick={() => setEditingNote({} as BlocNoteDTO)}
          title="Nouvelle note"
        >
          +
        </button>
      )}
    </div>
  );
};