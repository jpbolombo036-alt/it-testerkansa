import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchApplicationById, deleteApplication, Application } from '../api/applicationApi';
import { fetchApplicationLinksByApplication } from '../api/applicationLinkApi';
import { fetchAccounts, Account } from '../api/accountApi';
import { ApplicationLink } from '../types/applicationLinkTypes';
import { Loader2, Edit3, Trash2, X, Package, Globe, User as UserIcon, ExternalLink, Calendar, Eye } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../hooks/useConfirm';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm, dialog } = useConfirm();

  const [app, setApp] = useState<Application | null>(null);
  const [appLinks, setAppLinks] = useState<ApplicationLink[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchApplicationById(Number(id));
        setApp(data);
      } catch {
        showToast('error', 'Erreur', 'Application introuvable.');
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!id || !app) return;
      setLoadingDetail(true);
      try {
        const [linksData, accountsData] = await Promise.all([
          fetchApplicationLinksByApplication(Number(id)),
          fetchAccounts(),
        ]);
        setAppLinks(Array.isArray(linksData) ? linksData : []);
        setAccounts(accountsData.filter(a => a.applicationId === Number(id)));
      } catch {
        setAppLinks([]);
        setAccounts([]);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadRelated();
  }, [id, app]);

  const handleDelete = () => {
    if (!app?.id) return;
    confirm({
      message: 'Supprimer cette application ?',
      title: 'Suppression',
      variant: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteApplication(app.id);
          showToast('success', 'Application supprimée', 'L\'application a été supprimée avec succès.');
          navigate('/applications');
        } catch {
          showToast('error', 'Erreur', 'Impossible de supprimer l\'application.');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6 p-6">
      {dialog}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Package className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{app.nom}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Créée le {new Date(app.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/applications/${app.id}/edit`)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={() => navigate('/applications')}
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
              <span className="text-xs font-bold uppercase text-slate-400">Environnement</span>
              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{app.environnement}</p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Version</span>
              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{app.version || '-'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Date de création</span>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {new Date(app.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <span className="text-xs font-bold uppercase text-slate-400">Description</span>
          <div className="mt-2 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {app.description || 'Aucune description'}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Liens associés</h2>
        </div>

        {loadingDetail ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : appLinks.length > 0 ? (
          <div className="space-y-3">
            {appLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-sky-700 dark:text-sky-300">{link.nom}</p>
                  <p className="text-xs text-slate-500 truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {link.type}
                  </span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/50">
            <p className="text-sm font-medium text-slate-500">Aucun lien pour cette application</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Comptes associés</h2>
        </div>

        {accounts.length > 0 ? (
          <div className="rounded-2xl overflow-x-auto border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left min-w-[640px]">
<thead>
                 <tr className="bg-slate-50 dark:bg-slate-800/50">
                   <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Identifiant</th>
                   <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Description</th>
                   <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Rôle</th>
                   <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Code</th>
                   <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                 </tr>
               </thead>
<tbody>
                 {accounts.map(acc => (
                   <tr key={acc.id} className="border-t border-slate-50 dark:border-slate-800/50">
                     <td className="px-6 py-3 text-sm font-bold text-slate-800 dark:text-slate-200">{acc.username}</td>
                     <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{acc.commentaire || '-'}</td>
                     <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">{acc.role}</td>
                     <td className="px-6 py-3 text-sm font-mono text-slate-500">{'•'.repeat(acc.code.length)}</td>
                     <td className="px-6 py-3 text-right">
                       <button
                         onClick={() => navigate(`/comptes/${acc.id}`)}
                         className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30"
                         title="Voir le compte"
                       >
                         <Eye className="h-4 w-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/50">
            <p className="text-sm font-medium text-slate-500">Aucun compte pour cette application</p>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate('/applications')}
          className="sm:ml-auto rounded-2xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
};
