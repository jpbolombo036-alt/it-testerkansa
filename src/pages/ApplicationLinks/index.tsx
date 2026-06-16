import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, Plus, Calendar, X, Edit3, Trash2, ExternalLink, Globe, Search } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { fetchApplicationLinks, deleteApplicationLink, createApplicationLink, updateApplicationLink, fetchApplicationLinksByApplication, fetchApplicationLinkById } from '../../api/applicationLinkApi';
import { fetchApplications } from '../../api/applicationApi';
import { ApplicationLink, ApplicationLinkForm } from '../../types/applicationLinkTypes';
import { Application } from '../../api/applicationApi';

const LINK_TYPES = [
  'production',
  'recette',
  'développement',
  'documentation',
  'support',
  'administration'
];

export default function ApplicationLinksPage() {
  const navigate = useNavigate()
  const [links, setLinks] = useState<ApplicationLink[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  
  const [editingLink, setEditingLink] = useState<ApplicationLink | null>(null);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'nom' | 'type' | 'dateCreation' | 'createdByUsername'>('nom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterApplicationId, setFilterApplicationId] = useState<number | null>(null);
  
  const [linkFormData, setLinkFormData] = useState<ApplicationLinkForm>({
    applicationId: 0,
    nom: '',
    url: '',
    type: 'production',
    description: ''
  });

  useEffect(() => {
    loadLinks();
    loadApplications();
  }, []);

  const loadLinks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchApplicationLinks({ page: 0, size: 100 });
      setLinks(data.content || []);
    } catch (err) {
      console.error('Erreur chargement liens', err);
      showToast('error', 'Erreur', 'Impossible de charger les liens.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await fetchApplications();
      const apps = (data as any)?.content ?? data ?? [];
      setApplications(apps);
    } catch (err) {
      console.error('Erreur chargement applications', err);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(linkFormData)) return;
    
    try {
      setIsSubmitting(true);
      const newLink = await createApplicationLink(linkFormData);
      setLinks([newLink, ...links]);
      setShowLinkForm(false);
      resetFormData();
      showToast('success', 'Lien créé', 'Le lien a été ajouté avec succès.');
    } catch (error: any) {
      handleApiError(error, 'création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!window.confirm('Supprimer ce lien ?')) return;
    
    try {
      await deleteApplicationLink(linkId);
      setLinks(links.filter(link => link.id !== linkId));
      showToast('success', 'Lien supprimé', 'Le lien a été supprimé avec succès.');
    } catch (error: any) {
      handleApiError(error, 'suppression');
    }
  };

  const handleEditLink = (link: ApplicationLink) => {
    navigate(`/application-links/${link.id}/edit`)
  }

  const handleUpdateLink = async (e: React.FormEvent) => {
    if (!editingLink?.id) return;
    e.preventDefault();
    
    const formData: ApplicationLinkForm = {
      applicationId: editingLink.applicationId,
      nom: editingLink.nom || '',
      url: editingLink.url || '',
      type: editingLink.type || 'production',
      description: editingLink.description || ''
    };
    
    if (!validateForm(formData)) return;
    
    try {
      const updated = await updateApplicationLink(editingLink.id, formData);
      setLinks(links.map(l => l.id === editingLink.id ? updated : l));
      setShowEditLinkModal(false);
      setEditingLink(null);
      showToast('success', 'Lien modifié', 'Le lien a été modifié avec succès.');
    } catch (error: any) {
      handleApiError(error, 'modification');
    }
  };

  const resetFormData = () => {
    setLinkFormData({
      applicationId: 0,
      nom: '',
      url: '',
      type: 'production',
      description: ''
    });
  };

  const validateForm = (data: ApplicationLinkForm): boolean => {
    if (!data.applicationId) {
      showToast('error', 'Erreur de validation', 'L\'application est obligatoire.');
      return false;
    }
    if (!data.nom.trim()) {
      showToast('error', 'Erreur de validation', 'Le nom est obligatoire.');
      return false;
    }
    if (data.nom.length > 100) {
      showToast('error', 'Erreur de validation', 'Le nom ne peut dépasser 100 caractères.');
      return false;
    }
    if (!data.url.trim()) {
      showToast('error', 'Erreur de validation', 'L\'URL est obligatoire.');
      return false;
    }
    if (data.url.length > 500) {
      showToast('error', 'Erreur de validation', 'L\'URL ne peut dépasser 500 caractères.');
      return false;
    }
    if (data.url && !data.url.startsWith('http://') && !data.url.startsWith('https://')) {
      showToast('error', 'Erreur de validation', 'L\'URL doit commencer par http:// ou https://');
      return false;
    }
    if (data.type && data.type.length > 100) {
      showToast('error', 'Erreur de validation', 'Le type ne peut dépasser 100 caractères.');
      return false;
    }
    return true;
  };

  const handleApiError = (error: any, action: string) => {
    if (error.response?.status === 401) {
      showToast('error', 'Non autorisé', 'Veuillez vous reconnecter.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      showToast('error', 'Interdit', 'Vous n\'êtes pas autorisé à effectuer cette action.');
    } else {
      showToast('error', 'Erreur', `Impossible de ${action} le lien. Vérifiez les champs et réessayez.`);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getApplicationName = (link: ApplicationLink) => {
    if (link.application?.nom) return link.application.nom;
    const app = applications.find(a => a.id === link.applicationId);
    return app?.nom || 'Application inconnue';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => {
      let valueA: string = '';
      let valueB: string = '';
      
      if (sortField === 'nom') {
        valueA = a.nom || '';
        valueB = b.nom || '';
      } else if (sortField === 'type') {
        valueA = a.type || '';
        valueB = b.type || '';
      } else if (sortField === 'dateCreation') {
        valueA = a.dateCreation || '';
        valueB = b.dateCreation || '';
      } else if (sortField === 'createdByUsername') {
        valueA = a.createdByUsername || '';
        valueB = b.createdByUsername || '';
      }
      
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    });
  }, [links, sortField, sortDirection]);

  const filteredLinks = useMemo(() => {
    return sortedLinks.filter(link => {
      if (filterApplicationId && link.applicationId !== filterApplicationId) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          link.nom?.toLowerCase().includes(term) ||
          link.url?.toLowerCase().includes(term) ||
          link.description?.toLowerCase().includes(term) ||
          getApplicationName(link).toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [sortedLinks, searchTerm, filterApplicationId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <LinkIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Liens Web</h1>
              <p className="text-slate-500 dark:text-slate-400">Gérez les liens associés aux applications</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/application-links/new')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Nouveau lien
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, URL, description ou application..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterApplicationId ?? ''}
              onChange={(e) => setFilterApplicationId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              <option value="">Toutes les applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>{app.nom}</option>
              ))}
            </select>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              <option value="nom">Trier par nom</option>
              <option value="type">Trier par type</option>
              <option value="dateCreation">Trier par date</option>
              <option value="createdByUsername">Trier par créateur</option>
            </select>
            <button
              onClick={() => setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc')}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              title={sortDirection === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLinkForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ajouter un lien</h2>
              <button onClick={() => setShowLinkForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Application *</label>
                  <select
                    required
                    value={linkFormData.applicationId}
                    onChange={(e) => setLinkFormData({...linkFormData, applicationId: Number(e.target.value)})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                  >
                    <option value={0}>Sélectionner une application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>{app.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Type</label>
                  <select
                    value={linkFormData.type}
                    onChange={(e) => setLinkFormData({...linkFormData, type: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                  >
                    {LINK_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={linkFormData.nom}
                    onChange={(e) => setLinkFormData({...linkFormData, nom: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">URL *</label>
                  <input
                    type="url"
                    required
                    maxLength={500}
                    value={linkFormData.url}
                    onChange={(e) => setLinkFormData({...linkFormData, url: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <textarea
                  value={linkFormData.description}
                  onChange={(e) => setLinkFormData({...linkFormData, description: e.target.value})}
                  className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                  rows={2}
                />
              </div>
              <button disabled={isSubmitting} className="rounded-2xl bg-sky-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50">
                {isSubmitting ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : 'Créer le lien'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              <th className="px-6 py-3">Nom</th>
              <th className="px-6 py-3">Application</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">URL</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.map((link) => (
              <motion.tr
                layout
                key={link.id}
                className="group transition-all duration-300 hover:translate-x-1"
              >
                <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-extrabold text-sky-600 shadow-sm dark:bg-slate-950 dark:text-sky-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{link.nom}</p>
                  </div>
                </td>
                <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{getApplicationName(link)}</p>
                </td>
                <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                    {link.type || '-'}
                  </span>
                </td>
                <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md max-w-xs">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{link.url}</p>
                </td>
                <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(link.dateCreation)}
                  </p>
                </td>
                <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openLink(link.url)}
                      className="p-2.5 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 transition-all"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleEditLink(link)}
                      className="p-2.5 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-all"
                      title="Modifier"
                    >
                      <Edit3 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id!)}
                      className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {links.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm">Aucun lien trouvé.</p>
          </div>
        )}
        {filteredLinks.length === 0 && links.length > 0 && (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm">Aucun lien ne correspond à vos filtres.</p>
          </div>
        )}
      </div>

      <div className="sm:hidden grid gap-4">
        {filteredLinks.map((link) => (
          <motion.div
            layout
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{link.nom}</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{getApplicationName(link)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{link.url}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-sky-100 text-sky-700 px-2 py-1 dark:bg-sky-500/15 dark:text-sky-300 font-bold">{link.type || '-'}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(link.dateCreation)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => openLink(link.url)}
                className="flex items-center justify-center rounded-2xl bg-sky-100 p-2 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                title="Ouvrir le lien"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEditLink(link)}
                className="flex items-center justify-center rounded-2xl bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                title="Modifier"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteLink(link.id!)}
                className="flex items-center justify-center rounded-2xl bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {links.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm">Aucun lien trouvé.</p>
          </div>
        )}
      </div>

      </div>
    )
  }