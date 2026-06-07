import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchAccounts, createAccount, updateAccount, deleteAccount, fetchAccountById, Account, AccountCreateData } from '../../api/accountApi'
import { fetchApplications, Application } from '../../api/applicationApi'
import { Folder, Trash2, Edit3, Eye, Plus, Loader2, X, Key } from 'lucide-react'

export default function ComptesPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<AccountCreateData>({
    applicationId: 0,
    username: '',
    code: '',
    role: 'USER',
    commentaire: ''
  })
  
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null)

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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce compte ?")) return
    try {
      await deleteAccount(id)
      setAccounts(accounts.filter(a => a.id !== id))
    } catch (err) {
      alert("Erreur lors de la suppression")
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      applicationId: account.applicationId,
      username: account.username,
      code: account.code,
      role: account.role,
      commentaire: account.commentaire
    })
    setShowForm(true)
  }

  const handleView = (account: Account) => {
    setViewingAccount(account)
    setShowViewModal(true)
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
    } catch (err) {
      alert("Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Folder className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Comptes</h1>
            <p className="text-slate-500 dark:text-slate-400">Gérez les accès et les rôles</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Nouveau compte
        </button>
      </div>

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
              <div className="grid grid-cols-2 gap-4">
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
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
      ) : (
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3 pb-2">Utilisateur</th>
                <th className="px-3 pb-2">Application</th>
                <th className="px-3 pb-2">Rôle</th>
                <th className="px-3 pb-2">Statut</th>
                <th className="px-3 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <motion.tr layout key={account.id} className="group">
                  <td className="rounded-l-2xl bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{account.username}</p>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">
                      {applications.find(a => a.id === account.applicationId)?.nom || '-'}
                    </p>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                      account.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {account.role}
                    </span>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Actif</span>
                  </td>
                  <td className="rounded-r-2xl bg-slate-50/50 p-3 text-right dark:bg-slate-800/40">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleView(account)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                        title="Voir"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(account)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(account.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <p className="text-sm">Aucun compte disponible.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showViewModal && viewingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Détails du compte</h3>
                <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="font-semibold">Utilisateur:</span> {viewingAccount.username}</div>
                <div><span className="font-semibold">Application:</span> {applications.find(a => a.id === viewingAccount.applicationId)?.nom || '-'}</div>
                <div><span className="font-semibold">Code:</span> {viewingAccount.code}</div>
                <div><span className="font-semibold">Rôle:</span> {viewingAccount.role}</div>
                <div><span className="font-semibold">Commentaire:</span> {viewingAccount.commentaire || '-'}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
