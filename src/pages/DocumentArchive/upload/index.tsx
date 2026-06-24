import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadDocument, DocumentArchive } from '../../../api/documentArchiveApi'
import { Loader2, Plus, X, Upload, FileText, AlertCircle, CheckCircle, Tag } from 'lucide-react'
import { useToast } from '../../../components/ToastProvider'
import { DOCUMENT_CATEGORIES } from '../../../utils/documentCategories'
import { validateDocumentForm } from '../../../utils/documentValidation'

interface UploadForm {
  file: File | null
  title: string
  description: string
  category: string
  tags: string
  author: string
}

export default function DocumentUploadPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<UploadForm>({
    file: null,
    title: '',
    description: '',
    category: '',
    tags: '',
    author: '',
  })

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
    const validationErrors = validateDocumentForm(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Validation', 'Veuillez corriger les erreurs dans le formulaire.')
      return
    }
    if (!formData.file) return

    try {
      setIsSubmitting(true)
      setUploadProgress(0)
      const fd = new FormData()
      fd.append('file', formData.file)
      fd.append('title', formData.title)
      if (formData.description) fd.append('description', formData.description)
      if (formData.category) fd.append('category', formData.category)
      if (formData.tags) fd.append('tags', formData.tags)
      if (formData.author) fd.append('author', formData.author)

      await uploadDocument(fd)
      showToast('success', 'Upload réussi', 'Le document a été uploadé avec succès.')
      navigate('/document-archive')
    } catch {
      showToast('error', 'Erreur', 'Erreur lors de l\'upload du document. Vérifiez le fichier et les champs puis réessayez.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const getFileTypeInfo = () => {
    if (!formData.file) return null
    if (formData.file.type === 'application/pdf') return { label: 'PDF', color: 'text-rose-600 bg-rose-50' }
    if (
      formData.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      formData.file.type === 'application/msword'
    ) return { label: 'WORD', color: 'text-blue-600 bg-blue-50' }
    return { label: 'NON SUPPORTÉ', color: 'text-rose-600 bg-rose-50' }
  }

  const fileTypeInfo = getFileTypeInfo()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/document-archive')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Uploader un document</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ajoutez un nouveau document dans l'archive</p>
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
              <FileText className="h-3.5 w-3.5" /> Fichier *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10'
                  : errors.file
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10'
                  : 'border-slate-200 bg-slate-50 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              {formData.file ? (
                <div className="space-y-2">
                  <FileText className="mx-auto h-10 w-10 text-violet-600 dark:text-violet-400" />
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{formData.file.name}</p>
                  <p className="text-xs text-slate-500">{(formData.file.size / (1024 * 1024)).toFixed(2)} Mo</p>
                  {fileTypeInfo && (
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${fileTypeInfo.color}`}>
                      {fileTypeInfo.label}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFileChange(null)
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <X className="h-3 w-3" /> Retirer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Glissez-déposez votre fichier ici, ou cliquez pour parcourir
                  </p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX — Max 150 Mo</p>
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
            <label className="text-xs font-bold uppercase text-slate-500">Titre *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: Rapport Annuel 2024"
              className={`w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ${
                errors.title ? 'ring-rose-400' : 'ring-slate-200'
              } focus:ring-2 focus:ring-violet-400 dark:bg-slate-950`}
            />
            {errors.title && (
              <div className="flex items-center gap-1.5 text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <p className="text-xs">{errors.title}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du document..."
              rows={2}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
              >
                {DOCUMENT_CATEGORIES.map((cat: { value: string; label: string }) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Auteur</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="ex: Jean Dupont"
                maxLength={255}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ex: rapport, 2024, annuel, financier"
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-400 dark:bg-slate-950"
            />
          </div>

          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1.5"
              >
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    className="h-2 rounded-full bg-violet-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-slate-500">Upload en cours...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-50"
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
              onClick={() => navigate('/document-archive')}
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
