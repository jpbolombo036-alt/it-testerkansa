import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAccountById, deleteAccount, Account } from '../api/accountApi';
import { fetchApplications, Application } from '../api/applicationApi';
import { Loader2, Edit3, Trash2, X, Key, Shield, User, Globe, MessageSquare } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [account, setAccount] = useState<Account | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchAccountById(Number(id));
        setAccount(data);
        if (data.applicationId) {
          const apps = await fetchApplications();
          const app = apps.find(a => a.id === data.applicationId);
          setApplication(app || null);
        }
      } catch {
        showToast('error', 'Erreur', 'Compte introuvable.');
        navigate('/comptes');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!account?.id || !window.confirm('Supprimer ce compte ?')) return;
    setDeleting(true);
    try {
      await deleteAccount(account.id);
      showToast('success', 'Compte supprimé', 'Le compte a été supprimé avec succès.');
      navigate('/comptes');
    } catch {
      showToast('error', 'Erreur', 'Impossible de supprimer le compte.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!account) return null;

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

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
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Key className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{account.username}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Compte d'accès {application ? `• ${application.nom}` : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/comptes')}
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
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase text-slate-400">Identifiant</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{account.username}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase text-slate-400">Rôle</span>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider ${getRoleBadge(account.role)}`}>
                {account.role}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase text-slate-400">Application</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {application?.nom || 'Application #' + account.applicationId}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase text-slate-400">Code d'accès</span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 inline-block">
                {account.code}
              </p>
            </div>
          </div>
        </div>

        {account.commentaire && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase text-slate-400">Commentaire</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {account.commentaire}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 px-6 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Supprimer
        </button>
        <button
          onClick={() => navigate('/comptes')}
          className="sm:ml-auto rounded-2xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
};
