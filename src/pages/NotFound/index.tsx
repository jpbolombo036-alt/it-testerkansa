import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-center dark:bg-slate-950">
      <div className="max-w-md rounded-[2rem] bg-white p-10 shadow-soft transition-colors duration-300 dark:bg-slate-900">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Erreur 404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">Page introuvable</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">La page que vous recherchez n’existe pas ou a été déplacée.</p>
        <Link className="mt-8 inline-flex rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" to="/">
          Retour à l’accueil
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
