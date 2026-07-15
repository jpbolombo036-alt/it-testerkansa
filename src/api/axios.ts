import axios from 'axios'
import { API_BASE_URL as API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type']
    if (contentType && String(contentType).includes('text/html')) {
      return Promise.reject(new Error("L'API a renvoyé du HTML. Vérifiez VITE_API_BASE_URL dans votre .env"))
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired'))
      }
    }
    return Promise.reject(error)
  }
)

export { API_URL as API_BASE_URL }
export default api
