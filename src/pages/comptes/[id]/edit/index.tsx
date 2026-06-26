import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchAccountById, updateAccount, Account } from '../../../../api/accountApi'
import { fetchApplications, Application } from '../../../../api/applicationApi'
import { Loader2, X, Key, Shield, User, Globe } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

export default function CompteEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])

  const [formData, setFormData] = useState<Account>({
    id: 0,
    applicationId: 0,
    username: '',
    code: '',
    role: 'USER',
    commentaire: ''
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [account, apps] = await Promise.all([
          fetchAccountById(Number(id)),
          fetchApplications()
        ])
        setFormData({
          id: account.id,
          applicationId: account.applicationId,
          username: account.username,
          code: account.code,
          role: account.role,
          commentaire: account.commentaire
        })
        setApplications(apps)
      } catch {
        showToast('error', 'Erreur', 'Compte introuvable.')
        navigate('/comptes')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applicationId || !formData.username?.trim() || !formData.code?.trim()) {
      showToast('error', 'Erreur', 'Tous les champs obligatoires doivent être remplis.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateAccount(Number(id), formData)
      showToast('success', 'Compte modifié', 'Les modifications ont été enregistrées.')
      navigate('/comptes')
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier le compte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier le compte</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez le compte de {formData.username}</p>
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
                value={formData.applicationId}
                onChange={(e) => setFormData({...formData, applicationId: Number(e.target.value)})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              >
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
              <label className="text-xs font-bold uppercase text-slate-500">Nom d'utilisateur *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Code d'accès *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
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
