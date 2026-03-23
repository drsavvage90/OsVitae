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

/** Invoke an edge function with a fresh auth token */
export const invokeFunction = async (name, options = {}) => {
  // Force token refresh to avoid expired-token 401s
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error || !session) {
    // Fallback: try cached session
    const cached = await supabase.auth.getSession()
    const token = cached.data?.session?.access_token
    if (!token) throw new Error('Not authenticated')
    return supabase.functions.invoke(name, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    })
  }
  return supabase.functions.invoke(name, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${session.access_token}` },
  })
}
