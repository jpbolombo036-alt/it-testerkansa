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
  receiverId: number
  content: string
}

export async function sendMessage(toUserId: number, content: string) {
  const response = await api.post<Message>('/messages', { receiverId: toUserId, content })
  return response.data
}

export async function sendAttachment(toUserId: number, content: string, file: File) {
  const formData = new FormData()
  formData.append('receiverId', toUserId.toString())
  formData.append('content', content)
  formData.append('attachment', file)
  const response = await api.post<Message>('/messages', formData)
  return response.data
}

export async function fetchMessages() {
  const response = await api.get<Message[]>('/messages')
  return response.data
}

export async function fetchConversation(userId: number) {
  const response = await api.get<Message[]>(`/messages/conversation/${userId}`)
  return response.data
}

export async function fetchUnreadCount() {
  const response = await api.get<{ count: number }>('/messages/unread-count')
  return response.data
}

export interface UnreadConversation {
  userId: number
  count: number
}

export async function fetchUnreadConversations() {
  const response = await api.get<UnreadConversation[]>('/messages/unread-conversations')
  return response.data
}

export async function markConversationAsRead(userId: number) {
  await api.patch(`/messages/conversation/${userId}/read`)
}