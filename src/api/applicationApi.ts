import api from './axios'

export interface Application {
  id: number
  nom: string
  description: string
  version: string
  environnement: string
  dateCreation: string
}

export type ApplicationCreateData = Omit<Application, 'id' | 'dateCreation'>

/**
 * GET /applications : Liste toutes les applications
 */
export async function fetchApplications() {
   const response = await api.get<{ content: Application[] }>('/applications')
   return response.data.content || response.data
 }

/**
 * POST /applications : Créer une nouvelle application
 */
export async function createApplication(data: ApplicationCreateData) {
  const response = await api.post<Application>('/applications', data)
  return response.data
}

/**
 * PUT /applications/{id} : Modifier une application
 */
export async function updateApplication(id: number, data: ApplicationCreateData) {
  const response = await api.put<Application>(`/applications/${id}`, data)
  return response.data
}

/**
 * DELETE /applications/{id} : Supprimer une application
 */
export async function deleteApplication(id: number) {
  await api.delete(`/applications/${id}`)
}

/**
 * GET /applications/{id} : Récupère une application par ID
 */
export async function fetchApplicationById(id: number) {
  const response = await api.get<Application>(`/applications/${id}`)
  return response.data
}