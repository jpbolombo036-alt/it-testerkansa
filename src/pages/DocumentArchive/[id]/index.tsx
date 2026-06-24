import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchDocumentById, deleteDocument, DocumentArchive } from '../../../api/documentArchiveApi'
import { Loader2, Eye, Download, Trash2, X, FileText, HardDrive, Calendar, User, Tag, ArrowLeft } from 'lucide-react'
import { useToast } from '../../../components/ToastProvider'
import { formatFileSize } from '../../../utils/fileSizeFormatter'

export default function DocumentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [doc, setDoc] = useState<DocumentArchive | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadDocument = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await fetchDocumentById(Number(id))
      setDoc(data)
    } catch {
      showToast('error', 'Erreur', 'Document introuvable.')
      navigate('/document-archive')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocument()
  }, [id])

  const handleDelete = async () => {
    if (!doc) return
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) return
    try {
      await deleteDocument(doc.id!)
      showToast('success', 'Supprimé', 'Document supprimé avec succès.')
      navigate('/document-archive')
    } catch {
      showToast('error', 'Erreur', 'Échec de la suppression.')
    }
  }

  const getDocumentTypeInfo = (contentType: string) => {
    if (contentType === 'application/pdf') {
      return { label: 'PDF', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' }
    }
    if (
      contentType === 'application/vnd.openxmlformats-officedoc.wordprocessingml.document' ||
      contentType === 'application/msword'
    ) {
      return { label: 'WORD', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' }
    }
    return { label: 'AUTRE', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' }
  }

  const getApiBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL
    if (rawUrl && rawUrl.trim() !== '') {
      return rawUrl.trim().replace(/\/$/, '')
    }
    return 'http://localhost:8000'
  }

  const handleDownload = () => {
    if (!doc) return
    const url = `${getApiBaseUrl()}/api/document-archive/download/${doc.id}`
    const a = document.createElement('a')
    a.href = url
    a.download = doc.originalFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <FileText className="h-16 w-16 text-slate-300" />
        <p className="text-slate-500">Document introuvable.</p>
        <button
          onClick={() => navigate('/document-archive')}
          className="rounded-2xl bg-violet-600 px-6 py-2.5 font-bold text-white hover:bg-violet-700"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  const typeInfo = getDocumentTypeInfo(doc.contentType)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/document-archive')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{doc.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{doc.originalFileName}</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Titre</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{doc.title}</p>
            </div>
            {doc.description && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-500">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{doc.description}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Catégorie</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                doc.category ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {doc.category || 'Aucune'}
              </span>
            </div>
            {doc.tags && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.split(',').map((tag: string, idx: number) => (
                    <span key={idx} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Auteur</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{doc.author || '-'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Uploadé par</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{doc.uploadedByUsername}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Date d'upload
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {new Date(doc.uploadDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5" /> Taille du fichier
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{formatFileSize(doc.fileSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Type MIME</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">{doc.contentType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Téléchargements</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{doc.downloadCount || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-500">Type</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <button
            onClick={() => navigate(`/document-archive/${doc.id}/preview`)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-2.5 font-bold text-white transition hover:bg-violet-700"
          >
            <Eye className="h-4 w-4" />
            Prévisualiser
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-100 px-6 py-2.5 font-bold text-rose-700 transition hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  )
}
