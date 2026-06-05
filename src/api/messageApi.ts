import api from './axios'

export interface Message {
  id: number
  fromUserId: number
  content: string
  timestamp: string
}

export async function fetchConversation(userId: number) {
  const response = await api.get<Message[]>(`/messages/conversation/${userId}`)
  return response.data
}

export async function sendMessage(toUserId: number, content: string) {
  const response = await api.post('/messages', { toUserId, content })
  return response.data
}

export async function fetchUnreadCount() {
  const response = await api.get<{ count: number }>('/messages/unread-count')
  return response.data
}