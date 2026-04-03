import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState('sign_in') // 'sign_in' | 'sign_up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'sign_up' && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (mode === 'sign_up') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #E5E7EB',
    fontSize: 15,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
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
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <img src="/favicon.png" alt="OSVitae Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h1 style={{
          fontSize: 24, fontWeight: 800, color: '#111',
          margin: '0 0 6px', letterSpacing: -0.5,
        }}>
          OSVitae
        </h1>
        <p style={{
          fontSize: 14, color: '#6B7280', margin: '0 0 28px',
          lineHeight: 1.5,
        }}>
          Tasks, Habits, Focus &amp; Everything In Between
        </p>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
          {mode === 'sign_up' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          )}

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>
          )}
          {message && (
            <p style={{ color: '#10B981', fontSize: 13, margin: 0 }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "'Inter', -apple-system, sans-serif",
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1' }}
          >
            {loading ? 'Please wait...' : mode === 'sign_up' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
          {mode === 'sign_in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in'); setError(''); setMessage('') }}
            style={{
              background: 'none', border: 'none', color: '#6366f1',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0,
            }}
          >
            {mode === 'sign_in' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {mode === 'sign_in' && (
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
            <button
              onClick={async () => {
                setError(''); setMessage('');
                if (!email) { setError('Enter your email above first'); return; }
                setLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                if (error) { setError(error.message); } else { setMessage('Password reset link sent! Check your inbox.'); }
                setLoading(false);
              }}
              style={{
                background: 'none', border: 'none', color: '#6366f1',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0,
              }}
            >
              Forgot password?
            </button>
          </p>
        )}

        <p style={{
          fontSize: 11, color: '#9CA3AF', marginTop: 24,
          lineHeight: 1.5,
        }}>
          Your data is encrypted and stored securely.
          <br />
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{
            color: '#6366f1', fontSize: 11, textDecoration: 'underline', marginTop: 4, display: 'inline-block',
          }}>Privacy Policy</a>
        </p>
      </div>

    </div>
  )
}
