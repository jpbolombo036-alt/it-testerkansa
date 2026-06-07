import api from './axios'

export interface TestSession {
  id: number
  nom: string
  description: string
  applicationId: number
  environnement: string
  version: string
  statut: string
  nom_document: string
}

export type TestSessionCreateData = Omit<TestSession, 'id'>

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