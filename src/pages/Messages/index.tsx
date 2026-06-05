function MessagesPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Messages</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Communiquez avec les responsables IT et suivez les alertes.</p>
      </div>

      <div className="space-y-4">
        {['Nouvelle alerte', 'Rapport prêt', 'Mise à jour de politique'].map((message) => (
          <div key={message} className="rounded-[1.75rem] bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:bg-slate-800 sm:p-5">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{message}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">Destinataire : Équipe IT</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MessagesPage
