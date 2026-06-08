import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchMe, updateProfile, changePassword, User } from '../../api/userApi'
import { User as UserIcon, Mail, Lock, Shield, Loader2, X, Save, Camera } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profilePhoto: ''
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const data = await fetchMe()
      setUser(data)
      setFormData({
        username: data.username || '',
        email: data.email || '',
        profilePhoto: data.profilePhoto || ''
      })
    } catch (err) {
      console.error("Erreur chargement profil", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const updated = await updateProfile(formData)
      setUser(updated)
      showToast('success', 'Profil mis à jour', 'Vos informations ont été enregistrées.')
    } catch (err) {
      showToast('error', 'Erreur', 'Impossible de mettre à jour le profil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('warning', 'Attention', 'Les mots de passe ne correspondent pas.')
      return
    }
    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })
      setShowPasswordModal(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      showToast('success', 'Mot de passe modifié', 'Votre sécurité a été mise à jour.')
    } catch (err) {
      showToast('error', 'Échec', 'L\'ancien mot de passe est incorrect.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-8 p-6"> {/* Main page container */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <UserIcon className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mon Profil</h1>
            <p className="text-slate-500 dark:text-slate-400">Gérez vos informations personnelles</p>
          </div>
        </div>
      </motion.div>
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Photo" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-md hover:bg-slate-50"
                title="Changer la photo"
              >
                <Camera className="h-4 w-4 text-slate-600" />
              </button>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => setFormData({...formData, profilePhoto: reader.result as string})
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.username}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Nom d'utilisateur</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`rounded-lg px-3 py-1 text-sm font-bold ${
              user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.role}
            </span>
            <span className={`rounded-lg px-3 py-1 text-sm font-bold ${
              user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {user.isActive ? 'Actif' : 'Désactivé'}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-100 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <Lock className="h-4 w-4" />
              Changer le mot de passe
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Changer le mot de passe</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Ancien mot de passe</label>
                  <input
                    required
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Nouveau mot de passe</label>
                  <input
                    required
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Confirmer le mot de passe</label>
                  <input
                    required
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950"
                  />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-700">
                  Mettre à jour
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
