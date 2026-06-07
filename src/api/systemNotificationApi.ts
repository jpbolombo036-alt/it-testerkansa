import api from './axios'

export interface SystemNotification {
  id: number
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export async function fetchNotifications(): Promise<SystemNotification[]> {
  const response = await api.get<SystemNotification[]>('/system-notifications')
  return response.data
}

export async function fetchUnreadNotifications(): Promise<SystemNotification[]> {
  const response = await api.get<SystemNotification[]>('/system-notifications/unread')
  return response.data
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await api.get<number>('/system-notifications/unread-count')
  return response.data
}

export async function markNotificationAsRead(id: number): Promise<SystemNotification> {
  const response = await api.patch<SystemNotification>(`/system-notifications/${id}/read`)
  return response.data
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch('/system-notifications/read-all')
}