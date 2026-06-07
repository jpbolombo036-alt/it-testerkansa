import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layers, CreditCard, Users2, CheckSquare, Loader2 } from 'lucide-react'
import StatCard from '../../components/StatCard'
import { useEffect, useState } from 'react'
import { fetchDashboardStats, DashboardStats } from '../../api/dashboardApi'

const trendData = [
  { name: 'Lun', value: 520 },
  { name: 'Mar', value: 610 },
  { name: 'Mer', value: 710 },
  { name: 'Jeu', value: 670 },
  { name: 'Ven', value: 760 },
  { name: 'Sam', value: 840 },
  { name: 'Dim', value: 900 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications"
          value={stats.applications.toString()}
          description="Applications actives"
          icon={<Layers className="h-6 w-6 text-sky-600" />}
          panelClass="bg-sky-50 dark:bg-sky-500/10"
        />
        <StatCard
          title="Comptes"
          value={stats.accounts.toString()}
          description="Comptes utilisateurs"
          icon={<CreditCard className="h-6 w-6 text-violet-600" />}
          panelClass="bg-violet-50 dark:bg-violet-500/10"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.users.toString()}
          description="Utilisateurs actifs"
          icon={<Users2 className="h-6 w-6 text-emerald-600" />}
          panelClass="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <StatCard
          title="Tests"
          value={stats.tests.toString()}
          description="Tests totaux"
          icon={<CheckSquare className="h-6 w-6 text-amber-600" />}
          panelClass="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Statistiques des tests</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.testsOk}</p>
              <p className="text-xs text-slate-500">OK ({stats.testsRateOk}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">{stats.testsBug}</p>
              <p className="text-xs text-slate-500">BUG ({stats.testsRateBug}%)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.testsEnCours}</p>
              <p className="text-xs text-slate-500">En cours ({stats.testsRatePending}%)</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009966" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#009966" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#009966" fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Résumé</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Sessions</span>
              <span className="font-bold">{stats.sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bugs signalés</span>
              <span className="font-bold">{stats.bugReports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taux réussite</span>
              <span className="font-bold text-emerald-600">{stats.testsRateOk}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}