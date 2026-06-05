import api from './axios'
import { User } from '../types/user'

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

/**
 * Liste tous les utilisateurs (Admin uniquement)
 */
export async function fetchUsers() {
  const response = await api.get<User[]>('/users')
  return response.data
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
 * GET /users/available : Liste les utilisateurs pour démarrer une conversation
 */
export async function fetchAvailableUsers() {
  const response = await api.get<User[]>('/users/available')
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
export async function createUser(userData: Partial<User> & { password?: string }) {
  const response = await api.post<User>('/users', userData)
  return response.data
}
