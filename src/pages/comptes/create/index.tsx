import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createAccount, AccountCreateData } from '../../../api/accountApi'
import { fetchApplications, Application } from '../../../api/applicationApi'
import { Loader2, Plus, X, Key, Shield } from 'lucide-react'
import { useToast } from '../../../components/ToastProvider'

export default function CompteCreatePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  const [formData, setFormData] = useState<AccountCreateData>({
    applicationId: 0,
    username: '',
    code: '',
    role: '',
    commentaire: ''
  })

  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoadingApps(false)
        const data = await fetchApplications()
        setApplications(data)
      } catch {
        setLoadingApps(false)
      }
    }
    loadApps()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applicationId) {
      showToast('error', 'Erreur', 'L\'application est obligatoire.')
      return
    }
    if (!formData.username.trim()) {
      showToast('error', 'Erreur', 'Le nom d\'utilisateur est obligatoire.')
      return
    }
    if (!formData.code.trim()) {
      showToast('error', 'Erreur', 'Le code d\'accès est obligatoire.')
      return
    }
    try {
      setIsSubmitting(true)
      await createAccount(formData)
      showToast('success', 'Compte créé', 'Le compte a été créé avec succès.')
      navigate('/comptes')
    } catch {
      showToast('error', 'Erreur', 'Erreur lors de la création du compte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/comptes')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nouveau compte d'accès</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Créez un nouvel identifiant pour une application</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Application *</label>
              <select
                required
                value={formData.applicationId || ''}
                onChange={(e) => setFormData({...formData, applicationId: Number(e.target.value)})}
                disabled={loadingApps}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 disabled:opacity-50"
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
                 placeholder="Ex : Admin, client, etc."
               />
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Nom d'utilisateur *</label>
              <input
                required
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Code d'accès *</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Mot de passe / code"
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
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer le compte
            </button>
            <button
              type="button"
              onClick={() => navigate('/comptes')}
              className="rounded-2xl bg-slate-100 px-6 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
