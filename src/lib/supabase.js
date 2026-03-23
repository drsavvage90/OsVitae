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

/** Invoke an edge function with direct fetch to ensure proper auth */
export const invokeFunction = async (name, options = {}) => {
  // Get a fresh session
  const { data: refreshData } = await supabase.auth.refreshSession()
  let token = refreshData?.session?.access_token
  if (!token) {
    const { data: sessionData } = await supabase.auth.getSession()
    token = sessionData?.session?.access_token
  }
  if (!token) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const url = `${supabaseUrl}/functions/v1/${name}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(options.body || {}),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    return { data, error: new Error(data?.error || `Edge Function returned ${res.status}`) }
  }
  return { data, error: null }
}
