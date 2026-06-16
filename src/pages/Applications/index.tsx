import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApplications, createApplication, deleteApplication, Application, ApplicationCreateData } from '../../api/applicationApi'
import { Loader2, Layers, Plus, Calendar, X, Edit3, Trash2, Package, Eye } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'

export default function ApplicationsPage() {
   const navigate = useNavigate()
   const [applications, setApplications] = useState<Application[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [showApplicationForm, setShowApplicationForm] = useState(false)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const { showToast } = useToast()

   const [applicationFormData, setApplicationFormData] = useState<ApplicationCreateData>({
      nom: '',
      description: '',
      version: '',
      environnement: 'PRODUCTION'
    })

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

    const handleViewApplication = (app: Application) => {
      navigate(`/applications/${app.id}`)
    }

    const handleCreateApplication = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        setIsSubmitting(true)
        const newApplication = await createApplication(applicationFormData)
        setApplications([newApplication, ...applications])
        setShowApplicationForm(false)
        setApplicationFormData({ nom: '', description: '', version: '', environnement: 'PRODUCTION' })
        showToast('success', 'Application créée', 'La nouvelle application a été ajoutée avec succès.')
      } catch (error) {
        showToast('error', 'Erreur', "Erreur lors de la création de l'application.")
      } finally {
        setIsSubmitting(false)
      }
    }

   const handleDeleteApplication = async (appId: number) => {
     if (!window.confirm("Supprimer cette application ?")) return
    try {
       await deleteApplication(appId)
       setApplications(applications.filter(app => app.id !== appId))
       showToast('success', 'Application supprimée', "L'application a été supprimée avec succès.")
    } catch (error) {
       showToast('error', 'Erreur', "Erreur lors de la suppression de l'application.")
    }
   }

   if (isLoading) {
     return (
       <div className="flex h-96 items-center justify-center">
         <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
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
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
             onClick={() => navigate('/applications/new')}
             className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 w-full sm:w-auto"
           >
             <Plus className="h-5 w-5" />
             Nouvelle application
           </button>
         </div>
       </motion.div>

       <AnimatePresence>
         {showApplicationForm && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
           >
             <div className="mb-4 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ajouter une application</h2>
               <button onClick={() => setShowApplicationForm(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="h-5 w-5" />
               </button>
             </div>
             <form onSubmit={handleCreateApplication} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
                   <input
                     type="text"
                     required
                     value={applicationFormData.nom}
                     onChange={(e) => setApplicationFormData({...applicationFormData, nom: e.target.value})}
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Environnement</label>
                   <select
                     value={applicationFormData.environnement}
                     onChange={(e) => setApplicationFormData({...applicationFormData, environnement: e.target.value})}
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   >
                     <option value="DEVELOPPEMENT">Développement</option>
                     <option value="STAGING">En test</option>
                     <option value="PRODUCTION">Production</option>
                   </select>
                 </div>
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                 <textarea
                   value={applicationFormData.description}
                   onChange={(e) => setApplicationFormData({...applicationFormData, description: e.target.value})}
                   className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   rows={2}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Version</label>
                   <input
                     type="text"
                     value={applicationFormData.version}
                     onChange={(e) => setApplicationFormData({...applicationFormData, version: e.target.value})}
                     placeholder="ex: 1.0.0"
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   />
                 </div>
               </div>
               <button disabled={isSubmitting} className="rounded-2xl bg-sky-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50">
                 {isSubmitting ? <Loader2 className="animate-spin" /> : "Créer l'application"}
               </button>
             </form>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Desktop/Tablet View (Table) */}
       <div className="hidden sm:block overflow-x-auto">
         <table className="w-full text-left border-separate border-spacing-y-4">
           <thead>
             <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
               <th className="px-6 py-3">Nom</th>
               <th className="px-6 py-3">Description</th>
               <th className="px-6 py-3">Version</th>
               <th className="px-6 py-3">Environnement</th>
               <th className="px-6 py-3">Date de création</th>
               <th className="px-6 py-3 text-right">Actions</th>
             </tr>
           </thead>
           <tbody>
             {applications.map((app) => (
               <motion.tr
                 layout
                 key={app.id}
                 className="group transition-all duration-300 hover:translate-x-1"
               >
                 <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <div className="flex items-center gap-3">
                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-extrabold text-sky-600 shadow-sm dark:bg-slate-950 dark:text-sky-400">
                       <Package className="h-5 w-5" />
                     </div>
                     <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{app.nom}</p>
                   </div>
                 </td>
                 <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[200px]">{app.description}</p>
                 </td>
                 <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                     {app.version}
                   </span>
                 </td>
                 <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                     {app.environnement}
                   </span>
                 </td>
                 <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <p className="text-xs text-slate-500 dark:text-slate-400">
                     {new Date(app.dateCreation).toLocaleDateString()}
                   </p>
                 </td>
                 <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all shadow-sm group-hover:shadow-md">
                   <div className="flex justify-end gap-2">
                     <button
                       onClick={() => handleViewApplication(app)}
                       className="p-2.5 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 transition-all hidden md:inline-flex"
                       title="Voir"
                     >
                       <Eye className="h-4.5 w-4.5" />
                     </button>
                     <button
                       onClick={() => navigate(`/applications/${app.id}/edit`)}
                       className="p-2.5 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-all"
                       title="Modifier"
                     >
                       <Edit3 className="h-4.5 w-4.5" />
                     </button>
                     <button
                       onClick={() => handleDeleteApplication(app.id)}
                       className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all"
                       title="Supprimer"
                     >
                       <Trash2 className="h-4.5 w-4.5" />
                     </button>
                   </div>
                 </td>
               </motion.tr>
             ))}
           </tbody>
         </table>
         {applications.length === 0 && (
           <div className="py-20 text-center text-slate-500">
             <p className="text-sm">Aucune application trouvée.</p>
           </div>
         )}
       </div>

       {/* Mobile View (Cards) */}
       <div className="sm:hidden grid gap-4">
         {applications.map((app) => (
           <motion.div
             layout
             key={app.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
             className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
           >
             <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600">
                   <Layers className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{app.nom}</h3>
               </div>
               <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{app.description}</p>
               <div className="mt-3 flex flex-wrap gap-2 text-xs">
                 <span className="flex items-center gap-1 text-slate-500">
                   <Calendar className="h-3 w-3" />
                   {new Date(app.dateCreation).toLocaleDateString()}
                 </span>
                 <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800 font-medium">{app.environnement}</span>
                 <span className="rounded-lg bg-sky-100 text-sky-700 px-2 py-1 dark:bg-sky-500/15 dark:text-sky-300 font-bold">{app.version}</span>
               </div>
             </div>
             <div className="flex justify-end gap-2 pt-3">
               <button
                 onClick={() => handleViewApplication(app)}
                 className="flex items-center justify-center rounded-2xl bg-sky-100 p-2 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300"
                 title="Voir"
               >
                 <Eye className="h-4 w-4" />
               </button>
               <button
                 onClick={() => navigate(`/applications/${app.id}/edit`)}
                 className="flex items-center justify-center rounded-2xl bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                 title="Modifier"
               >
                 <Edit3 className="h-4 w-4" />
               </button>
               <button
                 onClick={() => handleDeleteApplication(app.id)}
                 className="flex items-center justify-center rounded-2xl bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                 title="Supprimer"
               >
                 <Trash2 className="h-4 w-4" />
               </button>
             </div>
           </motion.div>
         ))}
       </div>
     </div>
   )
 }
