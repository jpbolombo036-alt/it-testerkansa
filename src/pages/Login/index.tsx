import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
    } catch (err: any) {
      // Récupère le message d'erreur explicite du backend si disponible
      setError(err.response?.data?.error || "Une erreur est survenue lors de la connexion. Veuillez vérifier vos identifiants.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft transition-colors duration-300 dark:bg-slate-900">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Interface admin</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Connexion</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Veuillez entrer vos identifiants pour accéder au tableau de bord.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-500 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nom d'utilisateur
            <input
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              disabled={isLoading}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Mot de passe
            <input
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
            />
          </label>

          <button
            className="w-full rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-200 dark:shadow-none"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
