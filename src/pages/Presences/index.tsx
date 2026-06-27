import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Users, Clock, AlertCircle, CheckSquare, LogIn, LogOut, RefreshCw, Calendar, ChevronLeft, ChevronRight, Search, X, UserPlus, Trash2 } from 'lucide-react'
import { useToast } from '../../components/ToastProvider'
import { fetchTodayDashboard, checkIn, checkOut, fetchAttendances, createAttendance, updateAttendance, deleteAttendance, AttendanceDashboardDTO, AttendanceReportDTO, PageResponse } from '../../api/attendanceApi'
import { useAuth } from '../../hooks/useAuth'
import { fetchUsers, User } from '../../api/userApi'
import StatCard from '../../components/StatCard'

export default function PresencesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [dashboard, setDashboard] = useState<AttendanceDashboardDTO | null>(null)
  const [attendancesPage, setAttendancesPage] = useState<PageResponse<AttendanceReportDTO>>({ 
    content: [], first: true, last: false, currentPage: 0, pageSize: 25, totalElements: 0, totalPages: 0 
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null)
  const [editingStatus, setEditingStatus] = useState<'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'>('PRESENT')
  const [editingReason, setEditingReason] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    loadAll()
    loadUsers()
  }, [])

  const loadAll = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTodayDashboard()
      setDashboard(data)
      setAttendancesPage({
        content: data.attendances,
        first: true,
        last: data.attendances.length <= 25,
        currentPage: 0,
        pageSize: 25,
        totalElements: data.attendances.length,
        totalPages: Math.ceil(data.attendances.length / 25) || 1
      })
    } catch (err) {
      console.error('Erreur chargement', err)
      setDashboard(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      console.error('Erreur chargement utilisateurs', err)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true)
      const data = await checkIn()
      showToast('success', 'Pointage enregistré', `Votre arrivée a été enregistrée à ${data.checkInTime}`)
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible de pointer votre arrivée.')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true)
      const data = await checkOut()
      showToast('success', 'Départ enregistré', `Votre départ a été enregistré à ${data.checkOutTime}`)
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible de pointer votre départ.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const getAttendanceForAgent = (agentId: number): AttendanceReportDTO | undefined => {
    return dashboard?.attendances.find((a: AttendanceReportDTO) => a.agentId === agentId)
  }

  const handleAdminCheckIn = async (agentId: number) => {
    try {
      const data = await createAttendance({
        agentId,
        date: todayStr,
        checkInTime: currentTime,
        status: 'PRESENT'
      })
      showToast('success', 'Arrivée enregistrée', `Arrivée de l'agent enregistrée à ${data.checkInTime}`)
      loadAll()
    } catch {
      showToast('error', 'Erreur', "Impossible d'enregistrer l'arrivée.")
    }
  }

  const handleAdminCheckOut = async (attendanceId: number) => {
    try {
      const data = await updateAttendance(attendanceId, { checkOutTime: currentTime })
      showToast('success', 'Départ enregistré', `Départ enregistré à ${data.checkOutTime}`)
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible d\'enregistrer le départ.')
    }
  }

  const handleAdminOpenStatus = (attendance: AttendanceReportDTO) => {
    setEditingAgentId(attendance.agentId)
    setEditingStatus(attendance.status)
    setEditingReason(attendance.reason || '')
  }

  const handleAdminSaveStatus = async () => {
    if (editingAgentId === null) return
    const attendance = getAttendanceForAgent(editingAgentId)
    if (!attendance) return
    try {
      setSavingStatus(true)
      await updateAttendance(attendance.id, { status: editingStatus, reason: editingReason || null })
      showToast('success', 'Statut mis à jour', 'Le statut de présence a été modifié.')
      setEditingAgentId(null)
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible de mettre à jour le statut.')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAdminCreateStatus = async (agentId: number) => {
    try {
      setSavingStatus(true)
      await createAttendance({
        agentId,
        date: todayStr,
        status: editingStatus,
        reason: editingReason ? editingReason : undefined
      })
      showToast('success', 'Présence créée', 'Le pointage a été créé.')
      setEditingAgentId(null)
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible de créer le pointage.')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAdminDelete = async (attendanceId: number) => {
    if (!confirm('Supprimer ce pointage ?')) return
    try {
      await deleteAttendance(attendanceId)
      showToast('success', 'Supprimé', 'Le pointage a été supprimé.')
      loadAll()
    } catch {
      showToast('error', 'Erreur', 'Impossible de supprimer le pointage.')
    }
  }

  const myAttendance = dashboard?.attendances.find((a: AttendanceReportDTO) => a.agentId === user?.id)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      case 'LATE': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
      case 'ABSENT': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
      case 'LEAVE': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Présent'
      case 'LATE': return 'En retard'
      case 'ABSENT': return 'Absent'
      case 'LEAVE': return 'Congé'
      default: return status
    }
  }

  const filteredAttendances = attendancesPage.content.filter(a => 
    a.agentUsername.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const goToPage = async (newPage: number) => {
    if (newPage < 0 || newPage >= attendancesPage.totalPages) return
    setPage(newPage)
    try {
      const data = await fetchAttendances(newPage, 25)
      setAttendancesPage({...data, content: data.content as AttendanceReportDTO[]})
    } catch {
      console.error('Erreur pagination')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Clock className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Présences</h1>
              <p className="text-slate-500 dark:text-slate-400">Gestion des pointages et des absences</p>
            </div>
          </div>
        </motion.div>
        
        <div className="rounded-[2.5rem] bg-white p-12 shadow-soft dark:bg-slate-900 text-center">
          <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Module en cours de déploiement</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Le module de présences n'est pas encore disponible sur le serveur. 
            Il sera activé prochainement pour permettre le pointage et le suivi des absences.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Clock className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Présences</h1>
              <p className="text-slate-500 dark:text-slate-400">Gestion des pointages et des absences</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadAll}
              className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Présents"
          value={dashboard.totalPresent.toString()}
          description="Agents présents"
          icon={<CheckSquare className="h-6 w-6 text-emerald-600" />}
          panelClass="border-emerald-100 dark:border-emerald-900/30 shadow-emerald-100/20"
        />
        <StatCard
          title="Absents"
          value={dashboard.totalAbsent.toString()}
          description="Agents absents"
          icon={<AlertCircle className="h-6 w-6 text-rose-600" />}
          panelClass="border-rose-100 dark:border-rose-900/30 shadow-rose-100/20"
        />
        <StatCard
          title="En retard"
          value={dashboard.totalLate.toString()}
          description="Arrivées tardives"
          icon={<Clock className="h-6 w-6 text-amber-600" />}
          panelClass="border-amber-100 dark:border-amber-900/30 shadow-amber-100/20"
        />
        <StatCard
          title="Taux de présence"
          value={`${dashboard.attendanceRate}%`}
          description={`${dashboard.totalAgents} agents au total`}
          icon={<Users className="h-6 w-6 text-sky-600" />}
          panelClass="border-sky-100 dark:border-sky-900/30 shadow-sky-100/20"
        />
      </div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Mon pointage du jour</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {myAttendance ? (
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                  <p className="text-xs text-slate-500 uppercase">Arrivée</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{myAttendance.checkInTime || '-'}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                  <p className="text-xs text-slate-500 uppercase">Départ</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{myAttendance.checkOutTime || '-'}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                  <p className="text-xs text-slate-500 uppercase">Durée</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{myAttendance.duration || '-'}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-slate-500">Vous n'avez pas encore pointé votre arrivée aujourd'hui.</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn || !!(myAttendance?.checkInTime)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Pointer arrivée
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut || !(myAttendance?.checkInTime)}
                className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Pointer départ
              </button>
            </div>
          </div>
        </div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Présences du jour</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border-none bg-slate-50 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-400 dark:bg-slate-950"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-separate border-spacing-y-4 border border-slate-200 dark:border-slate-700">
            <thead>
              <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Arrivée</th>
                <th className="px-4 py-2">Départ</th>
                <th className="px-4 py-2">Durée</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.length > 0 ? (
                filteredAttendances.map((attendance: AttendanceReportDTO) => (
                  <motion.tr
                    key={attendance.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group transition-all"
                  >
                    <td className="rounded-l-2xl bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{attendance.agentUsername}</span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{attendance.checkInTime || '-'}</span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{attendance.checkOutTime || '-'}</span>
                    </td>
                    <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{attendance.duration || '-'}</span>
                    </td>
                    <td className="rounded-r-2xl bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(attendance.status)}`}>
                        {getStatusLabel(attendance.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Aucune présence enregistrée pour aujourd'hui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {attendancesPage.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">
              Page {page + 1} sur {attendancesPage.totalPages} ({attendancesPage.totalElements} éléments)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 dark:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= attendancesPage.totalPages - 1}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 dark:bg-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Administration des présences</h2>
          {loadingUsers ? (
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          ) : (
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{users.length} agents</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4 border border-slate-200 dark:border-slate-700">
            <thead>
              <tr className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Arrivée</th>
                <th className="px-4 py-2">Départ</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loadingUsers ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Aucun agent disponible.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const attendance = getAttendanceForAgent(u.id)
                  const isEditing = editingAgentId === u.id
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-all"
                    >
                      <td className="rounded-l-2xl bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm group-hover:shadow-md">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{u.username}</span>
                      </td>
                      <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{attendance?.checkInTime || '-'}</span>
                      </td>
                      <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{attendance?.checkOutTime || '-'}</span>
                      </td>
                      <td className="bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        {isEditing ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 dark:bg-slate-900 dark:border-slate-700"
                          >
                            <option value="PRESENT">Présent</option>
                            <option value="LATE">En retard</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LEAVE">Congé</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${attendance ? getStatusBadgeClass(attendance.status) : 'bg-slate-100 text-slate-600'}`}>
                            {attendance ? getStatusLabel(attendance.status) : 'Aucun'}
                          </span>
                        )}
                      </td>
                      <td className="rounded-r-2xl bg-slate-50/50 p-4 dark:bg-slate-800/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <div className="flex items-center justify-end gap-2">
                          {!attendance?.checkInTime && (
                            <button
                              onClick={() => handleAdminCheckIn(u.id)}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                              title="Pointer arrivée"
                            >
                              <LogIn className="h-4 w-4" />
                            </button>
                          )}
                          {attendance?.checkInTime && !attendance.checkOutTime && (
                            <button
                              onClick={() => handleAdminCheckOut(attendance.id)}
                              className="p-2 rounded-lg bg-sky-50 text-sky-700 transition hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
                              title="Pointer départ"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}
                          {attendance ? (
                            <>
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleAdminSaveStatus}
                                    disabled={savingStatus}
                                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold disabled:opacity-50"
                                  >
                                    {savingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
                                  </button>
                                  <button
                                    onClick={() => setEditingAgentId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold dark:bg-slate-700 dark:text-slate-300"
                                  >
                                    Annuler
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleAdminOpenStatus(attendance)}
                                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold transition hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
                                  title="Modifier statut"
                                >
                                  Éditer
                                </button>
                              )}
                              <button
                                onClick={() => handleAdminDelete(attendance.id)}
                                className="p-2 rounded-lg bg-rose-50 text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => { setEditingAgentId(u.id); setEditingStatus('PRESENT'); setEditingReason('') }}
                              className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold transition hover:bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
                              title="Créer pointage"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
