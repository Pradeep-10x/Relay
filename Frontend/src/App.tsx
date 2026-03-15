import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar, AppShell } from '@/components/layout/Topbar'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { WorkspaceDashboard } from '@/pages/WorkspaceDashboard'
import { KanbanBoardPage } from '@/pages/KanbanBoardPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { JoinWorkspacePage } from '@/pages/JoinWorkspacePage'
import { ROUTES } from '@/constants'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
})

function AppLayout() {
  return (
    <AppShell>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Routes>
          <Route index element={<WorkspaceDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path=":workspaceId/project/:projectId/board" element={<KanbanBoardPage />} />
          <Route path=":workspaceId/project/:projectId/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </AppShell>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Join workspace (needs auth) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/join/:inviteCode" element={<JoinWorkspacePage />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/workspace/*" element={<AppLayout />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={ROUTES.WORKSPACE} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.WORKSPACE} replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            fontSize: 13,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
