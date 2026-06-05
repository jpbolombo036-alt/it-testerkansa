function RapportsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Rapports</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Accédez aux rapports de conformité et aux journaux d’accès.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {['Sécurité', 'Accès', 'Performances'].map((report) => (
          <div key={report} className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:bg-slate-800 sm:p-6">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{report}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-3 sm:text-sm">Prêt à exporter en PDF.</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RapportsPage
