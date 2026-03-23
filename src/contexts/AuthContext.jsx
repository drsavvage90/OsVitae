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

  const signOut = useCallback(async () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
    }
    await supabase.auth.signOut()
  }, [])

  // Idle session timeout — signs out after 30 minutes of *active* inactivity.
  // Uses lastActivity timestamp so backgrounded tabs don't falsely expire.
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    if (!session) return

    const markActive = () => {
      lastActivity.current = Date.now()
    }

    const checkIdle = () => {
      if (Date.now() - lastActivity.current >= IDLE_TIMEOUT_MS) {
        signOut()
      }
    }

    // On foreground, check if idle period elapsed while backgrounded
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkIdle()
        markActive()
      }
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, markActive, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)

    // Periodic check while tab is active (every 60s)
    const interval = setInterval(checkIdle, 60_000)

    return () => {
      clearInterval(interval)
      events.forEach(e => window.removeEventListener(e, markActive))
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
