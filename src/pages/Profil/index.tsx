import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Mail, ShieldCheck, Activity, Calendar, Key, User, Save } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ToastProvider'

export default function ProfilPage() {
  const { user, updateProfile, changePassword, refreshUser } = useAuth()
  const { showToast } = useToast()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
    }
  }, [user])

  if (!user) return null

  const initials = (user.username || 'User').slice(0, 2).toUpperCase()
  const roleLabel = user.role === 'ADMIN' ? 'Super administrateur' : 'Utilisateur'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await updateProfile({ username, email })
      await refreshUser()
      showToast('success', 'Profil mis à jour', 'Vos informations ont été enregistrées.')
    } catch {
      showToast('error', 'Erreur', 'Impossible de mettre à jour le profil.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsChangingPassword(true)
      await changePassword({ oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setShowPasswordSection(false)
      showToast('success', 'Mot de passe modifié', 'Votre mot de passe a été changé.')
    } catch {
      showToast('error', 'Erreur', 'Impossible de changer le mot de passe. Vérifiez l\'ancien mot de passe.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <span className="text-xl font-bold">{initials}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mon Profil</h1>
              <p className="text-slate-500 dark:text-slate-400">Modifiez vos informations personnelles</p>
            </div>
          </div>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            {roleLabel}
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              <User className="h-4 w-4 text-slate-400" />
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
              <Mail className="h-4 w-4 text-slate-400" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Rôle</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              user.role === 'ADMIN'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {user.role}
            </span>
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compte créé le</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Key className="h-4 w-4" />
              Changer le mot de passe
            </button>
          </div>
        </form>
      </motion.div>

      {showPasswordSection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-slate-400" />
              Changer le mot de passe
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mot de passe actuel</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Mettre à jour le mot de passe
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}
