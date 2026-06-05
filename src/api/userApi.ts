import api from './axios'
import { User } from '../types/user'

export async function fetchUsers() {
  const response = await api.get<User[]>('/users')
  return response.data
}
