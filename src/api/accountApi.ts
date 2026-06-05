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
 * DELETE /comptes/{id} : Supprime un compte
 */
export async function deleteAccount(id: number) {
  await api.delete(`/comptes/${id}`)
}

// Note: Si vous avez un endpoint de mise à jour, vous pourriez ajouter updateAccount ici.