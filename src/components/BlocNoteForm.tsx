import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BlocNoteDTO, BlocNoteRequest, BLOC_NOTE_STATUSES } from '../dto/BlocNoteDTO';
import { createNote, updateNote } from '../api/blocNoteApi';
import { fetchApplications, Application } from '../api/applicationApi';
import { fetchTestSessions, TestSession } from '../api/testSessionApi';
import { fetchAllTests, TestStep } from '../api/testApi';
import { X, Loader2 } from 'lucide-react';

interface BlocNoteFormProps {
  note?: BlocNoteDTO | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BlocNoteForm: React.FC<BlocNoteFormProps> = ({ note, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BlocNoteRequest>({
    title: note?.title || '',
    content: note?.content || '',
    applicationId: note?.applicationId,
    sessionId: note?.sessionId,
    testId: note?.testId,
    status: note?.status || 'DRAFT',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [tests, setTests] = useState<TestStep[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingRefs(true);
        const [apps, sessionsData, testsData] = await Promise.all([
          fetchApplications(),
          fetchTestSessions(),
          fetchAllTests(),
        ]);
        setApplications(apps);
        setSessions(sessionsData);
        setTests(testsData);
      } catch (err) {
        console.error('Erreur chargement références', err);
      } finally {
        setLoadingRefs(false);
      }
    };
    loadReferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.content.trim()) {
      setError('Le contenu est obligatoire.');
      setSaving(false);
      return;
    }

    try {
      if (note?.id) {
        await updateNote(note.id, formData);
      } else {
        await createNote(formData);
      }
      onSuccess();
    } catch (err) {
      setError('Impossible de sauvegarder la note. Vérifiez les champs et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto hide-scrollbar"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {note?.id ? 'Modifier la note' : 'Nouvelle note QA'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Titre (optionnel, max 255 caractères)</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value.slice(0, 255) })}
              maxLength={255}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Contenu *</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
              rows={6}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Statut</label>
            <select
              value={formData.status || 'DRAFT'}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              {BLOC_NOTE_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Application associée</label>
            <select
              value={formData.applicationId ?? ''}
              onChange={e => setFormData({ ...formData, applicationId: e.target.value ? Number(e.target.value) : undefined })}
              disabled={loadingRefs}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950 disabled:opacity-50"
            >
              <option value="">Aucune</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>{app.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Session de test associée</label>
            <select
              value={formData.sessionId ?? ''}
              onChange={e => setFormData({ ...formData, sessionId: e.target.value ? Number(e.target.value) : undefined })}
              disabled={loadingRefs}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950 disabled:opacity-50"
            >
              <option value="">Aucune</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Test associé</label>
            <select
              value={formData.testId ?? ''}
              onChange={e => setFormData({ ...formData, testId: e.target.value ? Number(e.target.value) : undefined })}
              disabled={loadingRefs}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950 disabled:opacity-50"
            >
              <option value="">Aucun</option>
              {tests.map(test => (
                <option key={test.id} value={test.id}>{test.fonction}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || loadingRefs}
              className="flex-1 rounded-2xl bg-sky-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : note?.id ? 'Mettre à jour' : 'Créer la note'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl bg-slate-100 px-6 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};