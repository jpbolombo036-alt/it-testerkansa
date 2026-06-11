import React, { useEffect, useState } from 'react'
import { fetchTodos, fetchTodosGroupedByUser, createTodo, updateTodo, deleteTodo, toggleTodo, Todo, TodoCreateData, UserWithTodos } from '../../api/todoApi'
import { FileText, Plus, Trash2, Edit3, Eye, Search, Loader2, X, Calendar, AlertCircle, CheckCircle2, Clock, UserCircle, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserFilterOption {
  id: number
  username: string
}

export default function TachesPage() {
   const [todos, setTodos] = useState<Todo[]>([])
   const [groupedTodos, setGroupedTodos] = useState<UserWithTodos[]>([])
   const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
   const [showGroupedView, setShowGroupedView] = useState(false)
   const [isLoading, setIsLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState('')
   const [showModal, setShowModal] = useState(false)
   const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
   const [editingId, setEditingId] = useState<number | null>(null)
   const [isSubmitting, setIsSubmitting] = useState(false)

   const [formData, setFormData] = useState<TodoCreateData>({
     title: '',
     description: '',
     completed: false,
     priority: 'MEDIUM',
     dueDate: new Date().toISOString().split('T')[0]
   })

   useEffect(() => {
     loadTodos()
   }, [])

   const loadTodos = async () => {
     try {
       setIsLoading(true)
       await refreshTodos()
     } catch (err) {
       console.error("Erreur chargement tâches", err)
     } finally {
       setIsLoading(false)
     }
   }

   const refreshTodos = async () => {
     const [todosData, groupedData] = await Promise.all([
       fetchTodos(),
       fetchTodosGroupedByUser().catch(() => [])
     ])
     setTodos(todosData)
     setGroupedTodos(groupedData)
   }

   const handleOpenModal = (mode: 'create' | 'edit' | 'view', todo?: Todo) => {
     setModalMode(mode)
     if (todo) {
       setFormData({
         title: todo.title,
         description: todo.description,
         completed: todo.completed,
         priority: todo.priority,
         dueDate: todo.dueDate.split('T')[0]
       })
       setEditingId(todo.id)
     } else {
       setFormData({
         title: '',
         description: '',
         completed: false,
         priority: 'MEDIUM',
         dueDate: new Date().toISOString().split('T')[0]
       })
       setEditingId(null)
     }
     setShowModal(true)
   }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        setIsSubmitting(true)
        if (modalMode === 'edit' && editingId) {
          await updateTodo(editingId, formData)
        } else {
          await createTodo(formData)
        }
        await refreshTodos()
        setShowModal(false)
      } catch (err) {
        alert("Erreur lors de l'enregistrement")
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (id: number) => {
      if (!window.confirm("Supprimer cette tâche ?")) return
      try {
        await deleteTodo(id)
        await refreshTodos()
      } catch (err) {
        alert("Erreur lors de la suppression")
      }
    }

    const handleToggleComplete = async (todo: Todo) => {
      try {
        await toggleTodo(todo.id)
        await refreshTodos()
      } catch (err) {
        alert("Erreur lors de la mise à jour du statut")
      }
    }

   const userFilterOptions = groupedTodos.map(user => ({ id: user.id, username: user.username }))
   const fallbackUserFilterOptions = todos
     .filter(todo => todo.createdByUsername)
     .filter((todo, index, array) => array.findIndex(item => item.createdBy === todo.createdBy || item.createdByUsername === todo.createdByUsername) === index)
     .map(todo => ({ id: todo.createdBy ?? 0, username: todo.createdByUsername || 'Inconnu' }))
   const visibleUserFilterOptions = userFilterOptions.length > 0 ? userFilterOptions : fallbackUserFilterOptions

   const filteredTodos = todos.filter(t => {
     const matchesUser = selectedUserId === null || t.createdBy === selectedUserId
     const term = searchTerm.toLowerCase()
     const matchesSearch = term === '' ||
       t.title.toLowerCase().includes(term) ||
       t.description.toLowerCase().includes(term) ||
       (t.priority || '').toLowerCase().includes(term) ||
       (t.createdByUsername?.toLowerCase() || '').includes(term)

     return matchesUser && matchesSearch
   })

   const filteredGroupedTodos = groupedTodos
     .filter(user => selectedUserId === null || user.id === selectedUserId)
     .map(user => ({
       ...user,
       todos: user.todos.filter(todo =>
         searchTerm === '' ||
         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
         todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         todo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         todo.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (todo.createdByUsername?.toLowerCase() || '').includes(searchTerm.toLowerCase())
       )
     }))
     .filter(user =>
       searchTerm === '' ||
       user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.todos.length > 0
     )

   const getPriorityColor = (priority: string) => {
     switch (priority) {
       case 'HIGH': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
       case 'MEDIUM': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
       default: return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
     }
   }

   let viewContent: React.ReactNode

   if (isLoading) {
     viewContent = (
     <div className="flex h-64 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
   )
   } else if (showGroupedView) {
     let groupedContent: React.ReactNode

     if (filteredGroupedTodos.length === 0) {
       groupedContent = (
         <div className="rounded-[2rem] bg-slate-50/50 p-8 text-center text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
           Aucune tâche trouvée pour ce filtre.
         </div>
       )
     } else {
       groupedContent = filteredGroupedTodos.map((user) => (
         <div key={user.id} className="rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 p-4">
           <div className="flex items-center gap-3 mb-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
               <UserCircle className="h-6 w-6" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.username}</h2>
               <p className="text-xs text-slate-500 dark:text-slate-400">{user.todos.length} tâche{user.todos.length !== 1 ? 's' : ''}</p>
             </div>
           </div>
           <div className="space-y-2">
             {user.todos.map((todo) => (
               <div key={todo.id} className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm">
                 <div className="flex items-start justify-between gap-3">
                   <div className="flex-1">
                     <h3 className={`text-sm font-bold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{todo.title}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{todo.description}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><UserCircle className="h-3.5 w-3.5" /> Créé par {todo.createdByUsername || 'Inconnu'}</p>
                   </div>
                   <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${getPriorityColor(todo.priority)}`}>
                     {todo.priority}
                   </span>
                 </div>
                 <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
                   <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(todo.dueDate).toLocaleDateString()}</span>
                   <span className={`flex items-center gap-1 ${todo.completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                     {todo.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                     {todo.completed ? 'Terminé' : 'En cours'}
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       ))
     }

     viewContent = (
       <div className="space-y-4">
         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
             <UserCircle className="h-5 w-5" />
             <span>Filtrer par utilisateur :</span>
           </div>
           <div className="flex flex-wrap gap-2">
             <button
               onClick={() => setSelectedUserId(null)}
               className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                 selectedUserId === null
                   ? 'bg-blue-600 text-white'
                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
               }`}
             >
               Tous
             </button>
             {groupedTodos.map((user) => (
               <button
                 key={user.id}
                 onClick={() => setSelectedUserId(user.id)}
                 className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                   selectedUserId === user.id
                     ? 'bg-blue-600 text-white'
                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                 }`}
               >
                 {user.username}
               </button>
             ))}
           </div>
         </div>
         {groupedContent}
       </div>
     )
   } else {
     viewContent = (
     <div className="overflow-x-auto">
       <table className="w-full text-left border-separate border-spacing-y-3">
         <thead>
           <tr className="text-xs font-bold uppercase text-slate-400 px-4">
             <th className="px-4 pb-2">Tâche</th>
             <th className="px-4 pb-2">Créateur</th>
             <th className="px-4 pb-2">Priorité</th>
             <th className="px-4 pb-2">Échéance</th>
             <th className="px-4 pb-2">Statut</th>
             <th className="px-4 pb-2 text-right">Actions</th>
           </tr>
         </thead>
         <tbody>
           {filteredTodos.map((todo) => (
             <motion.tr layout key={todo.id} className="group">
               <td className="rounded-l-3xl bg-slate-50/50 p-4 dark:bg-slate-800/40">
                 <p className={`text-sm font-bold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{todo.title}</p>
                 <p className="text-xs text-slate-500 truncate max-w-[200px]">{todo.description}</p>
               </td>
               <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                 <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                   <UserCircle className="h-4 w-4" /> {todo.createdByUsername || 'Inconnu'}
                 </span>
               </td>
               <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                 <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${getPriorityColor(todo.priority)}`}>
                   {todo.priority}
                 </span>
               </td>
               <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 text-xs text-slate-500">
                 <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(todo.dueDate).toLocaleDateString()}</div>
               </td>
               <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                 <button
                   onClick={() => handleToggleComplete(todo)}
                   className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                     todo.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                   }`}
                 >
                   {todo.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                   {todo.completed ? 'Terminé' : 'En cours'}
                 </button>
               </td>
               <td className="rounded-r-3xl bg-slate-50/50 p-4 text-right dark:bg-slate-800/40">
                 <div className="flex justify-end gap-1">
                   <button onClick={() => handleOpenModal('view', todo)} className="p-2 text-slate-400 hover:text-sky-600"><Eye className="h-4 w-4" /></button>
                   <button onClick={() => handleOpenModal('edit', todo)} className="p-2 text-slate-400 hover:text-amber-600"><Edit3 className="h-4 w-4" /></button>
                   <button onClick={() => handleDelete(todo.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                 </div>
               </td>
             </motion.tr>
           ))}
         </tbody>
       </table>
     </div>
   )
   }

   return (
     <div className="space-y-8 p-6">
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              <FileText className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tâches</h1>
              <p className="text-slate-500 dark:text-slate-400">Gérez vos objectifs et rappels quotidiens</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => setShowGroupedView(!showGroupedView)} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto">
              <Users className="h-5 w-5" /> {showGroupedView ? 'Vue liste' : 'Par utilisateur'}
            </button>
            <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-5 w-5" /> Nouvelle tâche
            </button>
          </div>
        </div>

       <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
         <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Rechercher une tâche..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-blue-100 dark:bg-slate-950 dark:ring-slate-800"
             />
           </div>
           <select
             value={selectedUserId ?? ''}
             onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
             className="rounded-2xl border-none bg-slate-50 px-4 py-3.5 text-sm outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-blue-100 dark:bg-slate-950 dark:ring-slate-800"
           >
             <option value="">Tous les utilisateurs</option>
             {visibleUserFilterOptions.map(user => (
               <option key={user.id || user.username} value={user.id}>{user.username}</option>
             ))}
           </select>
         </div>

          {viewContent}
       </div>

       <AnimatePresence>
         {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{modalMode === 'view' ? 'Détails' : modalMode === 'edit' ? 'Modifier' : 'Nouvelle tâche'}</h2>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Titre</label>
                   <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} disabled={modalMode === 'view'} className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-slate-500">Priorité</label>
                     <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} disabled={modalMode === 'view'} className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950">
                       <option value="LOW">Basse</option>
                       <option value="MEDIUM">Moyenne</option>
                       <option value="HIGH">Haute</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-slate-500">Échéance</label>
                     <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} disabled={modalMode === 'view'} className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950" />
                   </div>
                 </div>
                 <div className="flex items-center gap-3 py-2">
                   <button type="button" onClick={() => setFormData({...formData, completed: !formData.completed})} disabled={modalMode === 'view'} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.completed ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Marquer comme terminée</span>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                   <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={modalMode === 'view'} className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 dark:bg-slate-950" rows={3} />
                 </div>
                 {modalMode !== 'view' && (
                   <button disabled={isSubmitting} className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50">
                     {isSubmitting ? <Loader2 className="mx-auto animate-spin" /> : modalMode === 'edit' ? "Mettre à jour" : "Créer la tâche"}
                    </button>
                  )}
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
     </div>
   )
}