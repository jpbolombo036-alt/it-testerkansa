import React, { useState, useEffect } from 'react'
import { fetchApks, uploadApk, ApkFile } from '../../api/apkApi'
import { Layers, Download, Upload, Plus, FileCode, Calendar, HardDrive, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApplicationsPage() {
  const [apks, setApks] = useState<ApkFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // État du formulaire d'ajout
  const [file, setFile] = useState<File | null>(null)
  const [version, setVersion] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadApks()
  }, [])

  const loadApks = async () => {
    try {
      setIsLoading(true)
      const data = await fetchApks()
      setApks(data)
    } catch (err) {
      console.error("Erreur chargement APKs", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !version) return

    try {
      setIsUploading(true)
      // L'ID d'application est ici 1 par défaut pour l'exemple
      await uploadApk(file, 1, version, description)
      setShowUploadModal(false)
      setFile(null)
      setVersion('')
      setDescription('')
      loadApks()
    } catch (err) {
      alert("Erreur lors de l'envoi du fichier")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            <Layers className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Applications</h1>
            <p className="text-slate-500 dark:text-slate-400">Gérez les versions APK et les déploiements</p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
        >
          <Plus className="h-5 w-5" />
          Nouvelle version
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apks.map((apk) => (
            <div key={apk.id} className="group relative rounded-[2rem] bg-white p-6 shadow-soft transition-all hover:shadow-lg dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <FileCode className="h-6 w-6 text-sky-600" />
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  v{apk.version}
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-100">Build #{apk.id}</h3>
              <p className="mb-4 text-sm text-slate-500 line-clamp-2">{apk.description || "Aucune description fournie."}</p>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <HardDrive className="h-3 w-3" />
                  {apk.downloadCount} téléchargements
                </div>
                <a 
                  href={apk.downloadUrl}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-sky-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'Upload */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ajouter un APK</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fichier APK</label>
                  <input 
                    type="file" 
                    accept=".apk"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border-2 border-dashed border-slate-200 p-4 text-sm dark:border-slate-700" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Version (ex: 1.0.4)</label>
                  <input 
                    type="text" 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes de version</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" 
                    rows={3}
                  />
                </div>
                <button
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload className="h-5 w-5" />}
                  {isUploading ? "Envoi en cours..." : "Publier la version"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}