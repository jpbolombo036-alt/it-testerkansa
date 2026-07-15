import { Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchUnreadCount } from '../api/systemNotificationApi'
import { connectNotificationSocket } from '../services/notificationSocket'

import UserDropdown from './UserDropdown'
import MobileMenu from './MobileMenu'

interface HeaderProps {
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export default function Header({ sidebarCollapsed = false, onToggleSidebar }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
      .then(setUnreadCount)
      .catch(() => {})

    const interval = setInterval(() => {
      fetchUnreadCount()
        .then(setUnreadCount)
        .catch(() => {})
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const disconnect = connectNotificationSocket(() => {
      fetchUnreadCount()
        .then(setUnreadCount)
        .catch(() => {})
    })
    return disconnect
  }, [])

  return (
      <header className={`fixed top-0 left-0 right-0 z-50 border-b-2 border-slate-200 bg-white px-4 py-4 shadow-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950 md:px-6 lg:px-8 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex items-center justify-center rounded-2xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Administration</p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">Gestion des Accès IT</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MobileMenu />

          <Link to="/notifications" className="relative inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition-colors duration-300 dark:bg-slate-800 dark:text-slate-200" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
