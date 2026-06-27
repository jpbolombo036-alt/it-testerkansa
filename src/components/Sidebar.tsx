import { NavLink } from 'react-router-dom'
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
  Clock,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const baseMenuItems = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { label: 'Applications', to: '/applications', icon: Layers },
  { label: 'Liens Web', to: '/application-links', icon: Link },
  { label: 'Comptes', to: '/comptes', icon: CreditCard },
  { label: 'Notes QA', to: '/bloc-notes', icon: StickyNote },
  { label: 'Tests', to: '/tests', icon: CheckSquare },
  { label: 'Tâches', to: '/taches', icon: FileText },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
  { label: 'Rapports', to: '/rapports', icon: ShieldCheck },
  { label: 'Archive Documents', to: '/document-archive', icon: FolderOpen },
  { label: 'Mon Profil', to: '/profil', icon: UserCircle },
]

const adminMenuItems = [
  { label: 'Présences', to: '/presences', icon: Clock },
  { label: 'Utilisateurs', to: '/users', icon: Users },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export { baseMenuItems }

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const menuItems = isAdmin ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems

  return (
    <aside className={`fixed left-0 top-0 z-20 hidden h-screen flex-col border-r-2 border-slate-200 bg-white backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 md:flex ${collapsed ? 'w-16' : 'w-72'}`}>
      <div className="flex flex-col h-full" style={{ paddingTop: '17px' }}>
        <div className={`flex items-center gap-3 px-4 py-4 border-b-2 border-slate-200 bg-white shadow-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">IT Access Manager</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestion des accès</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar px-3 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-300 ${collapsed ? 'justify-center' : ''} ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 shadow-soft dark:bg-sky-500/20 dark:text-sky-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto px-3 pb-3">
          {!collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">AD</div>
          )}
        </div>
      </div>
    </aside>
    )
  }
