import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

interface AuthError {
  message: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('vachak_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('vachak_user')
      }
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      // Simulate user creation
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: userData?.name || email.split('@')[0],
        avatar: userData?.avatar
      }
      
      setUser(newUser)
      localStorage.setItem('vachak_user', JSON.stringify(newUser))
      
      return { data: { user: newUser }, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: { message: 'Failed to create account' } as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, accept any email/password combination
      // In a real app, you'd validate credentials
      const loginUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0]
      }
      
      setUser(loginUser)
      localStorage.setItem('vachak_user', JSON.stringify(loginUser))
      
      return { data: { user: loginUser }, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: { message: 'Invalid credentials' } as AuthError }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('vachak_user')
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}