import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Moon, LogOut, User, ChevronDown, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'

export default function UserDropdown() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-dropdown]')) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  if (!user) return null

  const initials = (user.username || 'User')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="relative" data-user-dropdown>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-300 sm:h-auto sm:w-auto sm:gap-3 sm:px-3 sm:py-2"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.username}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user.role ?? 'GESTIONNAIRE'}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
             className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-0.5rem)] max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 p-4 dark:border-slate-700/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.username}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  {user.role ?? 'GESTIONNAIRE'}
                </span>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/profil')
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Mon profil</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false)
                  toggleTheme()
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  )}
                  <span>Thème sombre</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {theme === 'dark' ? 'Activé' : 'Désactivé'}
                </span>
              </button>

              <div className="my-1 h-px bg-slate-200 dark:bg-slate-700/70" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>

            <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-700/60">
              Connecté en tant que <span className="text-slate-700 dark:text-slate-300">{user.email}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}