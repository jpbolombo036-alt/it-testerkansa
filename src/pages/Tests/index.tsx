import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTestSessions, createTestSession, deleteTestSession, updateTestSession, exportTestSession, TestSession, TestSessionCreateData } from '../../api/testSessionApi'
import { fetchTestSteps, updateTest, reportBug, createTest, deleteTest, TestStep, Bug } from '../../api/testApi'
import { fetchUsers, User } from '../../api/userApi'
import { CheckCircle, XCircle, Bug as BugIcon, Loader2, ClipboardCheck, Plus, Calendar, X, Eye, FileText, Edit3, Download, Trash2, Search, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ToastProvider' // Import useToast

export default function TestsPage() {
   const { user } = useAuth()
   const { showToast } = useToast() // Initialize useToast
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
    
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<'nom' | 'dateCreation' | 'createdByUsername'>('nom')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [filterCreatorId, setFilterCreatorId] = useState<number | null>(null)
    const [users, setUsers] = useState<User[]>([])
    
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
        showToast('success', 'Test supprimé', 'Le test a été supprimé avec succès.')
      } catch {
        showToast('error', 'Erreur', 'Impossible de supprimer le test.')
      }
    }
    
    const handleDeleteSession = async (sessionId: number) => {
      if (!window.confirm("Supprimer cette session ?")) return
      try {
        await deleteTestSession(sessionId)
        setSessions(sessions.filter(s => s.id !== sessionId))
        showToast('success', 'Session supprimée', 'La session de test a été supprimée avec succès.')
      } catch {
        showToast('error', 'Erreur', 'Impossible de supprimer la session.')
      }
    }
    
    const handleExportPDF = async (sessionId: number) => {
      try {
        const session = await exportTestSession(sessionId)
        const { exportToPDF } = await import('../../utils/exportUtils')
        exportToPDF(session)
        showToast('success', 'Export PDF', 'Le rapport PDF a été généré et téléchargé.')
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de l\'export PDF.')
      }
    }
    
    const handleExportWord = async (sessionId: number) => {
      try {
        const session = await exportTestSession(sessionId)
        const { exportToWord } = await import('../../utils/exportUtils')
        exportToWord(session)
        showToast('success', 'Export Word', 'Le rapport Word a été généré et téléchargé.')
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de l\'export Word.')
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
       showToast('success', 'Test mis à jour', 'Le test a été mis à jour avec succès.')
     } catch {
       showToast('error', 'Erreur', 'Erreur lors de la mise à jour du test.')
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
        showToast('success', 'Session mise à jour', 'La session a été mise à jour avec succès.')
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de la mise à jour de la session.')
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
      loadUsersList()
    }, [])
    
    const loadUsersList = async () => {
      try {
        const data = await fetchUsers()
        setUsers(data)
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err)
      }
    }
    
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
    
    const sortedSessions = useMemo(() => {
      return [...sessions].sort((a, b) => {
        let valueA: string = '';
        let valueB: string = '';
        
        if (sortField === 'nom') {
          valueA = a.nom || '';
          valueB = b.nom || '';
        } else if (sortField === 'dateCreation') {
          valueA = a.dateCreation || '';
          valueB = b.dateCreation || '';
        } else if (sortField === 'createdByUsername') {
          valueA = a.createdByUsername || '';
          valueB = b.createdByUsername || '';
        }
        
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      });
    }, [sessions, sortField, sortDirection]);

    const filteredSessions = useMemo(() => {
      return sortedSessions.filter(session => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            session.nom?.toLowerCase().includes(term) ||
            session.description?.toLowerCase().includes(term) ||
            session.createdByUsername?.toLowerCase().includes(term)
          );
        }
        if (filterCreatorId !== null) {
          return session.createdBy === filterCreatorId;
        }
        return true;
      });
    }, [sortedSessions, searchTerm, filterCreatorId]);

    const handleCreateSession = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        setIsSubmitting(true)
        const newSession = await createTestSession(sessionFormData)
        setSessions([newSession, ...sessions])
        setShowSessionForm(false)
        setSessionFormData({ nom: '', description: '', environnement: 'PRODUCTION', version: '', nom_document: '' })
        showToast('success', 'Session créée', 'La session de test a été créée avec succès.')
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de la création de la session.')
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
        await updateTest(stepId, { statut, executeur: user?.username })
        setSelectedSessionTests(selectedSessionTests.map(s => s.id === stepId ? { ...s, statut } : s))
        showToast('success', 'Statut mis à jour', 'Le statut du test a été mis à jour.')
        if (statut === 'BUG') {
          setReportingBugFor(stepId)
        }
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de la mise à jour du statut.')
      }
    }
   
const handleCreateTestInSession = async (e: React.FormEvent) => {
      if (selectedSessionId === null) return
      e.preventDefault()
      try {
        const newTest = await createTest({
          sessionId: selectedSessionId,
          executeur: user?.username,
          ...testFormData
        })
        setSelectedSessionTests([...selectedSessionTests, newTest])
        setShowTestForm(false)
        setTestFormData({ fonction: '', precondition: '', etapes: '', resultatAttendu: '', resultatObtenu: '', statut: 'PENDING', commentaires: '' })
        showToast('success', 'Test créé', 'Le test a été créé avec succès.')
      } catch {
        showToast('error', 'Erreur', 'Erreur lors de la création du test.')
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
       showToast('success', 'Bug signalé', 'L\'anomalie a été signalée avec succès.')
     } catch {
       showToast('error', 'Erreur', 'Erreur lors de la déclaration du bug.')
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
        {selectedSessionId === null && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Sessions de Test</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Gérez les sessions et les exécutions</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSessionForm(!showSessionForm)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-white transition hover:bg-sky-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Nouvelle session
            </button>
          </div>
        </motion.div>
      )}

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

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[2rem] bg-white p-4 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, description ou créateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2.5 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              <option value="nom">Trier par nom</option>
              <option value="dateCreation">Trier par date</option>
              <option value="createdByUsername">Trier par créateur</option>
            </select>
            <select
              value={filterCreatorId ?? ''}
              onChange={(e) => setFilterCreatorId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-xl border-none bg-slate-50 py-2.5 px-4 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            >
              <option value="">Tous les créateurs</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc')}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              title={sortDirection === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </motion.div>

      {selectedSessionId === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{filteredSessions.map((session) => (
              <div key={session.id} className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-slate-900 flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{session.nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session.description}</p>
                  {session.createdByUsername && (
                    <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium">
                      Créé par : {session.createdByUsername}
                    </p>
                  )}
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
            {filteredSessions.length === 0 && sessions.length > 0 && (
              <div className="col-span-3 py-20 text-center text-slate-500">
                <p className="text-sm">Aucune session ne correspond à vos filtres.</p>
              </div>
            )}
          </div>
        ) : (
         <div className="space-y-6">
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Tests de la session #{selectedSessionId}
                </h2>
                {sessions.find(s => s.id === selectedSessionId)?.createdByUsername && (
                  <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 mt-1">
                    Créé par : {sessions.find(s => s.id === selectedSessionId)?.createdByUsername}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowTestForm(!showTestForm)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau test
                </button>
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 w-full sm:w-auto"
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
                    <th className="px-6 py-3">Exécuteur</th>
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
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{step.executeur || 'Non assigné'}</p>
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
            
<div className="sm:hidden grid gap-3">
                {selectedSessionTests.map((step) => (
                  <div 
                    key={step.id} 
                    className={`rounded-2xl border bg-white p-4 shadow-soft dark:bg-slate-900 ${
                      step.statut === 'OK' ? 'border-emerald-100 dark:border-emerald-900/30' : 
                      step.statut === 'BUG' ? 'border-rose-100 dark:border-rose-900/30' : 
                      'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex-1">{step.fonction}</h3>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                          step.statut === 'OK' ? 'bg-emerald-100 text-emerald-700' :
                          step.statut === 'BUG' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {step.statut}
                        </span>
                      </div>
                      <div className="text-xs space-y-2">
                        <div>
                          <span className="text-slate-400 font-medium">Précond :</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{step.precondition || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Étapes :</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap break-words">{step.etapes || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Résultat attendu :</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap break-words">{step.resultatAttendu || '-'}</p>
                        </div>
                        {step.resultatObtenu && (
                          <div>
                            <span className="text-slate-400 font-medium">Résultat obtenu :</span>
                            <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap break-words">{step.resultatObtenu}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-slate-400 font-medium">Exécuteur :</span>
                          <span className="text-slate-700 dark:text-slate-300">{step.executeur || 'Non assigné'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={() => handleViewTest(step)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-600 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 transition-colors"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Voir</span>
                        </button>
                        <button 
                          onClick={() => handleEditTest(step)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Modif</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteTest(step.id)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Suppr</span>
                        </button>
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Statut</label>
                    <select 
                      value={editingTest.statut || ''}
                      onChange={(e) => setEditingTest({...editingTest, statut: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                    >
                      <option value="EN COURS">En cours</option>
                      <option value="OK">OK</option>
                      <option value="BUG">Bug</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Commentaires</label>
                    <textarea 
                      value={editingTest.commentaires || ''}
                      onChange={(e) => setEditingTest({...editingTest, commentaires: e.target.value})}
                      className="w-full rounded-xl border-none bg-slate-50 py-2 px-3 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
                      rows={2}
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