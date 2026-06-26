import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: ReactNode
  panelClass: string
}

export default function StatCard({ title, value, description, icon, panelClass }: StatCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-6 ${panelClass} ${panelClass.startsWith('dark:') ? '' : 'dark:bg-slate-900'}`}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 shadow-sm transition-colors duration-300 dark:bg-slate-800 dark:text-slate-200 sm:mb-6 sm:h-14 sm:w-14">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-sm dark:text-slate-400">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:mt-4 sm:text-3xl">{value}</h3>
      <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400 sm:mt-3 sm:text-sm">{description}</p>
    </motion.article>
  )
}
