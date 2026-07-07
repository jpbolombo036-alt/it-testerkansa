import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { User, fetchMe, updateProfile, changePassword } from '../api/userApi'
export type { User } // Ré-export pour la compatibilité

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: { username?: string; email?: string }) => Promise<User>
  changePassword: (data: { oldPassword: string; newPassword: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const data = await fetchMe()
          setUser(data)
          setIsAuthenticated(true)
        } catch (err) {
          console.error("Auth: Session validation failed, logging out...", err);
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setIsChecking(false)
    }
    checkSession()

    const handleSessionExpired = () => {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('session-expired', handleSessionExpired as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('session-expired', handleSessionExpired as EventListener)
      }
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<{ accessToken: string }>('/auth/token', { username, password })

    if (!response.data?.accessToken) {
      throw new Error("Authentification échouée : Aucun token reçu.");
    }

    const { accessToken: token } = response.data

    localStorage.setItem('token', token)

    const userResponse = await api.get<User>('/users/me')
    const userData = userResponse.data

    if (!userData) {
      throw new Error("Données utilisateur manquantes dans la réponse API.");
    }

    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const refreshUser = useCallback(async () => {
    const data = await fetchMe()
    setUser(data)
  }, [])

  const updateUserProfile = useCallback(async (data: { username?: string; email?: string }) => {
    const updated = await updateProfile(data)
    setUser(updated)
    return updated
  }, [])

  const updateUserPassword = useCallback(async (data: { oldPassword: string; newPassword: string }) => {
    await changePassword(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  if (isChecking && localStorage.getItem('token')) {
    return <div className="flex h-screen items-center justify-center bg-slate-950" />
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshUser, updateProfile: updateUserProfile, changePassword: updateUserPassword }}>
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