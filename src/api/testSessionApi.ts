import api from './axios'

export interface Test {
  id: number
  sessionId: number
  fonction: string
  precondition: string
  etapes: string
  resultatAttendu: string
  resultatObtenu: string
  statut: string
  commentaires?: string
}

export const SESSION_STATUS_OPEN = 'OPEN'
export const SESSION_STATUS_CLOSED = 'CLOSED'

export interface TestSession {
   id: number
   nom: string
   description: string
   applicationId?: number
   environnement: string
   version?: string
   statut?: string
   nom_document?: string
   dateCreation: string
   createdBy?: number
   createdByUsername?: string
   createdByRole?: string
   tests?: Test[]
  }
  
  export type TestSessionCreateData = Partial<TestSession>

/**
 * GET /test-sessions : Liste toutes les sessions
 */
export async function fetchTestSessions() {
  const response = await api.get<TestSession[]>('/test-sessions')
  return response.data
}

/**
 * POST /test-sessions : Créer une nouvelle session
 */
export async function createTestSession(data: TestSessionCreateData) {
  const response = await api.post<TestSession>('/test-sessions', data)
  return response.data
}

/**
 * PUT /test-sessions/{id} : Mise à jour d'une session existante
 */
export async function updateTestSession(id: number, data: TestSessionCreateData) {
  const response = await api.put<TestSession>(`/test-sessions/${id}`, data)
  return response.data
}

/**
 * DELETE /test-sessions/{id} : Supprimer une session
 */
export async function deleteTestSession(id: number) {
  await api.delete(`/test-sessions/${id}`)
}

/**
 * GET /test-sessions/{id} : Récupère une session par ID
 */
export async function fetchTestSessionById(id: number) {
  const response = await api.get<TestSession>(`/test-sessions/${id}`)
  return response.data
}

/**
 * GET /test-sessions/{id}/export : Récupère les données de la session pour export
 */
export async function exportTestSession(id: number) {
  const response = await api.get<TestSession>(`/test-sessions/${id}/export`)
  return response.data
}

/**
 * POST /test-sessions/{id}/request-close : Demande la clôture d'une session (notification aux admins)
 */
export async function requestCloseSession(id: number) {
   const response = await api.post<TestSession>(`/test-sessions/${id}/request-close`)
   return response.data
}

export async function closeSession(id: number) {
   const response = await api.post<TestSession>(`/test-sessions/${id}/close`)
   return response.data
}