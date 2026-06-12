import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, BarChart3, Shield, CheckSquare, Loader2 } from 'lucide-react'
import { fetchReportDefinitions, fetchReportHistory, generateReport, downloadReport, ReportDefinition, ReportGeneration } from '../../api/reportApi'
import { useToast } from '../../components/ToastProvider'

const iconColors: Record<string, string> = {
  security: 'text-sky-500',
  access: 'text-emerald-500',
  tests: 'text-amber-500',
  performance: 'text-violet-500',
  compliance: 'text-rose-500'
}

export default function RapportsPage() {
  const { showToast } = useToast()
  const [reports, setReports] = useState<ReportDefinition[]>([])
  const [history, setHistory] = useState<ReportGeneration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [reportDefinitions, reportHistory] = await Promise.all([
        fetchReportDefinitions(),
        fetchReportHistory()
      ])
      setReports(reportDefinitions)
      setHistory(reportHistory)
    } catch (err) {
      console.error('Erreur chargement rapports', err)
      showToast('error', 'Erreur', 'Impossible de charger les rapports.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingId(reportId)
      const generatedReport = await generateReport(reportId)
      setHistory(prev => [generatedReport, ...prev])
      setReports(prev => prev.map(report => report.id === reportId ? {
        ...report,
        lastGenerated: generatedReport.generatedAt
      } : report))
      showToast('success', 'Rapport généré', `${generatedReport.title} a été généré avec succès.`)
    } catch (err) {
      console.error('Erreur génération rapport', err)
      showToast('error', 'Erreur', 'Impossible de générer ce rapport.')
    } finally {
      setGeneratingId(null)
    }
  }

  const handleDownloadReport = async (report: ReportGeneration) => {
    try {
      await downloadReport(report.id)
      showToast('success', 'Téléchargement', `${report.title} est en cours de téléchargement.`)
    } catch (err) {
      console.error('Erreur téléchargement rapport', err)
      showToast('error', 'Erreur', 'Impossible de télécharger ce rapport.')
    }
  }

  const getIcon = (reportId: string) => {
    const className = `h-12 w-12 ${iconColors[reportId] || 'text-slate-500'}`
    switch (reportId) {
      case 'security':
        return <Shield className={className} />
      case 'access':
        return <Calendar className={className} />
      case 'tests':
        return <CheckSquare className={className} />
      case 'performance':
        return <BarChart3 className={className} />
      case 'compliance':
        return <FileText className={className} />
      default:
        return <FileText className={className} />
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Jamais'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
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
                  <div className="mb-4">{getIcon(report.id)}</div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{report.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    Dernière génération: {formatDate(report.lastGenerated)}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingId === report.id}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {generatingId === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Générer
                  </button>
                  <button
                    onClick={() => {
                      const latestReport = history.find(item => item.reportType === report.id)
                      if (latestReport) handleDownloadReport(latestReport)
                    }}
                    disabled={!history.some(item => item.reportType === report.id)}
                    className="flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
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
            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun rapport généré pour le moment.</p>
              </div>
            ) : (
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
                    {history.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="rounded-l-2xl bg-slate-50/50 p-3 dark:bg-slate-800/40">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                          {item.generatedByUsername ? (
                            <p className="text-xs text-slate-500 mt-1">Généré par {item.generatedByUsername}</p>
                          ) : null}
                        </td>
                        <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-700">
                            {item.type}
                          </span>
                        </td>
                        <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                          <p className="text-xs text-slate-500">{formatDate(item.generatedAt)}</p>
                        </td>
                        <td className="bg-slate-50/50 p-3 dark:bg-slate-800/40">
                          <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            {item.status}
                          </span>
                        </td>
                        <td className="rounded-r-2xl bg-slate-50/50 p-3 text-right dark:bg-slate-800/40">
                          <button
                            onClick={() => handleDownloadReport(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
