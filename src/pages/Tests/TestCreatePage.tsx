import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createTest } from '../../api/testApi'
import { Loader2, Plus, X, FileText, ClipboardCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'
import type { TestStep } from '../../api/testApi'

type TestStepCreateData = Partial<TestStep>

export default function TestCreatePage() {
   const navigate = useNavigate()
   const [searchParams] = useSearchParams()
   const { showToast } = useToast()
   const [isSubmitting, setIsSubmitting] = useState(false)
   const sessionIdFromQuery = searchParams.get('session')
   const sessionId = sessionIdFromQuery ? Number(sessionIdFromQuery) : null

   const getLocalDateTime = () => {
     const now = new Date()
     const offset = now.getTimezoneOffset()
     const localDate = new Date(now.getTime() - offset * 60 * 1000)
     return localDate.toISOString().slice(0, 19)
   }

   const [formData, setFormData] = useState<TestStepCreateData>({
     fonction: '',
     precondition: '',
     etapes: '',
     resultatAttendu: '',
     resultatObtenu: '',
     statut: 'EN COURS',
     sessionId: sessionId ?? undefined,
     dateCreation: getLocalDateTime(),
   })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!(formData.fonction?.trim())) {
      showToast('error', 'Erreur', 'La fonction du test est obligatoire.')
      return
    }
    try {
      setIsSubmitting(true)
      await createTest(formData)
      showToast('success', 'Test créé', 'Le test a été créé avec succès.')
      navigate(sessionId ? `/tests?session=${sessionId}` : '/tests')
    } catch {
      showToast('error', 'Erreur', 'Erreur lors de la création du test.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(sessionId ? `/tests?session=${sessionId}` : '/tests')}
          className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nouveau test</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ajoutez un cas de test à la session</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Fonction *</label>
            <input
              type="text"
              required
              value={formData.fonction}
              onChange={(e) => setFormData({...formData, fonction: e.target.value})}
              placeholder="Ex: Vérifier la connexion utilisateur"
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Précondition</label>
              <input
                type="text"
                value={formData.precondition}
                onChange={(e) => setFormData({...formData, precondition: e.target.value})}
                placeholder="Conditions préalables"
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({...formData, statut: e.target.value})}
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              >
                <option value="EN COURS">En cours</option>
                <option value="OK">OK</option>
                <option value="BUG">Bug</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Étapes</label>
            <textarea
              value={formData.etapes}
              onChange={(e) => setFormData({...formData, etapes: e.target.value})}
              placeholder="Décrivez les étapes du test..."
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Résultat attendu</label>
              <input
                type="text"
                value={formData.resultatAttendu}
                onChange={(e) => setFormData({...formData, resultatAttendu: e.target.value})}
                placeholder="Résultat attendu"
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Résultat obtenu</label>
              <input
                type="text"
                value={formData.resultatObtenu}
                onChange={(e) => setFormData({...formData, resultatObtenu: e.target.value})}
                placeholder="Résultat obtenu"
                className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-2.5 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer le test
            </button>
            <button
              type="button"
              onClick={() => navigate(sessionId ? `/tests?session=${sessionId}` : '/tests')}
              className="rounded-2xl bg-slate-100 px-6 py-2.5 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
