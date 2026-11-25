import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/presentation/AuthContext'
import { loginPath } from '../features/auth/presentation/authNavigation'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <div className="page-container detail-skeleton skeleton" aria-label="Restaurando sessão" />
  return user ? children : <Navigate to={loginPath(location.pathname + location.search + location.hash)} replace />
}
