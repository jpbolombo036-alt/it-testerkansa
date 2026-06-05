export interface User {
  id: string
  name: string
  email: string
  role?: string
  agency?: string
  site?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
