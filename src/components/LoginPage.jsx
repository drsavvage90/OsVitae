import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'
import { Zap } from 'lucide-react'
import PrivacyPolicy from './PrivacyPolicy'

export default function LoginPage() {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) logger.error('Sign in error:', error.message)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        width: 380,
        maxWidth: '90vw',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #5B8DEF, #A78BFA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Zap size={28} color="#fff" />
        </div>

        <h1 style={{
          fontSize: 24, fontWeight: 800, color: '#111',
          margin: '0 0 6px', letterSpacing: -0.5,
        }}>
          OSVitae
        </h1>
        <p style={{
          fontSize: 14, color: '#6B7280', margin: '0 0 36px',
          lineHeight: 1.5,
        }}>
          Tasks, Habits, Focus &amp; Everything In Between
        </p>

        <button
          onClick={signInWithApple}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#000',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'Inter', -apple-system, sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.21 9.48c-.02-1.89 1.55-2.8 1.62-2.84-.88-1.29-2.25-1.47-2.74-1.49-1.16-.12-2.28.69-2.87.69-.6 0-1.51-.67-2.49-.65-1.27.02-2.46.75-3.11 1.9-1.34 2.32-.34 5.74.95 7.62.64.92 1.4 1.95 2.39 1.91.97-.04 1.33-.62 2.49-.62 1.16 0 1.49.62 2.49.6 1.03-.02 1.69-.93 2.32-1.85.74-1.06 1.04-2.1 1.05-2.15-.02-.01-2.01-.77-2.1-3.12zM11.3 3.88c.52-.64.87-1.52.78-2.4-.75.03-1.68.51-2.22 1.14-.48.56-.91 1.47-.8 2.33.84.07 1.71-.43 2.24-1.07z" fill="white"/>
          </svg>
          Sign in with Apple
        </button>

        <p style={{
          fontSize: 11, color: '#9CA3AF', marginTop: 24,
          lineHeight: 1.5,
        }}>
          Your data is encrypted and stored securely.
          <br />
          <button onClick={() => setShowPrivacy(true)} style={{
            background: 'none', border: 'none', color: '#6366f1',
            cursor: 'pointer', fontSize: 11, textDecoration: 'underline', padding: 0, marginTop: 4,
          }}>Privacy Policy</button>
        </p>
      </div>

      {showPrivacy && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
        }} onClick={() => setShowPrivacy(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 560,
            width: '100%', maxHeight: '80vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <PrivacyPolicy />
            <button onClick={() => setShowPrivacy(false)} style={{
              marginTop: 20, padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#000', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
