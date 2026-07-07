import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlocNoteDTO, BLOC_NOTE_STATUSES } from '../dto/BlocNoteDTO';
import { fetchAllNotes, deleteNote } from '../api/blocNoteApi';
import { Loader2, Search, Plus, Eye, Edit3, Trash2, X, FileText, StickyNote } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';

interface BlocNoteListProps {
  onCreateNew: () => void;
  onEdit: (note: BlocNoteDTO) => void;
  onView: (note: BlocNoteDTO) => void;
  refreshTrigger?: number;
  initialStatusFilter?: string;
  initialSearch?: string;
}

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    IN_PROGRESS: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    VALIDATED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    ARCHIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const BlocNoteList: React.FC<BlocNoteListProps> = ({
  onCreateNew,
  onEdit,
  onView,
  refreshTrigger,
  initialStatusFilter,
  initialSearch,
}) => {
  const [notes, setNotes] = useState<BlocNoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || '');
  const { showToast } = useToast();
  const { confirm, dialog } = useConfirm();

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchAllNotes();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette note ?',
      title: 'Suppression',
      variant: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await deleteNote(id);
          setNotes(notes.filter(n => n.id !== id));
          showToast('success', 'Note supprimée', 'La note a été supprimée avec succès.');
        } catch {
          showToast('error', 'Erreur', 'Impossible de supprimer la note.');
        }
      },
    });
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (statusFilter && note.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (note.title || '').toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          (note.createdByUsername || '').toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [notes, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <StickyNote className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Notes QA</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {notes.length} note{notes.length !== 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-white transition hover:bg-sky-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Nouvelle note
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, contenu ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 min-w-[140px] rounded-xl border-none bg-slate-50 py-2.5 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              <option value="">Tous les statuts</option>
              {BLOC_NOTE_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {filteredNotes.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-12 shadow-soft text-center dark:bg-slate-900">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {notes.length === 0 ? 'Aucune note disponible' : 'Aucune note ne correspond à vos filtres.'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={onCreateNew}
              className="mt-4 rounded-2xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
            >
              Créer la première note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {note.title || 'Note sans titre'}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadge(note.status || 'DRAFT')}`}>
                      {note.status || 'DRAFT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="font-medium text-sky-600 dark:text-sky-400">
                      {note.createdByUsername || 'Utilisateur'}
                    </span>
                    {note.applicationId && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                        App #{note.applicationId}
                      </span>
                    )}
                    {note.sessionId && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                        Session #{note.sessionId}
                      </span>
                    )}
                    {note.testId && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                        Test #{note.testId}
                      </span>
                    )}
                  </div>
                  {note.updatedAt && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Mis à jour le {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(note)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-600 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir
                    </button>
                    <button
                      onClick={() => onEdit(note)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
