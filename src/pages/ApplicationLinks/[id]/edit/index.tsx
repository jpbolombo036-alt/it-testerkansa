import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchApplicationLinkById, updateApplicationLink } from '../../../../api/applicationLinkApi'
import { fetchApplications, Application } from '../../../../api/applicationApi'
import { ApplicationLinkForm } from '../../../../types/applicationLinkTypes'
import { Loader2, X, Globe, Link as LinkIcon } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

const LINK_TYPES = [
  'production',
  'recette',
  'développement',
  'documentation',
  'support',
  'administration'
]

export default function ApplicationLinkEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])

  const [formData, setFormData] = useState<ApplicationLinkForm>({
    applicationId: 0,
    nom: '',
    url: '',
    type: 'production',
    description: ''
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [link, apps] = await Promise.all([
          fetchApplicationLinkById(Number(id)),
          fetchApplications()
        ])
        setFormData({
          applicationId: link.applicationId,
          nom: link.nom,
          url: link.url,
          type: link.type || 'production',
          description: link.description || ''
        })
        setApplications(apps)
      } catch {
        showToast('error', 'Erreur', 'Lien introuvable.')
        navigate('/application-links')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applicationId || !formData.nom.trim() || !formData.url.trim()) {
      showToast('error', 'Erreur', 'Tous les champs obligatoires doivent être remplis.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateApplicationLink(Number(id), formData)
      showToast('success', 'Lien modifié', 'Les modifications ont été enregistrées.')
      navigate('/application-links')
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier le lien.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    )
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier le lien web</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez le lien "{formData.nom}"</p>
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
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
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
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
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
