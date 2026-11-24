import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/presentation/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to={`/entrar?retorno=${encodeURIComponent(location.pathname + location.search)}`} replace />
}
