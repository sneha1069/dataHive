import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute(props) {
  const auth = useAuth()

  if (!auth.ready) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return props.children
}