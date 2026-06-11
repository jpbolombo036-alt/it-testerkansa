export interface User {
  id: number
  username: string
  email: string
  role?: string
  isActive?: boolean
  profilePhoto?: string
  lastPhoneVersion?: string
  createdAt?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}
