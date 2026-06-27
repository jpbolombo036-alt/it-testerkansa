import { ShieldCheck, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const badgeItems = ['Administrateur', 'Sécurité', 'Accès']

function getFormattedDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function HeroBanner() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 px-6 py-8 text-white shadow-soft"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-2xl space-y-5">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-100/80 sm:text-sm">
            Bonjour, {user?.username || 'Utilisateur'}
          </p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Bienvenue dans votre console IT Access Manager</h2>
          <p className="max-w-xl text-sm text-slate-100/90 sm:text-base">Contrôlez les applications, comptes, tests et sessions de votre organisation avec une vue centralisée et des métriques claires.</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm sm:px-4 sm:py-2 sm:text-sm">{getFormattedDate()}</span>
            {badgeItems.map((badge) => (
              <span key={badge} className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-slate-100 sm:px-4 sm:py-2 sm:text-sm">
                {badge}
              </span>
            ))}
          </div>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Rechercher globalement..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-2xl border-none bg-white/20 py-2 pl-4 pr-10 text-sm text-white placeholder-white/70 outline-none transition focus:ring-2 focus:ring-white/50"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
          </div>
        </div>

      <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative flex h-40 w-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur-md sm:h-48 lg:w-[280px] xl:w-[320px]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-xl sm:h-20 sm:w-20">
            <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <div className="absolute bottom-4 left-4 rounded-3xl bg-white/15 px-3 py-2 text-xs text-slate-100 shadow-inner sm:bottom-6 sm:left-6 sm:px-4 sm:py-3 sm:text-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-200/80 sm:text-xs">Statut</p>
            <p className="mt-1 text-xs font-medium sm:mt-1 sm:text-sm">
               {user?.role === 'admin' ? 'Super administrateur' : 'Utilisateur'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}