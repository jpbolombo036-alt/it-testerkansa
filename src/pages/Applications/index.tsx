import React, { useState, useEffect } from 'react'
import { fetchApplications, createApplication, deleteApplication, updateApplication, fetchApplicationById, Application, ApplicationCreateData } from '../../api/applicationApi'
import { useAuth } from '../../hooks/useAuth'
import { Layers, Plus, Trash2, Edit3, Eye, Search, Loader2, X, Globe, Calendar, User as UserIcon, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApplicationsPage() {
   const [applications, setApplications] = useState<Application[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [showModal, setShowModal] = useState(false)
   const [searchTerm, setSearchTerm] = useState('')
   
const [formData, setFormData] = useState<ApplicationCreateData>({
      nom: '',
      description: '',
      version: '',
      environnement: 'PRODUCTION'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [viewingApp, setViewingApp] = useState<Application | null>(null)
    const [editingApp, setEditingApp] = useState<Application | null>(null)

   useEffect(() => {
     loadApplications()
   }, [])

   const loadApplications = async () => {
     try {
       setIsLoading(true)
       const data = await fetchApplications()
       setApplications(data)
     } catch (err) {
       console.error("Erreur chargement applications", err)
     } finally {
       setIsLoading(false)
     }
   }

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       setIsSubmitting(true)
       const newApp = await createApplication(formData)
       setApplications([newApp, ...applications])
       setShowModal(false)
       setFormData({ nom: '', description: '', version: '', environnement: 'PRODUCTION' })
     } catch (err) {
       alert("Erreur lors de la création de l'application")
     } finally {
       setIsSubmitting(false)
     }
   }

const handleDelete = async (id: number) => {
      if (!window.confirm("Supprimer cette application ?")) return
      try {
        await deleteApplication(id)
        setApplications(applications.filter(a => a.id !== id))
      } catch (err) {
        alert("Erreur lors de la suppression")
      }
    }
    
    const handleView = (app: Application) => {
      setViewingApp(app)
      setShowViewModal(true)
    }
    
    const handleEdit = (app: Application) => {
      setEditingApp(app)
      setFormData({
        nom: app.nom,
        description: app.description,
        version: app.version,
        environnement: app.environnement
      })
      setShowEditModal(true)
    }
    
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!editingApp) return
      try {
        setIsSubmitting(true)
        const updated = await updateApplication(editingApp.id, formData)
        setApplications(applications.map(a => a.id === editingApp.id ? updated : a))
        setShowEditModal(false)
        setEditingApp(null)
      } catch (err) {
        alert("Erreur lors de la mise à jour")
      } finally {
        setIsSubmitting(false)
      }
    }

   const filteredApps = applications.filter(a => 
     a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     a.environnement.toLowerCase().includes(searchTerm.toLowerCase())
   )

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
           onClick={() => setShowModal(true)}
           className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
         >
           <Plus className="h-5 w-5" />
           Nouvelle application
         </button>
       </div>

       <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
         <div className="mb-6 relative">
           <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
           <input
             type="text"
             placeholder="Rechercher par nom ou environnement..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-sky-100 dark:bg-slate-950 dark:ring-slate-800 dark:focus:ring-sky-900/30"
           />
         </div>

         {isLoading ? (
           <div className="flex h-64 items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-separate border-spacing-y-3">
               <thead>
                 <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 px-4">
                   <th className="px-4 pb-2">Application</th>
                   <th className="px-4 pb-2">Version</th>
                   <th className="px-4 pb-2">Environnement</th>
                   <th className="px-4 pb-2">Date Création</th>
                   <th className="px-4 pb-2 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredApps.map((app) => (
                   <motion.tr layout key={app.id} className="group">
                     <td className="rounded-l-3xl bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-sky-600 shadow-sm dark:bg-slate-950">
                           <Globe className="h-5 w-5" />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{app.nom}</p>
                           <p className="text-xs text-slate-500 truncate max-w-[200px]">{app.description}</p>
                         </div>
                       </div>
                     </td>
                     <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                         v{app.version}
                       </span>
                     </td>
                     <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{app.environnement}</span>
                     </td>
                     <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                         <Calendar className="h-3 w-3" />
                         {new Date(app.dateCreation).toLocaleDateString()}
                       </div>
                     </td>
<td className="rounded-r-3xl bg-slate-50/50 p-4 text-right dark:bg-slate-800/40">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleView(app)} className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Voir"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => handleEdit(app)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Modifier"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(app.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                   </motion.tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>

       {/* Modal Nouvelle Application */}
       <AnimatePresence>
         {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900"
             >
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Créer une application</h2>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                   <X className="h-6 w-6" />
                 </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom de l'application</label>
                     <input 
                       type="text" 
                       required
                       value={formData.nom}
                       onChange={(e) => setFormData({...formData, nom: e.target.value})}
                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Version initiale</label>
                     <input 
                       type="text" 
                       required
                       placeholder="ex: 1.0.0"
                       value={formData.version}
                       onChange={(e) => setFormData({...formData, version: e.target.value})}
                       className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" 
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Environnement</label>
                   <select
                     value={formData.environnement}
                     onChange={(e) => setFormData({...formData, environnement: e.target.value})}
                     className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950"
                   >
                     <option value="DEVELOPPEMENT">Développement</option>
                     <option value="STAGING">Staging</option>
                     <option value="PRODUCTION">Production</option>
                   </select>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                   <textarea 
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                     className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" 
                     rows={3}
                   />
                 </div>

                 <button
                   disabled={isSubmitting}
                   className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="h-5 w-5" />}
                   {isSubmitting ? "Création en cours..." : "Créer l'application"}
                 </button>
               </form>
             </motion.div>
           </div>
         )}
</AnimatePresence>

      <AnimatePresence>
        {showViewModal && viewingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Détails de l'application</h3>
                <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div><span className="font-semibold">Nom:</span> {viewingApp.nom}</div>
                <div><span className="font-semibold">Version:</span> {viewingApp.version}</div>
                <div><span className="font-semibold">Environnement:</span> {viewingApp.environnement}</div>
                <div><span className="font-semibold">Date création:</span> {new Date(viewingApp.dateCreation).toLocaleDateString()}</div>
                <div><span className="font-semibold">Description:</span> {viewingApp.description || '-'}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier l'application</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                    <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Version</label>
                    <input type="text" required value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Environnement</label>
                  <select value={formData.environnement} onChange={(e) => setFormData({...formData, environnement: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950">
                    <option value="DEVELOPPEMENT">Développement</option>
                    <option value="STAGING">Staging</option>
                    <option value="PRODUCTION">Production</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950" rows={3} />
                </div>
                <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 font-bold text-white transition hover:bg-sky-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Mettre à jour"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}