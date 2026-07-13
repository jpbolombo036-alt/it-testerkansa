import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { uploadApk } from '../../../api/apkApi'
import { fetchApplications, Application } from '../../../api/applicationApi'
import { Loader2, X, Upload, Package, AlertCircle, CheckCircle, Tag, Hash, Globe } from 'lucide-react'
import { useToast } from '../../../components/ToastProvider'

const ENVIRONNEMENTS = ['DEV', 'UAT', 'PROD'] as const

interface UploadForm {
  file: File | null
  applicationId: string
  version: string
  packageName: string
  description: string
  environnement: string
}

export default function ApkUploadPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<UploadForm>({
    file: null,
    applicationId: '',
    version: '',
    packageName: '',
    description: '',
    environnement: '',
  })

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await fetchApplications()
        setApplications(Array.isArray(data) ? data : [])
      } catch {
        setApplications([])
      } finally {
        setLoadingApps(false)
      }
    }
    loadApplications()
  }, [])

  const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const selectedApp = applications.find((a) => String(a.id) === selectedId)
    setFormData((prev) => ({
      ...prev,
      applicationId: selectedId,
      version: selectedApp?.version || '',
    }))
  }

  const validateForm = (): boolean => {
    const next: Record<string, string> = {}
    if (!formData.file) next.file = 'Le fichier APK est requis.'
    if (formData.file && !formData.file.name.toLowerCase().endsWith('.apk')) next.file = 'Le fichier doit avoir l\'extension .apk.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, file }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.file
      return next
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0] || null
    handleFileChange(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      showToast('error', 'Validation', 'Veuillez corriger les erreurs dans le formulaire.')
      return
    }
    if (!formData.file) return

    try {
      setIsSubmitting(true)
      const meta = {
        applicationId: formData.applicationId ? Number(formData.applicationId) : undefined,
        version: formData.version || undefined,
        packageName: formData.packageName || undefined,
        description: formData.description || undefined,
      }
      await uploadApk(formData.file, meta)
      showToast('success', 'Upload réussi', 'L\'APK a été uploadé avec succès.')
      navigate('/apk')
    } catch (err) {
      showToast('error', 'Erreur', (err as Error).message || 'Erreur lors de l\'upload de l\'APK.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/apk')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Uploader un APK</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ajoutez un nouveau fichier APK</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Package className="h-3.5 w-3.5" /> Fichier APK *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                  : errors.file
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10'
                  : 'border-slate-200 bg-slate-50 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".apk"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              {formData.file ? (
                <div className="space-y-2">
                  <Package className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formData.file.name}</p>
                  <p className="text-xs text-slate-500">{(formData.file.size / (1024 * 1024)).toFixed(2)} Mo</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFileChange(null)
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                  >
                    <X className="h-3 w-3" /> Retirer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Glissez-déposez votre fichier APK ici, ou cliquez pour parcourir
                  </p>
                  <p className="text-xs text-slate-500">Fichier .apk uniquement</p>
                </div>
              )}
            </div>
            {errors.file && (
              <div className="flex items-center gap-1.5 text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <p className="text-xs">{errors.file}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" /> Application *
            </label>
            <select
              value={formData.applicationId}
              onChange={handleApplicationChange}
              disabled={loadingApps}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 disabled:opacity-50"
            >
              <option value="">{loadingApps ? 'Chargement...' : 'Sélectionner une application'}</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="ex: 2.3.1"
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Environnement
              </label>
              <select
                value={formData.environnement}
                onChange={(e) => setFormData({ ...formData, environnement: e.target.value })}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
              >
                <option value="">Sélectionner un environnement</option>
                {ENVIRONNEMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Package Name (optionnel)
            </label>
            <input
              type="text"
              value={formData.packageName}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
              placeholder="ex: com.itaccess.monapp"
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description (optionnel)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'APK..."
              rows={3}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
            />
          </div>

          <div className="flex flex-row flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Uploader
            </button>
            <button
              type="button"
              onClick={() => navigate('/apk')}
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
