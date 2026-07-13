import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  fetchApkById,
  uploadApk,
  deleteApk,
  ApkFileDTO,
} from '../../../../api/apkApi'
import { Loader2, X, Upload, Package, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'
import { useConfirm } from '../../../../hooks/useConfirm'

export default function ApkEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const { confirm, dialog } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apk, setApk] = useState<ApkFileDTO | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await fetchApkById(Number(id))
        setApk(data)
      } catch {
        showToast('error', 'Erreur', 'Impossible de charger l\'APK.')
        navigate('/apk')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, showToast])

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
    const selected = e.dataTransfer.files[0] || null
    handleFileChange(selected)
  }

  const handleFileChange = (selected: File | null) => {
    setFile(selected)
    setErrors((prev) => {
      const next = { ...prev }
      delete next.file
      return next
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!file) next.file = 'Veuillez sélectionner un fichier APK.'
    if (file && !file.name.toLowerCase().endsWith('.apk')) next.file = 'Le fichier doit avoir l\'extension .apk.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleReplace = async () => {
    if (!id || !apk || !file) return
    confirm({
      message: `Remplacer l'APK actuel par "${file.name}" ? L'ancien fichier sera supprimé.`,
      title: 'Remplacement d\'APK',
      variant: 'danger',
      confirmText: 'Remplacer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          setSaving(true)
          await uploadApk(file, {
            applicationId: apk.applicationId ?? undefined,
            version: apk.version ?? undefined,
            packageName: apk.packageName ?? undefined,
            description: apk.description ?? undefined,
          })
          await deleteApk(Number(id))
          showToast('success', 'Remplacement réussi', 'L\'APK a été remplacé avec succès.')
          navigate('/apk')
        } catch {
          showToast('error', 'Erreur', 'Échec du remplacement de l\'APK.')
        } finally {
          setSaving(false)
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!apk) return null

  return (
    <div className="space-y-6 p-6">
      {dialog}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/apk')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Remplacer l'APK</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Seul le fichier binaire peut être modifié</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-xs font-bold uppercase text-slate-500">APK actuel</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{apk.originalFileName}</p>
            <p className="text-xs text-slate-500">
              v{apk.version ?? '—'} • {(apk.fileSize / (1024 * 1024)).toFixed(2)} Mo • {new Date(apk.uploadDate).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" /> Nouveau fichier APK *
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
              {file ? (
                <div className="space-y-2">
                  <Package className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} Mo</p>
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
                    Glissez-déposez le nouveau fichier APK ici, ou cliquez pour parcourir
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

          <div className="flex flex-row flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleReplace}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remplacer l'APK
            </button>
            <button
              type="button"
              onClick={() => navigate('/apk')}
              className="rounded-2xl bg-slate-100 px-6 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
