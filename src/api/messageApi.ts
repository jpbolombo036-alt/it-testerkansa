import api from './axios'

export interface Message {
  id: number
  senderId: number
  senderUsername?: string
  receiverId: number
  receiverUsername?: string
  content: string
  read: boolean
  timestamp: string
}

export interface SendMessageData {
  toUserId: number
  content: string
}

/**
 * GET /messages : Liste tous les messages
 */
export async function fetchMessages() {
  const response = await api.get<Message[]>('/messages')
  return response.data
}

/**
 * GET /messages/conversation/{userId} : Récupère la conversation avec un utilisateur
 */
export async function fetchConversation(userId: number) {
  const response = await api.get<Message[]>(`/messages/conversation/${userId}`)
  return response.data
}

/**
 * POST /messages : Envoie un nouveau message
 */
export async function sendMessage(toUserId: number, content: string) {
  const response = await api.post<Message>('/messages', { toUserId, content })
  return response.data
}

/**
 * GET /messages/unread-count : Nombre de messages non lus
 */
export async function fetchUnreadCount() {
  const response = await api.get<{ count: number }>('/messages/unread-count')
  return response.data
}