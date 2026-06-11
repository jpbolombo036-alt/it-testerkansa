import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { menuItems } from './Sidebar'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="md:hidden">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-colors duration-200 dark:border-slate-800 dark:text-slate-200"
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-80 flex-col overflow-y-auto border-r border-slate-200 bg-white/95 px-6 py-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                    <Menu className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <nav className="space-y-1">
{menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            isActive
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </NavLink>
                    )
                  })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
