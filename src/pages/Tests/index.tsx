import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchTestSteps, updateTest, reportBug, TestStep, Bug } from '../../api/testApi'
import { CheckCircle, XCircle, AlertTriangle, Bug as BugIcon, Loader2, ClipboardCheck } from 'lucide-react'

export default function TestsPage() {
  const [steps, setSteps] = useState<TestStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reportingBugFor, setReportingBugFor] = useState<number | null>(null)
  const [bugDescription, setBugDescription] = useState('')

  const sessionId = 1

  useEffect(() => {
    loadSteps()
  }, [])

  const loadSteps = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTestSteps(sessionId)
      setSteps(data)
    } catch (err) {
      console.error("Erreur chargement tests", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (stepId: number, statut: string) => {
    try {
      await updateTest(stepId, { statut })
      setSteps(steps.map(s => s.id === stepId ? { ...s, statut } : s))
      if (statut === 'FAILED') {
        setReportingBugFor(stepId)
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportingBugFor || !bugDescription.trim()) return

    try {
      await reportBug({
        testStepId: reportingBugFor,
        description: bugDescription,
        severity: 'HIGH',
        status: 'OPEN'
      })
      setReportingBugFor(null)
      setBugDescription('')
      alert("Bug déclaré avec succès")
    } catch (err) {
      alert("Erreur lors de la déclaration du bug")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <ClipboardCheck className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Exécution des Tests</h1>
          <p className="text-slate-500 dark:text-slate-400">Session de test #{sessionId} - Validez chaque étape du processus</p>
        </div>
      </div>

      <div className="grid gap-6">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`rounded-[2rem] border bg-white p-6 shadow-soft transition-all dark:bg-slate-900 ${
              step.statut === 'PASSED' ? 'border-emerald-100 dark:border-emerald-900/30' : 
              step.statut === 'FAILED' ? 'border-rose-100 dark:border-rose-900/30' : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{step.fonction}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step.precondition}</p>
                <p className="text-xs text-slate-500 mt-2">{step.etapes}</p>
                <div className="mt-2 inline-block rounded-lg bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800">
                  Résultat attendu : {step.resultatAttendu}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(step.id, 'PASSED')}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    step.statut === 'PASSED' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Succès
                </button>
                <button
                  onClick={() => handleStatusChange(step.id, 'FAILED')}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    step.statut === 'FAILED' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-rose-50 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  Échec
                </button>
              </div>
            </div>

            {reportingBugFor === step.id && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                onSubmit={handleReportBug} 
                className="mt-6 space-y-4 border-t border-rose-100 pt-6 dark:border-rose-900/30"
              >
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <BugIcon className="h-4 w-4" />
                  Déclarer une anomalie
                </div>
                <textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Décrivez le problème rencontré..."
                  className="w-full rounded-2xl border border-rose-100 bg-rose-50/30 p-4 text-sm outline-none focus:ring-2 focus:ring-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20"
                  rows={3}
                />
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setReportingBugFor(null)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
                  >
                    Soumettre le Bug
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}