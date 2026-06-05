function TachesPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Tâches</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Suivez les actions prioritaires et l’exécution des procédures IT.</p>
      </div>

      <div className="space-y-4">
        {['Auditer les accès', 'Mettre à jour les rôles', 'Vérifier les sessions'].map((task) => (
          <div key={task} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800 sm:p-5">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{task}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">Statut : en cours</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TachesPage
