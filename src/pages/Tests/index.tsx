import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTestSessions, createTestSession, deleteTestSession, updateTestSession, exportTestSession, TestSession, TestSessionCreateData } from '../../api/testSessionApi'
import { fetchTestSteps, updateTest, reportBug, createTest, deleteTest, TestStep, Bug } from '../../api/testApi'
import { CheckCircle, XCircle, Bug as BugIcon, Loader2, ClipboardCheck, Plus, Calendar, X, Eye, FileText, Edit3, Download, Trash2 } from 'lucide-react'

export default function TestsPage() {
   const [sessions, setSessions] = useState<TestSession[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [showSessionForm, setShowSessionForm] = useState(false)
   const [showTestForm, setShowTestForm] = useState(false)
   const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
   const [selectedSessionTests, setSelectedSessionTests] = useState<TestStep[]>([])
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [reportingBugFor, setReportingBugFor] = useState<number | null>(null)
   const [bugDescription, setBugDescription] = useState('')
   
   const [showViewModal, setShowViewModal] = useState(false)
   const [showEditModal, setShowEditModal] = useState(false)
   const [editingTest, setEditingTest] = useState<TestStep | null>(null)
   
   const handleViewTest = (test: TestStep) => {
     setEditingTest(test)
     setShowViewModal(true)
   }
   
   const handleEditTest = (test: TestStep) => {
     setEditingTest({...test})
     setShowEditModal(true)
   }
   
const handleDeleteTest = async (testId: number) => {
      if (!window.confirm("Supprimer ce test ?")) return
      try {
        await deleteTest(testId)
        setSelectedSessionTests(selectedSessionTests.filter(t => t.id !== testId))
      } catch (err) {
        alert("Erreur lors de la suppression")
      }
    }
    
    const handleDeleteSession = async (sessionId: number) => {
      if (!window.confirm("Supprimer cette session ?")) return
      try {
        await deleteTestSession(sessionId)
        setSessions(sessions.filter(s => s.id !== sessionId))
      } catch (err) {
        alert("Erreur lors de la suppression")
      }
    }
    
    const handleExportPDF = async (sessionId: number) => {
      try {
        const session = await exportTestSession(sessionId)
        const { exportToPDF } = await import('../../utils/exportUtils')
        exportToPDF(session)
      } catch (err) {
        alert("Erreur lors de l'export PDF")
      }
    }
    
    const handleExportWord = async (sessionId: number) => {
      try {
        const session = await exportTestSession(sessionId)
        const { exportToWord } = await import('../../utils/exportUtils')
        exportToWord(session)
      } catch (err) {
        alert("Erreur lors de l'export Word")
      }
    }
    
    const handleUpdateTest = async (e: React.FormEvent) => {
     if (!editingTest) return
     e.preventDefault()
     try {
       const updated = await updateTest(editingTest.id, editingTest)
       setSelectedSessionTests(selectedSessionTests.map(t => t.id === editingTest.id ? updated : t))
       setShowEditModal(false)
       setEditingTest(null)
     } catch (err) {
       alert("Erreur lors de la mise à jour")
     }
   }
   
const [editingSession, setEditingSession] = useState<TestSession | null>(null)
    const [showEditSessionModal, setShowEditSessionModal] = useState(false)
    
    const handleEditSession = (session: TestSession) => {
      setEditingSession({...session})
      setShowEditSessionModal(true)
    }
    
    const handleUpdateSession = async (e: React.FormEvent) => {
      if (!editingSession) return
      e.preventDefault()
      try {
        const updated = await updateTestSession(editingSession.id, editingSession)
        setSessions(sessions.map(s => s.id === editingSession.id ? updated : s))
        setShowEditSessionModal(false)
        setEditingSession(null)
} catch (err) {
        alert("Erreur lors de la mise à jour")
      }
    }
    
    const [testFormData, setTestFormData] = useState({
        fonction: '',
        precondition: '',
        etapes: '',
        resultatAttendu: '',
        resultatObtenu: '',
        statut: 'EN COURS',
        commentaires: ''
      })
    
    const [sessionFormData, setSessionFormData] = useState<Partial<TestSession>>({
      nom: '',
      description: '',
      environnement: 'PRODUCTION',
      version: '',
      nom_document: ''
    })
   
   useEffect(() => {
     loadSessions()
   }, [])
   
   const loadSessions = async () => {
     try {
       setIsLoading(true)
       const data = await fetchTestSessions()
       setSessions(data)
     } catch (err) {
       console.error("Erreur chargement sessions", err)
     } finally {
       setIsLoading(false)
     }
   }
   
const handleCreateSession = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        setIsSubmitting(true)
        const newSession = await createTestSession(sessionFormData)
        setSessions([newSession, ...sessions])
        setShowSessionForm(false)
        setSessionFormData({ nom: '', description: '', environnement: 'PRODUCTION', version: '', nom_document: '' })
      } catch (err) {
        alert("Erreur lors de la création de la session")
      } finally {
        setIsSubmitting(false)
      }
    }
   
   const handleViewTests = async (sessionId: number) => {
     setSelectedSessionId(sessionId)
     try {
       const tests = await fetchTestSteps(sessionId)
       setSelectedSessionTests(tests)
     } catch (err) {
       console.error("Erreur chargement tests", err)
     }
   }
   
const handleStatusChange = async (stepId: number, statut: string) => {
      try {
        await updateTest(stepId, { statut })
        setSelectedSessionTests(selectedSessionTests.map(s => s.id === stepId ? { ...s, statut } : s))
        if (statut === 'BUG') {
          setReportingBugFor(stepId)
        }
      } catch (err) {
        alert("Erreur lors de la mise à jour du statut")
      }
    }
   
const handleCreateTestInSession = async (e: React.FormEvent) => {
      if (selectedSessionId === null) return
      e.preventDefault()
      try {
        const newTest = await createTest({
          sessionId: selectedSessionId,
          ...testFormData
        })
        setSelectedSessionTests([...selectedSessionTests, newTest])
        setShowTestForm(false)
        setTestFormData({ fonction: '', precondition: '', etapes: '', resultatAttendu: '', resultatObtenu: '', statut: 'PENDING', commentaires: '' })
      } catch (err) {
        alert("Erreur lors de la création du test")
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
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
       >
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
               <ClipboardCheck className="h-10 w-10" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sessions de Test</h1>
               <p className="text-slate-500 dark:text-slate-400">Gérez les sessions et les exécutions de tests</p>
             </div>
           </div>
           
           <button
             onClick={() => setShowSessionForm(!showSessionForm)}
             className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
           >
             <Plus className="h-5 w-5" />
             Nouvelle session
           </button>
         </div>
       </motion.div>
       
       <AnimatePresence>
         {showSessionForm && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
           >
             <div className="mb-4 flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Créer une session</h2>
               <button onClick={() => setShowSessionForm(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="h-5 w-5" />
               </button>
             </div>
             <form onSubmit={handleCreateSession} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Nom *</label>
                   <input 
                     type="text" 
                     required
                     value={sessionFormData.nom}
                     onChange={(e) => setSessionFormData({...sessionFormData, nom: e.target.value})}
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Environnement</label>
                   <select 
                     value={sessionFormData.environnement}
                     onChange={(e) => setSessionFormData({...sessionFormData, environnement: e.target.value})}
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   >
                     <option value="DEVELOPPEMENT">Développement</option>
                     <option value="STAGING">En test</option>
                     <option value="PRODUCTION">Production</option>
                   </select>
                 </div>
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                 <textarea 
                   value={sessionFormData.description}
                   onChange={(e) => setSessionFormData({...sessionFormData, description: e.target.value})}
                   className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   rows={2}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Version</label>
                   <input 
                     type="text" 
                     value={sessionFormData.version}
                     onChange={(e) => setSessionFormData({...sessionFormData, version: e.target.value})}
                     placeholder="ex: 1.0.0"
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold uppercase text-slate-500">Document</label>
                   <input 
                     type="text" 
                     value={sessionFormData.nom_document}
                     onChange={(e) => setSessionFormData({...sessionFormData, nom_document: e.target.value})}
                     placeholder="Nom du document"
                     className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                   />
                 </div>
               </div>
               <button disabled={isSubmitting} className="rounded-2xl bg-sky-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-50">
                 {isSubmitting ? <Loader2 className="animate-spin" /> : "Créer"}
               </button>
             </form>
           </motion.div>
         )}
       </AnimatePresence>
       
{selectedSessionId === null ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {sessions.map((session) => (
             <div key={session.id} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900 flex flex-col h-full">
               <div className="flex-1">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.nom}</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session.description}</p>
                 <div className="mt-3 flex flex-wrap gap-2 text-xs">
                   <span className="flex items-center gap-1 text-slate-500">
                     <Calendar className="h-3 w-3" />
                     {new Date(session.dateCreation).toLocaleDateString()}
                   </span>
                   <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">{session.environnement}</span>
                 </div>
               </div>
<div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleViewTests(session.id)}
                    className="flex items-center justify-center rounded-2xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    title="Voir les tests"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleExportPDF(session.id)}
                    className="flex items-center justify-center rounded-2xl bg-rose-100 p-2 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                    title="Exporter PDF"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleExportWord(session.id)}
                    className="flex items-center justify-center rounded-2xl bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    title="Exporter Word"
                  >
                    <FileText className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleEditSession(session)}
                    className="flex items-center justify-center rounded-2xl bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                    title="Modifier"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="flex items-center justify-center rounded-2xl bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="space-y-6">
           <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
               Tests de la session #{selectedSessionId}
             </h2>
             <div className="flex gap-2">
               <button
                 onClick={() => setShowTestForm(!showTestForm)}
                 className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700"
               >
                 <Plus className="h-4 w-4" />
                 Nouveau test
               </button>
               <button
                 onClick={() => setSelectedSessionId(null)}
                 className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
               >
                 Retour aux sessions
               </button>
             </div>
           </div>
           
           <AnimatePresence>
             {showTestForm && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
               >
                 <div className="mb-4 flex items-center justify-between">
                   <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Nouveau test</h3>
                   <button onClick={() => setShowTestForm(false)} className="text-slate-400 hover:text-slate-600">
                     <X className="h-5 w-5" />
                   </button>
                 </div>
                 <form onSubmit={handleCreateTestInSession} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase text-slate-500">Fonction *</label>
                       <input 
                         type="text" 
                         required
                         value={testFormData.fonction}
                         onChange={(e) => setTestFormData({...testFormData, fonction: e.target.value})}
                         className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-xs font-bold uppercase text-slate-500">Précondition</label>
                       <input 
                         type="text" 
                         value={testFormData.precondition}
                         onChange={(e) => setTestFormData({...testFormData, precondition: e.target.value})}
                         className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-slate-500">Étapes</label>
                     <textarea 
                       value={testFormData.etapes}
                       onChange={(e) => setTestFormData({...testFormData, etapes: e.target.value})}
                       className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                       rows={3}
                     />
                   </div>
<div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500">Résultat attendu</label>
                        <input 
                          type="text" 
                          value={testFormData.resultatAttendu}
                          onChange={(e) => setTestFormData({...testFormData, resultatAttendu: e.target.value})}
                          className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500">Résultat obtenu</label>
                        <input 
                          type="text" 
                          value={testFormData.resultatObtenu}
                          onChange={(e) => setTestFormData({...testFormData, resultatObtenu: e.target.value})}
                          className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-slate-500">Statut</label>
<select 
                           value={testFormData.statut}
                           onChange={(e) => setTestFormData({...testFormData, statut: e.target.value})}
                           className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                         >
                           <option value="EN COURS">En cours</option>
                           <option value="OK">OK</option>
                           <option value="BUG">Bug</option>
                         </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500">Commentaires</label>
                      <textarea 
                        value={testFormData.commentaires}
                        onChange={(e) => setTestFormData({...testFormData, commentaires: e.target.value})}
                        className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                        rows={2}
                      />
                    </div>
                    <button type="submit" className="rounded-2xl bg-sky-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-sky-700">
                     Créer le test
                   </button>
                 </form>
               </motion.div>
             )}
           </AnimatePresence>
           
<div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                    <th className="px-6 py-3">Fonction</th>
                    <th className="px-6 py-3">Précondition</th>
                    <th className="px-6 py-3">Étapes</th>
                    <th className="px-6 py-3">Résultat attendu</th>
                    <th className="px-6 py-3">Résultat obtenu</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSessionTests.map((step) => (
                    <motion.tr 
                      layout 
                      key={step.id} 
                      className="group transition-all duration-300 hover:translate-x-1"
                    >
                      <td className="rounded-l-[1.5rem] bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{step.fonction}</p>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[150px]">{step.precondition || '-'}</p>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[200px]">{step.etapes}</p>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 max-w-[150px]">{step.resultatAttendu}</p>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 max-w-[150px]">{step.resultatObtenu || '-'}</p>
                      </td>
                      <td className="bg-slate-50/50 p-5 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                          step.statut === 'OK' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' :
                          step.statut === 'BUG' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                        }`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${step.statut === 'OK' ? 'bg-emerald-500' : step.statut === 'BUG' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          {step.statut}
                        </span>
                      </td>
                      <td className="rounded-r-[1.5rem] bg-slate-50/50 p-5 text-right dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleViewTest(step)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/30 transition-all"
                            title="Voir"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleEditTest(step)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-all"
                            title="Modifier"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTest(step.id)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
<div className="sm:hidden grid gap-4">
               {selectedSessionTests.map((step) => (
                 <div 
                   key={step.id} 
                   className={`rounded-[2rem] border bg-white p-4 shadow-soft dark:bg-slate-900 ${
step.statut === 'OK' ? 'border-emerald-100 dark:border-emerald-900/30' : 
                      step.statut === 'BUG' ? 'border-rose-100 dark:border-rose-900/30' : ''
                   }`}
                 >
                   <div className="space-y-2">
                     <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{step.fonction}</h3>
                     <p className="text-xs text-slate-500">{step.precondition}</p>
                     <p className="text-xs text-slate-500 truncate">{step.etapes}</p>
                     <p className="text-xs">
                       <span className="text-slate-400">Résultat :</span> {step.resultatAttendu}
                     </p>
                     <div className="flex items-center justify-between pt-2">
<span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          step.statut === 'OK' ? 'bg-emerald-100 text-emerald-700' :
                          step.statut === 'BUG' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {step.statut}
                        </span>
                       <div className="flex gap-1">
                         <button 
                           onClick={() => handleViewTest(step)}
                           className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                           title="Voir"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                         <button 
                           onClick={() => handleEditTest(step)}
                           className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                           title="Modifier"
                         >
                           <Edit3 className="h-4 w-4" />
                         </button>
                         <button 
                           onClick={() => handleDeleteTest(step.id)}
                           className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                           title="Supprimer"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        
<AnimatePresence>
          {showEditSessionModal && editingSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Modifier la session</h3>
                  <button onClick={() => setShowEditSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateSession} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Nom</label>
                    <input 
                      type="text" 
                      value={editingSession.nom || ''}
                      onChange={(e) => setEditingSession({...editingSession, nom: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                    <textarea 
                      value={editingSession.description || ''}
                      onChange={(e) => setEditingSession({...editingSession, description: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500">Environnement</label>
                      <select 
                        value={editingSession.environnement || 'PRODUCTION'}
                        onChange={(e) => setEditingSession({...editingSession, environnement: e.target.value})}
                        className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                      >
                        <option value="DEVELOPPEMENT">Développement</option>
                        <option value="STAGING">Staging</option>
                        <option value="PRODUCTION">Production</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500">Version</label>
                      <input 
                        type="text" 
                        value={editingSession.version || ''}
                        onChange={(e) => setEditingSession({...editingSession, version: e.target.value})}
                        className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Document</label>
                    <input 
                      type="text" 
                      value={editingSession.nom_document || ''}
                      onChange={(e) => setEditingSession({...editingSession, nom_document: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <button type="submit" className="rounded-2xl bg-sky-600 px-6 py-2 font-bold text-white shadow-lg transition hover:bg-sky-700">
                    Enregistrer
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showViewModal && editingTest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Détails du test</h3>
                  <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div><span className="font-semibold">Fonction :</span> {editingTest.fonction}</div>
                  <div><span className="font-semibold">Précondition :</span> {editingTest.precondition}</div>
                  <div><span className="font-semibold">Étapes :</span> {editingTest.etapes}</div>
                  <div><span className="font-semibold">Résultat attendu :</span> {editingTest.resultatAttendu}</div>
                  <div><span className="font-semibold">Résultat obtenu :</span> {editingTest.resultatObtenu}</div>
                  <div><span className="font-semibold">Commentaires :</span> {editingTest.commentaires}</div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showEditModal && editingTest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Modifier le test</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateTest} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Fonction</label>
                    <input 
                      type="text" 
                      value={editingTest.fonction || ''}
                      onChange={(e) => setEditingTest({...editingTest, fonction: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Précondition</label>
                    <input 
                      type="text" 
                      value={editingTest.precondition || ''}
                      onChange={(e) => setEditingTest({...editingTest, precondition: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Étapes</label>
                    <textarea 
                      value={editingTest.etapes || ''}
                      onChange={(e) => setEditingTest({...editingTest, etapes: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Résultat attendu</label>
                    <input 
                      type="text" 
                      value={editingTest.resultatAttendu || ''}
                      onChange={(e) => setEditingTest({...editingTest, resultatAttendu: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Résultat obtenu</label>
                    <input 
                      type="text" 
                      value={editingTest.resultatObtenu || ''}
                      onChange={(e) => setEditingTest({...editingTest, resultatObtenu: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-sky-600 py-2 font-bold text-white hover:bg-sky-700">
                    Enregistrer
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }