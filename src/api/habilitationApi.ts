import api from './axios'

export interface Habilitation {
  id: number
  compteId: number
  permission: string
}

/**
 * GET /habilitations : Liste toutes les habilitations
 */
export async function fetchHabilitations() {
  const response = await api.get<Habilitation[]>('/habilitations')
  return response.data
}

/**
 * POST /habilitations : Créer une nouvelle habilitation
 */
export async function createHabilitation(data: Habilitation) {
  const response = await api.post<Habilitation>('/habilitations', data)
  return response.data
}

/**
 * DELETE /habilitations/{id} : Supprimer une habilitation
 */
export async function deleteHabilitation(id: number) {
  await api.delete(`/habilitations/${id}`)
}