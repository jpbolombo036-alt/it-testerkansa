import { createContext, ReactNode, useState } from 'react'
import { AuthContextType } from '../types/user'

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: () => Promise.resolve(),
  logout: () => {},
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(defaultAuthContext.user)

  const login = async (email: string, password: string) => {
    setUser({ id: '1', name: 'Utilisateur', email })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
