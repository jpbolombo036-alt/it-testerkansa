import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { API_BASE_URL } from '../config'

let client: Client | null = null

export function connectNotificationSocket(onMessage: () => void): () => void {
  const token = localStorage.getItem('token')
  if (client && client.active) {
    return () => client?.deactivate()
  }

  const stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    reconnectDelay: 5000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    onConnect: () => {
      stompClient.subscribe('/topic/notifications', () => {
        onMessage()
      })
    },
  })

  stompClient.activate()
  client = stompClient

  return () => {
    stompClient.deactivate()
    if (client === stompClient) client = null
  }
}
