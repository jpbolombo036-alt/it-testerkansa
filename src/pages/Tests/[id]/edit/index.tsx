import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchTestSessionById, updateTestSession, TestSession } from '../../../../api/testSessionApi'
import { fetchApplications, Application } from '../../../../api/applicationApi'
import { Loader2, X, ClipboardCheck, Calendar } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

export default function TestSessionEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    environnement: 'PRODUCTION' as string,
    version: '',
    nom_document: '',
    applicationId: undefined as number | undefined
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [session, apps] = await Promise.all([
          fetchTestSessionById(Number(id)),
          fetchApplications()
        ])
        setFormData({
          nom: session.nom,
          description: session.description || '',
          environnement: session.environnement || 'PRODUCTION',
          version: session.version || '',
          nom_document: session.nom_document || '',
          applicationId: session.applicationId
        })
        setApplications(apps)
      } catch {
        showToast('error', 'Erreur', 'Session introuvable.')
        navigate('/tests')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nom.trim()) {
      showToast('error', 'Erreur', 'Le nom est obligatoire.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateTestSession(Number(id), formData)
      showToast('success', 'Session modifiée', 'Les modifications ont été enregistrées.')
      navigate('/tests')
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier la session.')
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
          onClick={() => navigate('/tests')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier la session</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez la session "{formData.nom}"</p>
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
              <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Environnement</label>
              <select
                value={formData.environnement}
                onChange={(e) => setFormData({...formData, environnement: e.target.value as any})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              >
                <option value="DEVELOPPEMENT">Développement</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Application</label>
              <select
                value={formData.applicationId ?? ''}
                onChange={(e) => setFormData({...formData, applicationId: e.target.value ? Number(e.target.value) : undefined})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              >
                <option value="">Aucune</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>{app.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="ex: 1.0.0"
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Nom du document</label>
            <input
              type="text"
              value={formData.nom_document}
              onChange={(e) => setFormData({...formData, nom_document: e.target.value})}
              placeholder="Nom du document associé"
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
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
              onClick={() => navigate('/tests')}
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
