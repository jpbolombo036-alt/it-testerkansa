import { motion } from 'framer-motion'
import { FileText, Download, Calendar, BarChart3, Shield, CheckSquare, Loader2 } from 'lucide-react'

interface Report {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  lastGenerated: string
}

const reports: Report[] = [
  {
    id: 'security',
    title: 'Rapport de sécurité',
    description: 'Analyse complète des accès et des droits utilisateurs.',
    icon: <Shield className="h-12 w-12 text-sky-500" />,
    lastGenerated: '2024-06-01'
  },
  {
    id: 'access',
    title: 'Journal des accès',
    description: 'Historique détaillé de toutes les connexions.',
    icon: <Calendar className="h-12 w-12 text-emerald-500" />,
    lastGenerated: '2024-06-05'
  },
  {
    id: 'tests',
    title: 'Rapport de tests',
    description: 'Synthèse des campagnes de test et résultats.',
    icon: <CheckSquare className="h-12 w-12 text-amber-500" />,
    lastGenerated: '2024-06-06'
  },
  {
    id: 'performance',
    title: 'Performance globale',
    description: 'Statistiques d\'utilisation et métriques clés.',
    icon: <BarChart3 className="h-12 w-12 text-violet-500" />,
    lastGenerated: '2024-06-07'
  },
  {
    id: 'compliance',
    title: 'Conformité',
    description: 'Audit des accès selon les politiques de sécurité.',
    icon: <FileText className="h-12 w-12 text-rose-500" />,
    lastGenerated: '2024-05-28'
  }
]

export default function RapportsPage() {
  const handleGenerateReport = (reportId: string) => {
    alert(`Génération du rapport ${reportId} en cours...`)
  }

  const handleDownloadReport = (report: Report) => {
    alert(`Téléchargement du rapport: ${report.title}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <FileText className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Rapports</h1>
            <p className="text-slate-500 dark:text-slate-400">Accédez aux rapports de conformité et aux journaux d'accès.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={report.id}
            className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900 flex flex-col"
          >
            <div className="flex-1">
              <div className="mb-4">{report.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{report.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                Dernière génération: {new Date(report.lastGenerated).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleGenerateReport(report.id)}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Générer
              </button>
              <button
                onClick={() => handleDownloadReport(report)}
                className="flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                title="Télécharger"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Historique des rapports</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3 pb-2">Nom</th>
                <th className="px-3 pb-2">Type</th>
                <th className="px-3 pb-2">Date</th>
                <th className="px-3 pb-2">Statut</th>
                <th className="px-3 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Rapport sécurité Q2', type: 'Sécurité', date: '2024-06-01', status: 'Disponible' },
                { name: 'Journal accès Mai', type: 'Accès', date: '2024-06-01', status: 'Disponible' },
                { name: 'Tests automatisés', type: 'Tests', date: '2024-05-30', status: 'Disponible' }
              ].map((item, i) => (
                <tr key={i} className="group">
                  <td className="rounded-l-2xl bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </td>
                  <td className="rounded-r-2xl bg-slate-50/50 p-3 text-right dark:bg-slate-800/40">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
