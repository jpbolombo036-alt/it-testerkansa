import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

interface User {
  id: number
  email: string
  role: 'ADMIN' | 'USER'
  username: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  // Vérifie si l'utilisateur est toujours connecté au chargement de l'application
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await api.get('/users/me')
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (err) {
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setIsChecking(false)
    }
    checkSession()
  }, [])

  const login = async (username: string, password: string) => {
    // Appel API réel vers le backend
    const response = await api.post('/auth/token', { username, password })
    const { token, user: userData } = response.data
    
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  // Empêche l'affichage de l'app tant que la vérification du token n'est pas faite
  if (isChecking && localStorage.getItem('token')) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Vérification de la session...</div>
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}