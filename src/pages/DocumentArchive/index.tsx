import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchDocuments,
  fetchDocumentsByCategory,
  searchDocuments,
  deleteDocument,
  DocumentArchive,
  PageResponse,
} from '../../api/documentArchiveApi'
import { Loader2, Plus, Search, X, Trash2, Eye, Download, FileText, FolderOpen, HardDrive, Calendar, User, Tag, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'
import { usePagination } from '../../hooks/usePagination'
import { formatFileSize } from '../../utils/fileSizeFormatter'
import { DOCUMENT_CATEGORIES } from '../../utils/documentCategories'

const ITEMS_PER_PAGE = 20

export default function DocumentArchivePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [documents, setDocuments] = useState<DocumentArchive[]>([])
  const [pageResponse, setPageResponse] = useState<PageResponse<DocumentArchive> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [useBackendSearch, setUseBackendSearch] = useState(false)
  const [useBackendCategory, setUseBackendCategory] = useState(false)

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const data = await fetchDocuments(0, ITEMS_PER_PAGE)
      setPageResponse(data)
      setDocuments(data.content)
      setUseBackendSearch(false)
      setUseBackendCategory(false)
    } catch (err) {
      console.error('Erreur chargement documents', err)
      showToast('error', 'Erreur', 'Impossible de charger les documents.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadDocuments()
      return
    }
    try {
      setIsLoading(true)
      const data = await searchDocuments(query)
      setDocuments(data)
      setPageResponse(null)
      setUseBackendSearch(true)
      setUseBackendCategory(false)
    } catch (err) {
      console.error('Erreur recherche', err)
      showToast('error', 'Erreur', 'Impossible d\'effectuer la recherche.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryFilter = async (category: string) => {
    if (!category) {
      loadDocuments()
      return
    }
    try {
      setIsLoading(true)
      const data = await fetchDocumentsByCategory(category)
      setDocuments(data)
      setPageResponse(null)
      setUseBackendCategory(true)
      setUseBackendSearch(false)
    } catch (err) {
      console.error('Erreur filtre catégorie', err)
      showToast('error', 'Erreur', 'Impossible de filtrer par catégorie.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) return
    try {
      await deleteDocument(id)
      if (useBackendSearch) {
        setDocuments(documents.filter(d => d.id !== id))
      } else if (useBackendCategory) {
        setDocuments(documents.filter(d => d.id !== id))
      } else if (pageResponse) {
        setDocuments(pageResponse.content.filter(d => d.id !== id))
        setPageResponse({
          ...pageResponse,
          content: pageResponse.content.filter(d => d.id !== id),
          totalElements: pageResponse.totalElements - 1,
        })
      }
      showToast('success', 'Supprimé', 'Document supprimé avec succès.')
    } catch {
      showToast('error', 'Erreur', 'Échec de la suppression.')
    }
  }

  const paginatedItems = useMemo(() => {
    return useBackendSearch || useBackendCategory ? documents : documents
  }, [documents, useBackendSearch, useBackendCategory])

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    paginatedItems: displayItems,
  } = usePagination(paginatedItems, ITEMS_PER_PAGE)

  const getDocumentTypeInfo = (contentType: string) => {
    if (contentType === 'application/pdf') {
      return { label: 'PDF', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' }
    }
    if (
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
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

  const handleDownload = (doc: DocumentArchive) => {
    const url = `${getApiBaseUrl()}/api/document-archive/download/${doc.id}`
    const a = document.createElement('a')
    a.href = url
    a.download = doc.originalFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePreview = (id: number) => {
    navigate(`/document-archive/${id}/preview`)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <FolderOpen className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Archive Documents</h1>
              <p className="text-slate-500 dark:text-slate-400">Gérez vos documents PDF et Word</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/document-archive/upload')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700 w-full sm:w-auto"
          >
            <Upload className="h-5 w-5" />
            Uploader un document
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, description, tags ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(searchTerm)
              }}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  loadDocuments()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(searchTerm)}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              handleCategoryFilter(e.target.value)
            }}
            className="rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
          >
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {(useBackendSearch || useBackendCategory) && (
            <button
              onClick={loadDocuments}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <X className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </motion.div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-3">Document</th>
                  <th className="px-6 py-3">Catégorie</th>
                  <th className="px-6 py-3">Auteur</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Taille</th>
                  <th className="px-6 py-3">Téléchargements</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((doc) => {
                  const typeInfo = getDocumentTypeInfo(doc.contentType)
                  return (
                    <motion.tr
                      layout
                      key={doc.id}
                      className="group transition-all duration-300 hover:translate-x-1"
                    >
                      <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-extrabold text-violet-600 shadow-sm dark:bg-slate-950 dark:text-violet-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{doc.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{doc.originalFileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                          {doc.category || '-'}
                        </span>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{doc.author || '-'}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.downloadCount || 0}</span>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePreview(doc.id!)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 transition-all"
                            title="Prévisualiser"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 transition-all"
                            title="Télécharger"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id!)}
                            className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            {displayItems.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                <p className="text-sm">Aucun document ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && !useBackendSearch && !useBackendCategory && pageResponse && (
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

      {displayItems.length > 0 && (useBackendSearch || useBackendCategory) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{totalItems} éléments trouvés</p>
        </div>
      )}
    </div>
  )
}
