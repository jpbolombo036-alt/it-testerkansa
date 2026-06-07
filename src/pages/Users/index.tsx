import React, { useEffect, useState } from 'react'
import { fetchUsers, toggleUserStatus, deleteUser, createUser } from '../../api/userApi'
import { User } from '../../hooks/useAuth'
import { Users as UsersIcon, Trash2, ShieldAlert, ShieldCheck, UserPlus, Loader2, Search, X, Mail, Lock, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateUserData {
  username: string
  email: string
  password?: string
  role: string
  isActive: boolean
}

export default function UsersAdminPage() {
   const [users, setUsers] = useState<User[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState('')
   const [showModal, setShowModal] = useState(false)
   const [isSubmitting, setIsSubmitting] = useState(false)

   const [formData, setFormData] = useState<CreateUserData>({
     username: '',
     email: '',
     role: 'USER',
     isActive: true,
     password: ''
   })

   useEffect(() => {
     loadUsers()
   }, [])

   const loadUsers = async () => {
     try {
       setIsLoading(true)
       const data = await fetchUsers()
       setUsers(data)
     } catch (err) {
       console.error("Erreur chargement utilisateurs", err)
     } finally {
       setIsLoading(false)
     }
   }

   const handleToggleStatus = async (id: number) => {
     try {
       await toggleUserStatus(id)
       setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
     } catch (err) {
       alert("Erreur lors du changement de statut")
     }
   }

   const handleDelete = async (id: number) => {
     if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return
     try {
       await deleteUser(id)
       setUsers(users.filter(u => u.id !== id))
     } catch (err) {
       alert("Erreur lors de la suppression")
     }
   }

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       setIsSubmitting(true)
       const newUser = await createUser({
         username: formData.username,
         email: formData.email,
         password: formData.password,
         role: formData.role,
         isActive: formData.isActive
       })
       setUsers([newUser, ...users])
       setShowModal(false)
       setFormData({ username: '', email: '', role: 'USER', isActive: true, password: '' })
     } catch (err) {
       alert("Erreur lors de la création de l'utilisateur")
     } finally {
       setIsSubmitting(false)
     }
   }

   const filteredUsers = users.filter(u => 
     u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase())
   )

   return (
     <div className="space-y-8 p-6">
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-4">
           <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
             <UsersIcon className="h-10 w-10" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Utilisateurs</h1>
             <p className="text-slate-500 dark:text-slate-400">Gérez les accès et les rôles de l'organisation</p>
           </div>
         </div>

         <button 
           onClick={() => setShowModal(true)}
           className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
         >
           <UserPlus className="h-5 w-5" />
           Nouvel utilisateur
         </button>
       </div>

       <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
         <div className="mb-6 flex items-center gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Rechercher par nom ou email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-sky-100 dark:bg-slate-950 dark:ring-slate-800 dark:focus:ring-sky-900/30"
             />
           </div>
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
                   <th className="px-4 pb-2">Utilisateur</th>
                   <th className="px-4 pb-2">Rôle</th>
                   <th className="px-4 pb-2">Statut</th>
                   <th className="px-4 pb-2 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredUsers.map((user) => (
                   <motion.tr 
                     layout
                     key={user.id} 
                     className="group transition-colors"
                   >
                     <td className="rounded-l-3xl bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white">
                           {user.username.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
                           <p className="text-xs text-slate-500">{user.email}</p>
                         </div>
                       </div>
                     </td>
                     <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                         user.role === 'ADMIN' 
                           ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' 
                           : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                       }`}>
                         {user.role}
                       </span>
                     </td>
                     <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40">
                       <button
                         onClick={() => handleToggleStatus(user.id)}
                         className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                           user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                         }`}
                       >
                         {user.isActive ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                         {user.isActive ? 'Actif' : 'Désactivé'}
                       </button>
                     </td>
                     <td className="rounded-r-3xl bg-slate-50/50 p-4 text-right dark:bg-slate-800/40">
                       <button 
                         onClick={() => handleDelete(user.id)}
                         className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </td>
                   </motion.tr>
                 ))}
               </tbody>
             </table>
             {filteredUsers.length === 0 && (
               <div className="py-20 text-center text-slate-500">
                 <p className="text-sm">Aucun utilisateur ne correspond à votre recherche.</p>
               </div>
             )}
           </div>
         )}
       </div>

       {/* Modal Nouveau Utilisateur */}
       <AnimatePresence>
         {showModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nouvel utilisateur</h2>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Nom d'utilisateur</label>
                   <div className="relative">
                     <UsersIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                     <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950" />
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                     <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-slate-500">Mot de passe</label>
                     <div className="relative">
                       <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                       <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950" />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-slate-500">Rôle</label>
                     <div className="relative">
                       <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                       <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full appearance-none rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950">
                         <option value="USER">Utilisateur</option>
                         <option value="ADMIN">Administrateur</option>
                       </select>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 py-2">
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Compte actif par défaut</span>
                 </div>
                 <button disabled={isSubmitting} className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50">
                   {isSubmitting ? <Loader2 className="mx-auto animate-spin" /> : "Créer le compte"}
                 </button>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
     </div>
   )
}