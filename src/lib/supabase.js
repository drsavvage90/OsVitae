import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your project values.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    storageKey: 'osvitae-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/** Invoke an edge function with an explicit auth header to avoid 401s */
export const invokeFunction = async (name, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Not authenticated')
  return supabase.functions.invoke(name, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })
}
