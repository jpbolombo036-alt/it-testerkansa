import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Shield, User, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      let message = "Identifiants invalides";
      const errorData = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      message = errorData?.message || errorData?.error || (err instanceof Error ? err.message : message);
      setError(message);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-200 dark:shadow-none">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">IT Access Manager</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Connectez-vous pour accéder à votre espace</p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900/50"
          >
            <div className="flex-1">{error}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <User className="h-4 w-4" />
              Identifiant
            </label>
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Lock className="h-4 w-4" />
              Mot de passe
            </label>
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:shadow-xl hover:from-sky-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-none"
            type="submit"
            disabled={isLoading}
          >
            <span className={`flex items-center justify-center gap-2 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Shield className="h-4 w-4" />
              Se connecter
            </span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Concept by: <span className="font-mono font-medium"> Ir Jp bolombo</span>
          </p>
        </div>
      </motion.div>
    </main>
  )
}

export default LoginPage