import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile helpers
export type Profile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  business_name: string | null
  preferred_language: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export const upsertProfile = async (params: {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  business_name?: string | null
  preferred_language?: string | null
  avatar_url?: string | null
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(params, { onConflict: 'id' })
    .select()
    .single()
  return { data: data as Profile | null, error }
}

export const getProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  return { data: data as Profile | null, error }
}