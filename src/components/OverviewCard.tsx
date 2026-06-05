import { motion } from 'framer-motion'

interface OverviewCardProps {
  title: string
  total: string
  description: string
}

export default function OverviewCard({ title, total, description }: OverviewCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">{total}</p>
        </div>
        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:px-4 sm:py-2 sm:text-sm">
          Voir tous
        </button>
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-500 sm:mt-4 sm:text-sm">{description}</p>
    </motion.article>
  )
}
