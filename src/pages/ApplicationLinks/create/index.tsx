import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createApplicationLink } from '../../../api/applicationLinkApi'
import { fetchApplications, Application } from '../../../api/applicationApi'
import { ApplicationLinkForm } from '../../../types/applicationLinkTypes'
import { Loader2, Plus, X, Globe, Link as LinkIcon } from 'lucide-react'
import { useToast } from '../../../components/ToastProvider'

const LINK_TYPES = [
  'production',
  'recette',
  'développement',
  'documentation',
  'support',
  'administration'
]

export default function ApplicationLinkCreatePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  const [formData, setFormData] = useState<ApplicationLinkForm>({
    applicationId: 0,
    nom: '',
    url: '',
    type: 'production',
    description: ''
  })

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await fetchApplications()
        setApplications(data)
      } catch {
        console.error('Erreur chargement applications')
      } finally {
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
    if (!formData.nom.trim()) {
      showToast('error', 'Erreur', 'Le nom est obligatoire.')
      return
    }
    if (!formData.url.trim()) {
      showToast('error', 'Erreur', 'L\'URL est obligatoire.')
      return
    }
    try {
      setIsSubmitting(true)
      await createApplicationLink(formData)
      showToast('success', 'Lien créé', 'Le lien a été ajouté avec succès.')
      navigate('/application-links')
    } catch {
      showToast('error', 'Erreur', 'Impossible de créer le lien.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/application-links')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nouveau lien web</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Créez un nouveau lien associé à une application</p>
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
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950 disabled:opacity-50"
              >
                <option value="">Sélectionner...</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>{app.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              >
                {LINK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" /> URL *
            </label>
            <input
              type="url"
              required
              maxLength={500}
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://example.com"
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer le lien
            </button>
            <button
              type="button"
              onClick={() => navigate('/application-links')}
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
