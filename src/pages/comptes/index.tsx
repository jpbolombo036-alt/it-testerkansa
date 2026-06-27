import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchAccounts, createAccount, updateAccount, deleteAccount, fetchAccountById, Account, AccountCreateData } from '../../api/accountApi'
import { fetchApplications, Application } from '../../api/applicationApi'
import { Folder, Trash2, Edit3, Eye, Plus, Loader2, X, Key, Shield, Search } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'

export default function ComptesPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'username' | 'role'>('username')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterApplicationId, setFilterApplicationId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<AccountCreateData>({
    applicationId: 0,
    username: '',
    code: '',
    role: 'USER',
    commentaire: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [accountsData, appsData] = await Promise.all([
        fetchAccounts(),
        fetchApplications()
      ])
      setAccounts(accountsData)
      setApplications(appsData)
    } catch (err) {
      console.error("Erreur chargement", err)
    } finally {
      setIsLoading(false)
    }
  }

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      let valueA: string = '';
      let valueB: string = '';
      
      if (sortField === 'username') {
        valueA = a.username || '';
        valueB = b.username || '';
      } else if (sortField === 'role') {
        valueA = a.role || '';
        valueB = b.role || '';
      }
      
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    });
  }, [accounts, sortField, sortDirection]);

  const filteredAccounts = useMemo(() => {
    return sortedAccounts.filter(account => {
      if (filterApplicationId && account.applicationId !== filterApplicationId) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          account.username?.toLowerCase().includes(term) ||
          account.code?.toLowerCase().includes(term) ||
          account.commentaire?.toLowerCase().includes(term) ||
          applications.find(a => a.id === account.applicationId)?.nom?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [sortedAccounts, searchTerm, filterApplicationId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce compte ?")) return
    try {
      await deleteAccount(id)
      setAccounts(accounts.filter(a => a.id !== id))
      showToast('success', 'Compte supprimé', 'L\'accès a été retiré avec succès.')
    } catch (err) {
      showToast('error', 'Erreur', 'Impossible de supprimer le compte.')
    }
  }

  const handleEdit = (account: Account) => {
    navigate(`/comptes/${account.id}/edit`)
  }

  const handleView = (account: Account) => {
    navigate(`/comptes/${account.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      if (editingAccount) {
        const updated = await updateAccount(editingAccount.id, formData)
        setAccounts(accounts.map(a => a.id === editingAccount.id ? updated : a))
      } else {
        const created = await createAccount(formData)
        setAccounts([created, ...accounts])
      }
      setShowForm(false)
      setEditingAccount(null)
      setFormData({ applicationId: 0, username: '', code: '', role: 'USER', commentaire: '' })
      showToast('success', editingAccount ? 'Mis à jour' : 'Créé', 'Le compte a été enregistré avec succès.')
    } catch (err) {
      showToast('error', 'Erreur', 'Erreur lors de la sauvegarde des données.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Key className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Comptes d'accès</h1>
              <p className="text-slate-500 dark:text-slate-400">Gérez les identifiants par application</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/comptes/new')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Nouveau compte
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par utilisateur, code ou commentaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterApplicationId ?? ''}
              onChange={(e) => setFilterApplicationId(e.target.value ? Number(e.target.value) : null)}
              className="w-full sm:w-auto min-w-[180px] rounded-xl border-none bg-slate-50 py-2.5 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
            >
              <option value="">Toutes les applications</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>{app.nom}</option>
              ))}
            </select>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full sm:w-auto min-w-[180px] rounded-xl border-none bg-slate-50 py-2.5 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
            >
              <option value="username">Trier par utilisateur</option>
              <option value="role">Trier par rôle</option>
            </select>
            <button
              onClick={() => setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc')}
              className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              title={sortDirection === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingAccount ? 'Modifier le compte' : 'Nouveau compte'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Application</label>
                  <select
                    required
                    value={formData.applicationId}
                    onChange={(e) => setFormData({...formData, applicationId: Number(e.target.value)})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  >
                    <option value="">Sélectionner...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>{app.nom}</option>
                    ))}
                  </select>
                </div>
<div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Rôle</label>
                   <input
                     type="text"
                     value={formData.role}
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                     placeholder="USER ou ADMIN"
                   />
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Nom d'utilisateur</label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Code</label>
                  <input
                    required
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Mot de passe/code"
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">Commentaire</label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                  className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  rows={2}
                />
              </div>
              <button disabled={isSubmitting} className="rounded-2xl bg-emerald-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingAccount ? "Mettre à jour" : "Créer"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <p className="text-sm">Aucun compte disponible.</p>
        </div>
      ) : (
        <>
{/* Desktop/Tablet Table View */}
           <div className="hidden sm:block overflow-x-auto hide-scrollbar w-full">
             <table className="w-full text-left border-separate border-spacing-y-4 border border-slate-200 dark:border-slate-700">
<thead>
                 <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                   <th className="px-6 py-3">Utilisateur</th>
                   <th className="px-6 py-3">Application</th>
                   <th className="px-6 py-3">Description</th>
                   <th className="px-6 py-3">Rôle</th>
                   <th className="px-6 py-3">Statut</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                 </tr>
               </thead>
              <tbody>
                {filteredAccounts.map(account => (
                  <motion.tr 
                    layout 
                    key={account.id} 
                     className="group transition-all duration-300"
                  >
                    <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-extrabold text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-400">
                          {account.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{account.username}</p>
                      </div>
                    </td>
                    <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {applications.find(a => a.id === account.applicationId)?.nom || '-'}
                      </p>
                    </td>
                    <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[200px]">
                        {account.commentaire || '-'}
                      </p>
                    </td>
                    <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${account.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Actif
                      </span>
                    </td>
                    <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleView(account)}
                          className="p-2.5 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 transition-all"
                          title="Voir"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(account)}
                          className="p-2.5 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-all"
                          title="Modifier"
                        >
                          <Edit3 className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(account.id)}
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
            {filteredAccounts.length === 0 && accounts.length > 0 && (
              <div className="py-20 text-center text-slate-500">
                <p className="text-sm">Aucun compte ne correspond à vos filtres.</p>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden grid gap-4">
            {filteredAccounts.map((account) => (
              <motion.div
                layout
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-500/10">
                      {account.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{account.username}</h3>
                      <p className="text-[10px] font-extrabold uppercase text-slate-400">Rôle: {account.role}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-emerald-700">
                    Actif
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 mb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Application: <span className="font-bold text-slate-700 dark:text-slate-200">
                          {applications.find(a => a.id === account.applicationId)?.nom || '-'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Code: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{'•'.repeat(account.code.length)}</span>
                      </p>
                      {account.commentaire && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {account.commentaire}
                        </p>
                      )}
                    </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => handleView(account)} className="p-2 text-slate-400"><Eye className="h-5 w-5"/></button>
                  <button onClick={() => handleEdit(account)} className="p-2 text-slate-400"><Edit3 className="h-5 w-5"/></button>
                  <button onClick={() => handleDelete(account.id)} className="p-2 text-rose-400"><Trash2 className="h-5 w-5"/></button>
                </div>
              </motion.div>
            ))}
            {filteredAccounts.length === 0 && accounts.length > 0 && (
              <div className="py-20 text-center text-slate-500">
                <p className="text-sm">Aucun compte ne correspond à vos filtres.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}