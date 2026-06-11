import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layers, CreditCard, Users2, CheckSquare, Loader2, User } from 'lucide-react'
import StatCard from '../../components/StatCard'
import { useEffect, useState } from 'react'
import { fetchDashboardStats, DashboardStats, AgentPerformance } from '../../api/dashboardApi'
import { fetchUsers } from '../../api/userApi'
import { fetchAllTests } from '../../api/testApi'
import { motion } from 'framer-motion'

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
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchDashboardStats().catch(err => { console.error("Stats error:", err); return null; }),
      fetchUsers().catch(err => { console.error("Users error:", err); return []; }),
      fetchAllTests().catch(err => { console.error("Tests error:", err); return []; })
    ])
      .then(([statsData, usersData, testsData]) => {
        if (statsData) {
          setStats(statsData);
        }

        // Calcul de la performance réelle basée sur les données de l'application
        const users: any[] = Array.isArray(usersData) ? usersData : [];
        const tests: any[] = Array.isArray(testsData) ? testsData : [];

        let performance: AgentPerformance[] = users.map(u => {
          const testsByAgent = tests.filter(t => t && t.executeur === u.username);
          const bugsByAgent = testsByAgent.filter(t => t.statut === 'BUG').length;
          
          return {
            agentName: u.username,
            bugsFound: bugsByAgent,
            testsExecuted: testsByAgent.length,
            bugRate: testsByAgent.length > 0 
              ? parseFloat(((bugsByAgent / testsByAgent.length) * 100).toFixed(2)) 
              : 0
          };
        });

        // Trier par nombre de bugs trouvés (descendant)
        performance = performance.sort((a, b) => b.bugsFound - a.bugsFound);

        setAgentPerformance(performance);
      })
      .catch(console.error)
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

      {/* Agent Performance Grid */}
      <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance des agents (Bugs trouvés)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 pb-2">Agent</th>
                <th className="px-4 pb-2 text-center">Bugs trouvés</th>
                <th className="px-4 pb-2 text-center">Tests exécutés</th>
                <th className="px-4 pb-2 text-right">Taux de bug (%)</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.length > 0 ? (
                agentPerformance.map((agent, index) => (
                  <motion.tr
                    key={agent.agentName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <td className="rounded-l-2xl bg-slate-50/50 p-4 dark:bg-slate-800/40">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{agent.agentName}</span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 text-center">
                      <span className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        {agent.bugsFound}
                      </span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 text-center">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {agent.testsExecuted}
                      </span>
                    </td>
                    <td className="rounded-r-2xl bg-slate-50/50 p-4 text-right dark:bg-slate-800/40">
                      <span className={`text-sm font-bold ${
                        agent.bugRate > 20 ? 'text-rose-600' : 
                        agent.bugRate > 10 ? 'text-amber-600' : 
                        'text-emerald-600'
                      }`}>
                        {agent.bugRate}%
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-500 text-sm">Aucune donnée de performance disponible</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}