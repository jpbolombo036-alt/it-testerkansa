import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, SystemNotification } from '../../api/systemNotificationApi'
import { Bell, Check, Trash2, Loader2, X, ExternalLink } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [notifs, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Erreur chargement notifications', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erreur marquage', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Erreur marquage global', err)
    }
  }

  const getIcon = (type: string) => {
    const icons = {
      INFO: <Bell className="h-4 w-4 text-sky-500" />,
      SUCCESS: <Check className="h-4 w-4 text-emerald-500" />,
      WARNING: <X className="h-4 w-4 text-amber-500" />,
      ERROR: <X className="h-4 w-4 text-rose-500" />
    }
    return icons[type as keyof typeof icons] || icons.INFO
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Bell className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-slate-900">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <motion.div
                layout
                key={notification.id}
                className={`rounded-2xl p-4 flex items-start gap-3 ${
                  notification.isRead 
                    ? 'bg-slate-50 dark:bg-slate-800/30' 
                    : 'bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30'
                }`}
              >
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{notification.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{formatDate(notification.createdAt)}</p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    title="Marquer comme lu"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600"
                    title="Voir plus"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}