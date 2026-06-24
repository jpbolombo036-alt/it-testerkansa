import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchDocumentById, DocumentArchive } from '../../../../api/documentArchiveApi'
import { Loader2, X, FileText, Download, ArrowLeft } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

export default function DocumentPreviewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [document, setDocument] = useState<DocumentArchive | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getApiBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL
    if (rawUrl && rawUrl.trim() !== '') {
      return rawUrl.trim().replace(/\/$/, '')
    }
    return 'http://localhost:8000'
  }

  const loadDocument = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await fetchDocumentById(Number(id))
      setDocument(data)
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

  const isPdf = document?.contentType === 'application/pdf'
  const isWord =
    document?.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    document?.contentType === 'application/msword'

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!document) {
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

  const downloadUrl = `${getApiBaseUrl()}/api/document-archive/download/${document.id}`

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/document-archive/${document.id}`)}
            className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{document.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{document.originalFileName}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/document-archive/${document.id}`)}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          title="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        {isPdf && (
          <iframe
            src={downloadUrl}
            title={document.title}
            width="100%"
            height="75vh"
            style={{ border: 'none' }}
          />
        )}

        {isWord && (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <FileText className="h-20 w-20 text-blue-400" />
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Prévisualisation non disponible</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                La prévisualisation des fichiers Word n'est pas supportée directement dans le navigateur.
              </p>
            </div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={document.originalFileName}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 font-bold text-white transition hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Télécharger le fichier
            </a>
          </div>
        )}

        {!isPdf && !isWord && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <FileText className="h-16 w-16 text-slate-300" />
            <p className="text-slate-500">Format non pris en charge pour la prévisualisation.</p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={document.originalFileName}
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-2.5 font-bold text-white transition hover:bg-violet-700"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
          </div>
        )}
      </motion.div>
    </div>
  )
}
