import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  fetchApks,
  fetchApkById,
  deleteApk,
  downloadApk,
  ApkFileDTO,
} from '../../api/apkApi'
import { useAuth } from '../../hooks/useAuth'
import { Loader2, Upload, Download, Trash2, Package, Calendar, HardDrive, ChevronLeft, ChevronRight, Smartphone, Tag, Edit3 } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'
import { useConfirm } from '../../hooks/useConfirm'
import { usePagination } from '../../hooks/usePagination'
import { formatFileSize } from '../../utils/fileSizeFormatter'

const ITEMS_PER_PAGE = 20

export default function ApkPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { confirm, dialog } = useConfirm()
  const { user } = useAuth()
  const [apks, setApks] = useState<ApkFileDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadApks = async () => {
    try {
      setIsLoading(true)
      const data = await fetchApks(0, ITEMS_PER_PAGE)
      setApks(data)
    } catch {
      showToast('error', 'Erreur', 'Impossible de charger les APK.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApks()
  }, [])

  const handleDownload = async (id: number, originalFileName: string) => {
    try {
      const { blob, filename } = await downloadApk(id, originalFileName)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('success', 'Téléchargement', 'Téléchargement lancé.')
    } catch {
      showToast('error', 'Erreur', 'Téléchargement impossible.')
    }
  }

  const handleDelete = async (id: number) => {
    confirm({
      message: 'Supprimer cet APK ? Cette action est irréversible.',
      title: 'Suppression',
      variant: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          setDeletingId(id)
          await deleteApk(id)
          setApks(apks.filter(a => a.id !== id))
          showToast('success', 'Supprimé', 'APK supprimé avec succès.')
        } catch {
          showToast('error', 'Erreur', 'Échec de la suppression.')
        } finally {
          setDeletingId(null)
        }
      },
    })
  }

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    paginatedItems: displayItems,
  } = usePagination(apks, ITEMS_PER_PAGE)

  const isAdmin = user?.role === 'admin'

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {dialog}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Smartphone className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">APK</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gérez vos fichiers APK</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/apk/upload')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 w-full sm:w-auto"
          >
            <Upload className="h-5 w-5" />
            Uploader un APK
          </button>
        </div>
      </motion.div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        {displayItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4 border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-3">Fichier</th>
                  <th className="px-6 py-3">Version</th>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Taille</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((apk) => {
                   const canDelete = isAdmin
                  return (
                    <motion.tr
                      layout
                      key={apk.id}
                      className="group transition-all duration-300"
                    >
                      <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-extrabold text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-400">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{apk.originalFileName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{apk.description || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        {apk.version ? (
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            v{apk.version}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{apk.packageName || '—'}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{formatFileSize(apk.fileSize)}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(apk.uploadDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/apk/${apk.id}/edit`)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(apk.id, apk.originalFileName)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 transition-all"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(apk.id)}
                              disabled={deletingId === apk.id}
                              className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deletingId === apk.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            {displayItems.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                <p className="text-sm">Aucun APK disponible.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <Smartphone className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Aucun APK disponible.</p>
            <button
              onClick={() => navigate('/apk/upload')}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <Upload className="h-4 w-4" />
              Uploader un APK
            </button>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {totalItems} éléments — Page {currentPage + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
