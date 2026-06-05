function TestsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Tests</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Consultez les tests de sécurité et de conformité exécutés sur les accès IT.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {['Conformité', 'PenTest', 'Analyse réseau'].map((item) => (
          <div key={item} className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:bg-slate-800 sm:p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-3 sm:text-sm">Résultats mis à jour en temps réel.</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestsPage
