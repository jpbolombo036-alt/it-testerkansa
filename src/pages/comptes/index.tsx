function ComptesPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Comptes</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Gérez les comptes, les affectations de rôle et les accès sécurisés.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors dark:bg-slate-800 sm:p-6">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Accès actifs</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">4 820</p>
        </div>
        <div className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors dark:bg-slate-800 sm:p-6">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Nouveaux comptes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">142</p>
        </div>
      </div>
    </section>
  )
}

export default ComptesPage
