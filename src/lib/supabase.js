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

/** Invoke an edge function after ensuring fresh auth */
export const invokeFunction = async (name, options = {}) => {
  // Refresh session so the client has a valid access token
  await supabase.auth.refreshSession()
  // Let the Supabase client attach its own auth + apikey headers
  return supabase.functions.invoke(name, options)
}
