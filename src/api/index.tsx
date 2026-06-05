import React, { useEffect, useState } from 'react'
import { fetchAccounts, createAccount, deleteAccount, Account, AccountCreateData } from '../../api/accountApi'
import { CreditCard, Plus, Trash2, Edit3, Eye, Search, Loader2, X, Shield, Info, Key, AppWindow } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState<AccountCreateData>({
    applicationId: 0,
    username: '',
    code: '',
    role: '',
    commentaire: ''
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setIsLoading(true)
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (err) {
      console.error("Erreur chargement comptes", err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const newAccount = await createAccount(formData)
      setAccounts([newAccount, ...accounts])
      setShowModal(false)
      setFormData({ applicationId: 0, username: '', code: '', role: '', commentaire: '' })
    } catch (err) {
      alert("Erreur lors de la création")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAccounts = accounts.filter(a => 
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <CreditCard className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Gestion des Comptes</h1>
            <p className="text-slate-500 dark:text-slate-400">Administrez les identifiants et rôles par application</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-700"
        >
          <Plus className="h-5 w-5" />
          Nouveau compte
        </button>
      </div>

      {/* Table Section */}
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un compte ou un rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-violet-100 dark:bg-slate-950 dark:ring-slate-800 dark:focus:ring-violet-900/30"
          />
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 px-4">
                  <th className="px-4 pb-2">Identifiant</th>
                  <th className="px-4 pb-2">Application</th>
                  <th className="px-4 pb-2">Rôle</th>
                  <th className="px-4 pb-2">Code</th>
                  <th className="px-4 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <motion.tr layout key={account.id} className="group">
                    <td className="rounded-l-3xl bg-slate-50/50 p-4 dark:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-violet-600 shadow-sm dark:bg-slate-950">
                          <Key className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{account.username}</span>
                      </div>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                      <span className="text-sm text-slate-600 dark:text-slate-400">ID App: {account.applicationId}</span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                      <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                        {account.role}
                      </span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 font-mono text-xs text-slate-500">
                      {account.code}
                    </td>
                    <td className="rounded-r-3xl bg-slate-50/50 p-4 text-right dark:bg-slate-800/40">
                      <div className="flex justify-end gap-1">
                        <button className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Voir"><Eye className="h-4 w-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Modifier"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(account.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nouveau Compte */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Créer un compte</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">ID Application</label>
                    <div className="relative">
                      <AppWindow className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        required
                        value={formData.applicationId}
                        onChange={(e) => setFormData({...formData, applicationId: parseInt(e.target.value)})}
                        className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950 dark:ring-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nom d'utilisateur</label>
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950 dark:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Code / MDP</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950 dark:ring-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rôle</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: ADMIN"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950 dark:ring-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Commentaire</label>
                  <textarea 
                    value={formData.commentaire}
                    onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950 dark:ring-slate-800"
                    rows={3}
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="mx-auto animate-spin" /> : "Enregistrer le compte"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}