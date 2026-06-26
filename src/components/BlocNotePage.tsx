import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlocNoteDTO, BLOC_NOTE_STATUSES } from '../dto/BlocNoteDTO';
import { BlocNoteList } from './BlocNoteList';
import { BlocNoteForm } from './BlocNoteForm';
import { fetchNoteById, deleteNote } from '../api/blocNoteApi';
import { useToast } from '../components/ToastProvider';
import { Loader2, Edit3, Trash2, FileText, Plus, X } from 'lucide-react';

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    VALIDATED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    ARCHIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export const BlocNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [editingNote, setEditingNote] = useState<BlocNoteDTO | null>(null);
  const [viewingNote, setViewingNote] = useState<BlocNoteDTO | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isDetailView = !!id && location.pathname === `/bloc-notes/${id}`;
  const isEditView = !!id && location.pathname === `/bloc-notes/${id}/edit`;
  const isNewView = location.pathname === '/bloc-notes/new';

  useEffect(() => {
    if (isDetailView || isEditView) {
      const noteId = Number(id);
      if (noteId) {
        setLoadingDetail(true);
        fetchNoteById(noteId)
          .then(data => {
            setViewingNote(data);
            if (isEditView) setEditingNote(data);
          })
          .catch(() => {
            showToast('error', 'Erreur', 'Note introuvable.');
            navigate('/bloc-notes');
          })
          .finally(() => setLoadingDetail(false));
      }
    } else {
      setViewingNote(null);
      setEditingNote(null);
    }
  }, [id, location.pathname]);

  const handleSuccess = () => {
    setEditingNote(null);
    setRefreshTrigger(prev => prev + 1);
    if (isNewView || isEditView) {
      navigate('/bloc-notes');
    } else if (isDetailView && viewingNote) {
      setViewingNote({ ...viewingNote, id: viewingNote.id });
    }
  };

  const handleDelete = async (noteId: number) => {
    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
      showToast('success', 'Note supprimée', 'La note a été supprimée avec succès.');
      navigate('/bloc-notes');
    } catch {
      showToast('error', 'Erreur', 'Impossible de supprimer la note.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loadingDetail) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (isDetailView && viewingNote && !isEditView) {
    return (
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {viewingNote.title || 'Note sans titre'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Par {viewingNote.createdByUsername || 'Utilisateur'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/bloc-notes/${viewingNote.id}/edit`)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => navigate('/bloc-notes')}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Retour
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Statut</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider ${getStatusBadge(viewingNote.status || 'DRAFT')}`}>
                    {BLOC_NOTE_STATUSES.find(s => s.value === viewingNote.status)?.label || viewingNote.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Créé le</span>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {viewingNote.createdAt ? new Date(viewingNote.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Mis à jour le</span>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {viewingNote.updatedAt ? new Date(viewingNote.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {viewingNote.applicationId && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Application associée</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">#{viewingNote.applicationId}</p>
                </div>
              )}
              {viewingNote.sessionId && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Session de test</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">#{viewingNote.sessionId}</p>
                </div>
              )}
              {viewingNote.testId && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Test associé</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">#{viewingNote.testId}</p>
                </div>
              )}
              {!viewingNote.applicationId && !viewingNote.sessionId && !viewingNote.testId && (
                <p className="text-sm text-slate-400">Aucune association</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <span className="text-xs font-bold uppercase text-slate-400">Contenu</span>
            <div className="mt-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {viewingNote.content}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(`/bloc-notes/${viewingNote.id}/edit`)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={() => navigate('/bloc-notes')}
              className="sm:ml-auto rounded-2xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Retour à la liste
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isEditView && viewingNote) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/bloc-notes/${viewingNote.id}`)}
            className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Modifier la note : {viewingNote.title || 'Sans titre'}
          </h2>
        </div>
        <BlocNoteForm
          note={viewingNote}
          onSuccess={handleSuccess}
          onCancel={() => navigate(`/bloc-notes/${viewingNote.id}`)}
        />
      </div>
    );
  }

  if (isNewView) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bloc-notes')}
            className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Nouvelle note QA</h2>
        </div>
        <BlocNoteForm
          note={null}
          onSuccess={handleSuccess}
          onCancel={() => navigate('/bloc-notes')}
        />
      </div>
    );
  }

  return (
    <BlocNoteList
      onCreateNew={() => navigate('/bloc-notes/new')}
      onEdit={(note) => navigate(`/bloc-notes/${note.id}/edit`)}
      onView={(note) => navigate(`/bloc-notes/${note.id}`)}
      refreshTrigger={refreshTrigger}
    />
  );
};
