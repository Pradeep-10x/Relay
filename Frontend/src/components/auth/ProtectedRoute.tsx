import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}

export function PublicRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.WORKSPACE} replace /> : <Outlet />
}
