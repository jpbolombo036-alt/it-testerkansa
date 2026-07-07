import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Layers, CreditCard, Users2, CheckSquare, Loader2, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
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
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [userTestsCount, setUserTestsCount] = useState(0)
  const [userTestsOk, setUserTestsOk] = useState(0)
  const [userTestsBug, setUserTestsBug] = useState(0)
  const [userTestsResolved, setUserTestsResolved] = useState(0)
  const [userTestsEnCours, setUserTestsEnCours] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchDashboardStats().catch(err => { console.error("Stats error:", err); return null; }),
      fetchUsers().catch(err => { console.error("Users error:", err); return []; }),
      fetchAllTests().catch(err => { console.error("Tests error:", err); return []; })
    ])
      .then(([statsData, usersData, testsData]) => {
        if (statsData) {
          setStats(statsData);
        } else {
          setError('Impossible de charger les statistiques.')
        }

        // Calcul de la performance réelle basée sur les données de l'application
        const users: any[] = Array.isArray(usersData) ? usersData : [];
        const tests: any[] = Array.isArray(testsData) ? testsData : [];

        let performance: AgentPerformance[] = users.map(u => {
          const testsByAgent = tests.filter(t =>
            t && (
              t.createdBy === u.id ||
              t.executeur === u.username ||
              t.createdByUsername === u.username
            )
          );
          const bugsByAgent = testsByAgent.filter(t => t.statut === 'BUG').length;
          const testsCreated = tests.filter(t =>
            t && (t.createdBy === u.id || t.createdByUsername === u.username)
          ).length;
          
          return {
            agentName: u.username,
            bugsFound: bugsByAgent,
            testsExecuted: testsByAgent.length,
            testsCreated,
            bugRate: testsByAgent.length > 0 
              ? parseFloat(((bugsByAgent / testsByAgent.length) * 100).toFixed(2)) 
              : 0
          };
        });

        // Trier par nombre de bugs trouvés (descendant)
        performance = performance.sort((a, b) => b.bugsFound - a.bugsFound);

        setAgentPerformance(performance);

        if (user && tests.length > 0) {
          const myTests = tests.filter(t =>
            t && (
              t.createdBy === user.id ||
              t.executeur === user.username ||
              t.createdByUsername === user.username
            )
          );
          setUserTestsCount(myTests.length);
          setUserTestsOk(myTests.filter(t => t.statut === 'OK').length);
          setUserTestsBug(myTests.filter(t => t.statut === 'BUG').length);
          setUserTestsResolved(myTests.filter(t => t.statut === 'RESOLU').length);
          setUserTestsEnCours(myTests.filter(t => t.statut === 'EN_COURS' || t.statut === 'EN_COURS').length);
        }
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

  if (error || !stats) {
    return (
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tableau de bord</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error || 'Aucune donnée disponible pour le moment.'}</p>
          <button onClick={() => window.location.reload()} className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tableau de bord</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vue d'ensemble de votre activité</p>
          </div>
        </div>
      </div>

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
          value={user?.role === 'admin' ? stats.tests.toString() : userTestsCount.toString()}
          description={user?.role === 'admin' ? 'Tests totaux' : 'Mes tests'}
          icon={<CheckSquare className="h-6 w-6 text-amber-600" />}
          panelClass="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            {user?.role === 'admin' ? 'Statistiques des tests' : 'Mes statistiques'}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {user?.role === 'admin' ? stats.testsOk : userTestsOk}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OK ({user?.role === 'admin' ? stats.testsRateOk : (userTestsCount > 0 ? Math.round((userTestsOk / userTestsCount) * 100) : 0)}%)
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">
                {user?.role === 'admin' ? stats.testsBug : userTestsBug}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                BUG ({user?.role === 'admin' ? stats.testsRateBug : (userTestsCount > 0 ? Math.round((userTestsBug / userTestsCount) * 100) : 0)}%)
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-600">
                {user?.role === 'admin' ? stats.testsResolved : userTestsResolved}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Résolus ({user?.role === 'admin' ? stats.testsRateResolved : (userTestsCount > 0 ? Math.round((userTestsResolved / userTestsCount) * 100) : 0)}%)
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {user?.role === 'admin' ? stats.testsEnCours : userTestsEnCours}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                En cours ({user?.role === 'admin' ? stats.testsRatePending : (userTestsCount > 0 ? Math.round((userTestsEnCours / userTestsCount) * 100) : 0)}%)
              </p>
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            {user?.role === 'admin' ? 'Résumé' : 'Mon résumé'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tests traités</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {user?.role === 'admin' ? `${stats.testsResolved} / ${stats.tests}` : `${userTestsResolved} / ${userTestsCount}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Taux de traitement</span>
              <span className="font-bold text-emerald-600">
                {user?.role === 'admin' ? stats.testsRateResolved : (userTestsCount > 0 ? Math.round((userTestsResolved / userTestsCount) * 100) : 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Taux réussite</span>
              <span className="font-bold text-emerald-600">
                {user?.role === 'admin' ? stats.testsRateOk : (userTestsCount > 0 ? Math.round((userTestsOk / userTestsCount) * 100) : 0)}%
              </span>
      </div>
      </div>
        </div>
      </div>

      {/* Agent Performance Grid */}
      {user?.role === 'admin' ? (
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance des agents (Bugs trouvés)</h2>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
             <table className="w-full text-left border-separate border-spacing-y-2 border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 pb-2">Agent</th>
                  <th className="px-4 pb-2 text-center">Bugs trouvés</th>
                  <th className="px-4 pb-2 text-center">Tests exécutés</th>
                  <th className="px-4 pb-2 text-center">Tests créés</th>
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
                      <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 text-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {agent.testsCreated}
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
                    <td colSpan={5} className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">Aucune donnée de performance disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ma performance</h2>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
             <table className="w-full text-left border-separate border-spacing-y-2 border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 pb-2">Agent</th>
                  <th className="px-4 pb-2 text-center">Bugs trouvés</th>
                  <th className="px-4 pb-2 text-center">Tests exécutés</th>
                  <th className="px-4 pb-2 text-center">Tests créés</th>
                  <th className="px-4 pb-2 text-right">Taux de bug (%)</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.length > 0 ? (
                  agentPerformance.filter(a => a.agentName === user?.username).map((agent, index) => (
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
                      <td className="bg-slate-50/50 p-4 dark:bg-slate-800/40 text-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {agent.testsCreated}
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
                    <td colSpan={5} className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">Aucune donnée de performance disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}