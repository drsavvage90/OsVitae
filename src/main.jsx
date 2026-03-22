import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import LoginPage from './components/LoginPage'

function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F3F4F6',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#6B7280', fontSize: 14,
      }}>
        Loading...
      </div>
    )
  }

  return user ? <App /> : <LoginPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
