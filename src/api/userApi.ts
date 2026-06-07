import api from './axios'

export interface User {
  id: number
  email: string
  role: string
  username: string
  isActive: boolean
  profilePhoto?: string
  lastPhoneVersion?: string
  createdAt?: string
  password?: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

/**
 * GET /users : Liste tous les utilisateurs
 */
export async function fetchUsers() {
   const response = await api.get<{ content: User[] }>('/users')
   return response.data.content || response.data
 }

/**
 * GET /users/me : Récupère le profil de l'utilisateur connecté
 */
export async function fetchMe() {
  const response = await api.get<User>('/users/me')
  return response.data
}

/**
 * PUT /users/me : Met à jour son propre profil
 */
export async function updateProfile(data: Partial<User>) {
  const response = await api.put<User>('/users/me', data)
  return response.data
}

/**
 * PUT /users/me/password : Change le mot de passe
 */
export async function changePassword(passwordData: ChangePasswordData) {
  const response = await api.put('/users/me/password', passwordData)
  return response.data
}

/**
 * PATCH /users/{id}/toggle-status : Active/Désactive un compte (Admin)
 */
export async function toggleUserStatus(userId: number) {
  const response = await api.patch(`/users/${userId}/toggle-status`)
  return response.data
}

/**
 * DELETE /users/{id} : Supprime un utilisateur (Admin)
 */
export async function deleteUser(userId: number) {
  await api.delete(`/users/${userId}`)
}

/**
 * POST /users : Créer un nouvel utilisateur (Admin)
 */
export async function createUser(userData: { username: string; email: string; password?: string; role?: string; isActive?: boolean }) {
  const response = await api.post<User>('/users', userData)
  return response.data
}

/**
 * GET /users/available : Liste les utilisateurs disponibles pour la messagerie
 */
export async function fetchAvailableUsers() {
  const response = await api.get<User[]>('/users/available')
  return response.data
}