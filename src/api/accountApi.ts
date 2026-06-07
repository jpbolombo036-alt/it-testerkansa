import api from './axios'

export interface Account {
  id: number
  applicationId: number
  username: string
  code: string
  role: string
  commentaire: string
}

export type AccountCreateData = Omit<Account, 'id'>

/**
 * GET /comptes : Liste tous les comptes
 */
export async function fetchAccounts() {
  const response = await api.get<Account[]>('/comptes')
  return response.data
}

/**
 * POST /comptes : Création d'un nouveau compte
 */
export async function createAccount(accountData: AccountCreateData) {
  const response = await api.post<Account>('/comptes', accountData)
  return response.data
}

/**
 * PUT /comptes/{id} : Mise à jour d'un compte existant
 */
export async function updateAccount(id: number, accountData: AccountCreateData) {
  const response = await api.put<Account>(`/comptes/${id}`, accountData)
  return response.data
}

/**
 * DELETE /comptes/{id} : Supprime un compte
 */
export async function deleteAccount(id: number) {
  await api.delete(`/comptes/${id}`)
}

/**
 * GET /comptes/{id} : Récupère un compte par ID
 */
export async function fetchAccountById(id: number) {
  const response = await api.get<Account>(`/comptes/${id}`)
  return response.data
}