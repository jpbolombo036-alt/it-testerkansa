import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ShieldCheck, Users2, Layers, CheckSquare, CreditCard } from 'lucide-react'
import HeroBanner from '../../components/HeroBanner'
import OverviewCard from '../../components/OverviewCard'
import StatCard from '../../components/StatCard'

const stats = [
  {
    title: 'Applications',
    value: '128',
    description: 'Applications actives surveillées par votre équipe IT.',
    icon: <Layers className="h-6 w-6 text-slate-700" />,
    panelClass: 'bg-sky-50',
  },
  {
    title: 'Comptes',
    value: '4 820',
    description: 'Comptes utilisateurs suivis en temps réel.',
    icon: <CreditCard className="h-6 w-6 text-slate-700" />,
    panelClass: 'bg-violet-50',
  },
  {
    title: 'Utilisateurs',
    value: '1 240',
    description: 'Acteurs et rôles avec accès à vos ressources.',
    icon: <Users2 className="h-6 w-6 text-slate-700" />,
    panelClass: 'bg-emerald-50',
  },
  {
    title: 'Tests',
    value: '92',
    description: 'Scénarios d’accès validés récemment.',
    icon: <CheckSquare className="h-6 w-6 text-slate-700" />,
    panelClass: 'bg-amber-50',
  },
]

const overviewItems = [
  {
    title: 'Applications',
    total: '128',
    description: 'Nombre total d’applications activées avec contrôle d’accès.',
  },
  {
    title: 'Comptes',
    total: '4 820',
    description: 'Accès gérés avec authentification multifactorielle.',
  },
  {
    title: 'Tests',
    total: '92',
    description: 'Vérifications de conformité automatisées.',
  },
  {
    title: 'Sessions',
    total: '1 560',
    description: 'Sessions actives sur la plateforme IT.',
  },
]

const trendData = [
  { name: 'Lun', sessions: 520 },
  { name: 'Mar', sessions: 610 },
  { name: 'Mer', sessions: 710 },
  { name: 'Jeu', sessions: 670 },
  { name: 'Ven', sessions: 760 },
  { name: 'Sam', sessions: 840 },
  { name: 'Dim', sessions: 900 },
]

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <HeroBanner />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">Vue d'ensemble</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-3 sm:text-2xl">Performance globale</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:px-4 sm:py-2 sm:text-sm">+18% ce mois</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-sm">Suivez les tendances de vos accès, tests et sessions avec un aperçu orienté sécurité.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {overviewItems.map((item) => (
              <OverviewCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-4 shadow-sm transition-colors duration-300 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">Activité</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-2 sm:text-2xl">Sessions récentes</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:px-4 sm:py-2 sm:text-sm">Analyse hebdo</span>
          </div>

          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 18, borderColor: '#E2E8F0', boxShadow: '0 20px 40px rgba(15,23,42,0.08)' }} />
                <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fill="url(#sessionsGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-slate-50 p-4 transition-colors dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Taux d'occupation</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">78%</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-4 transition-colors dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Alertes critiques</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">4</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
