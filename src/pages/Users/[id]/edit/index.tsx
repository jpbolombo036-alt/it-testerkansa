import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchUsers, updateUser, User } from '../../../../api/userApi'
import { Loader2, X, UserIcon, Mail, Lock, Shield, UserCheck } from 'lucide-react'
import { useToast } from '../../../../components/ToastProvider'

interface UpdateUserData {
  username: string
  email: string
  password?: string
  role: string
  isActive: boolean
}

export default function UserEditPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<UpdateUserData>({
    username: '',
    email: '',
    role: 'USER',
    isActive: true,
    password: ''
  })

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return
      try {
        setLoading(true)
        const users = await fetchUsers()
        const user = users.find(u => u.id === Number(id))
        if (!user) throw new Error('Not found')
        setFormData({
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          password: ''
        })
      } catch {
        showToast('error', 'Erreur', 'Utilisateur introuvable.')
        navigate('/users')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username?.trim() || !formData.email?.trim()) {
      showToast('error', 'Erreur', 'Le nom et l\'email sont obligatoires.')
      return
    }
    if (formData.password && !formData.password.trim()) {
      showToast('error', 'Erreur', 'Le mot de passe ne peut pas être vide.')
      return
    }
    try {
      setIsSubmitting(true)
      const dataToSend: UpdateUserData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive
      }
      if (formData.password?.trim()) {
        dataToSend.password = formData.password
      }
      await updateUser(Number(id), dataToSend)
      showToast('success', 'Utilisateur modifié', 'Les modifications ont été enregistrées.')
      navigate('/users')
    } catch {
      showToast('error', 'Erreur', 'Impossible de modifier l\'utilisateur.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Modifier l'utilisateur</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez les informations de {formData.username}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                 <UserIcon className="h-3.5 w-3.5" /> Nom d'utilisateur *
               </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> Nouveau mot de passe (laisser vide pour ne pas changer)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 dark:bg-slate-950"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, isActive: !formData.isActive})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <UserCheck className="h-4 w-4" /> {formData.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
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
