import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchTodoById, updateTodo, Todo } from '../../../../api/todoApi'
import { Loader2, X, FileText, Calendar, Flag } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

export default function TacheEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false,
    priority: 'MEDIUM' as string,
    dueDate: ''
  })

  useEffect(() => {
    const loadTodo = async () => {
      if (!id) return
      try {
        setLoading(true)
        const todo = await fetchTodoById(Number(id))
        setFormData({
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          priority: todo.priority,
          dueDate: todo.dueDate.split('T')[0]
        })
      } catch {
        showToast('error', 'Erreur', 'Tâche introuvable.')
        navigate('/taches')
      } finally {
        setLoading(false)
      }
    }
    loadTodo()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      showToast('error', 'Erreur', 'Le titre est obligatoire.')
      return
    }
    try {
      setIsSubmitting(true)
      await updateTodo(Number(id), formData)
      showToast('success', 'Tâche modifiée', 'Les modifications ont été enregistrées.')
      navigate('/taches')
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier la tâche.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/taches')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier la tâche</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez la tâche "{formData.title}"</p>
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Titre *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Flag className="h-3.5 w-3.5" /> Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Échéance
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/taches')}
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
