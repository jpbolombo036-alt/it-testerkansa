import api from '../api/axios'

export async function login(username: string, password: string) {
  const response = await api.post<{ accessToken: string }>('/auth/token', { username, password })
  const token = response.data.accessToken
  
  const userResponse = await api.get('/users/me')
  return { token, user: userResponse.data }
}

export async function logout() {
  localStorage.removeItem('token')
}