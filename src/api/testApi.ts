import api from './axios'

export interface TestStep {
   id: number
   sessionId: number
   applicationId?: number
   applicationNom?: string
   version?: string
   environnement?: string
   fonction: string
   precondition?: string
   etapes?: string
   resultatAttendu?: string
   resultatObtenu?: string
   statut?: string
   commentaires?: string
   testNumber?: number
   dateCreation?: string
   createdBy?: number
   createdByUsername?: string
   executeur?: string
   resolved?: boolean
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
 * GET /tests : Liste tous les tests
 */
export async function fetchAllTests() {
  const response = await api.get<TestStep[]>('/tests')
  return response.data
}

/**
 * GET /tests/{id} : Récupère un test par ID
 */
export async function fetchTestById(id: number) {
  const response = await api.get<TestStep>(`/tests/${id}`)
  return response.data
}

/**
 * POST /tests : Créer un nouveau test
 */
export async function createTest(data: Partial<TestStep>) {
   const response = await api.post<TestStep>('/tests', data)
   return response.data
 }

/**
 * PUT /tests/{id} : Modifier un test existant
 */
export async function updateTest(id: number, data: Partial<TestStep>) {
  const response = await api.put<TestStep>(`/tests/${id}`, data)
  return response.data
}

/**
 * DELETE /tests/{id} : Supprimer un test
 */
export async function deleteTest(id: number) {
  await api.delete(`/tests/${id}`)
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
 * PUT /tests/{id}/resolved : Basculer le statut résolu d'un test
 */
export async function toggleTestResolved(id: number) {
  const response = await api.get<TestStep>(`/tests/${id}`)
  const currentResolved = (response.data as any).resolved ?? false
  return api.put<TestStep>(`/tests/${id}`, { resolved: !currentResolved })
}

/**
 * PATCH /bugs/{id}/status?status=FIXED : Change l'état d'un bug
 */
export async function updateBugStatus(bugId: number, status: string) {
  const response = await api.patch(`/bugs/${bugId}/status`, null, { params: { status } })
  return response.data
}