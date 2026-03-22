import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
})

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const idleTimer = useRef(null)

  const signOut = useCallback(async () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
    }
    await supabase.auth.signOut()
  }, [])

  // Idle session timeout — signs out after 30 minutes of inactivity
  useEffect(() => {
    if (!session) return

    const resetTimer = () => {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => signOut(), IDLE_TIMEOUT_MS)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resetTimer()
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)
    resetTimer()

    return () => {
      clearTimeout(idleTimer.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [session, signOut])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
