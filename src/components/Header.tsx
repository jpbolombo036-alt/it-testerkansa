import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'

import UserDropdown from './UserDropdown'
import MobileMenu from './MobileMenu'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Administration</p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">Gestion des Accès IT</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MobileMenu />

          <motion.button
            whileHover={{ scale: 1.04 }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition-colors duration-300 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white shadow-sm">
              3
            </span>
          </motion.button>

          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
