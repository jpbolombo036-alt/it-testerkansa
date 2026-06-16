import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  CreditCard,
  FileText,
  LayoutDashboard,
  Layers,
  StickyNote,
  MessageCircle,
  ShieldCheck,
  UserCircle,
  Users,
  Link,
} from 'lucide-react'

export const menuItems = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { label: 'Applications', to: '/applications', icon: Layers },
  { label: 'Liens Web', to: '/application-links', icon: Link },
  { label: 'Comptes', to: '/comptes', icon: CreditCard },
  { label: 'Notes QA', to: '/bloc-notes', icon: StickyNote },
  { label: 'Tests', to: '/tests', icon: CheckSquare },
  { label: 'Tâches', to: '/taches', icon: FileText },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
  { label: 'Rapports', to: '/rapports', icon: ShieldCheck },
  { label: 'Utilisateurs', to: '/users', icon: Users },
  { label: 'Mon Profil', to: '/profil', icon: UserCircle },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white/95 px-6 py-8 shadow-soft backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95 md:flex">
      <motion.div
        initial={{ opacity: 0, x: -20 }} // Animation d'entrée depuis la gauche
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }} // Légère temporisation pour un effet plus doux
        className="mb-10 flex items-center gap-3 rounded-[2.5rem] bg-white p-4 shadow-soft transition-colors duration-300 dark:bg-slate-900"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">IT Access Manager</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gestion des accès</p>
        </div>
      </motion.div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-3xl px-4 py-3 transition-colors duration-300 ${
                  isActive
                    ? 'bg-sky-100 text-sky-700 shadow-soft dark:bg-sky-500/20 dark:text-sky-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              <motion.span
                whileHover={{ x: 6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="flex items-center gap-4 w-full"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[2rem] bg-slate-50 p-5 text-sm text-slate-600 shadow-sm transition-colors duration-300 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Conseils rapides</p>
        <p className="mt-3 leading-6">Utilisez le menu pour parcourir vos applications, comptes et rapports de sécurité.</p>
      </div>
    </aside>
  )
}
