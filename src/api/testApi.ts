import api from './axios'

export interface TestStep {
  id: number
  stepName: string
  description: string
  status: 'PENDING' | 'PASSED' | 'FAILED'
  expectedResult: string
}

export interface Bug {
  id: number
  testStepId: number
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'FIXED' | 'CLOSED'
}

/**
 * GET /tests?sessionId={id} : Liste les étapes de test pour une session
 */
export async function fetchTestSteps(sessionId: number) {
  const response = await api.get<TestStep[]>('/tests', { params: { sessionId } })
  return response.data
}

/**
 * POST /tests : Enregistre le résultat d'un test
 */
export async function updateTestResult(stepId: number, status: 'PASSED' | 'FAILED') {
  const response = await api.post('/tests', { stepId, status })
  return response.data
}

/**
 * POST /bugs : Déclare une anomalie liée à une étape
 */
export async function reportBug(bugData: Omit<Bug, 'id'>) {
  const response = await api.post<Bug>('/bugs', bugData)
  return response.data
}

/**
 * GET /bugs/step/{testStepId} : Récupère les bugs d'une étape spécifique
 */
export async function fetchBugsByStep(testStepId: number) {
  const response = await api.get<Bug[]>(`/bugs/step/${testStepId}`)
  return response.data
}

/**
 * PATCH /bugs/{id}/status?status=FIXED : Change l'état d'un bug
 */
export async function updateBugStatus(bugId: number, status: string) {
  const response = await api.patch(`/bugs/${bugId}/status`, null, { params: { status } })
  return response.data
}