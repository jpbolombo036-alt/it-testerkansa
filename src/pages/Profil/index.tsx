function ProfilPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Mon Profil</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Gérez vos informations, votre sécurité et vos préférences d’accès.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:bg-slate-800 sm:p-6">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Nom</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Administrateur IT</p>
        </div>
        <div className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:bg-slate-800 sm:p-6">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Rôle</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Super administrateur</p>
        </div>
      </div>
    </section>
  )
}

export default ProfilPage
