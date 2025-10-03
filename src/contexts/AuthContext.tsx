import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, signIn as supaSignIn, signUp as supaSignUp, upsertProfile } from '@/lib/supabase'

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

  // Initialize from current session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(data.session?.user ?? null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supaSignUp(email, password, userData)
    if (!error && data.user) {
      setUser(data.user)
      // create profile row for the new user (may not have session if email confirmation required)
      await upsertProfile({
        id: data.user.id,
        email: data.user.email,
        first_name: userData?.first_name ?? null,
        last_name: userData?.last_name ?? null,
        phone: userData?.phone ?? null,
        business_name: userData?.business_name ?? null,
        preferred_language: userData?.preferred_language ?? null,
        avatar_url: userData?.avatar_url ?? null
      })
    }
    return { data, error: error as AuthError | null }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supaSignIn(email, password)
    if (!error && data.user) {
      setUser(data.user)
      // ensure a profile row exists/updates on login
      await upsertProfile({
        id: data.user.id,
        email: data.user.email
      })
    }
    return { data, error: error as AuthError | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
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