import { useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard, KanbanSquare, BarChart3, Pencil,
  Settings, Bell, ChevronDown, ChevronRight, Plus,
  LogOut, Hash, Layers,
} from 'lucide-react'
import { useProjects, useWorkspaces, useLogout } from '@/hooks'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui'
import { ROUTES } from '@/constants'

export function Sidebar() {
  const { sidebarCollapsed, activeWorkspaceId, setActiveWorkspaceId } = useUIStore()
  const { user } = useAuthStore()
  const { data: workspaces = [] } = useWorkspaces()
  const wsId = activeWorkspaceId || workspaces[0]?.id || ''
  const { data: projects = [] } = useProjects(wsId)
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [wsDropdown, setWsDropdown] = useState(false)

  // Auto-set first workspace
  if (workspaces.length > 0 && !activeWorkspaceId) {
    setActiveWorkspaceId(workspaces[0].id)
  }

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const currentWorkspace = workspaces.find(w => w.id === wsId)

  if (sidebarCollapsed) {
    return (
      <div className="sidebar collapsed" style={{ padding: '12px 0', gap: 4, alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
          R
        </div>
      </div>
    )
  }

  return (
    <div className="sidebar">
      {/* ── Workspace selector ── */}
      <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
        <div className="relative">
          <button
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
            onClick={() => setWsDropdown(v => !v)}
            style={{ textAlign: 'left' }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
              {currentWorkspace?.name?.[0]?.toUpperCase() || 'R'}
            </div>
            <span className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
              {currentWorkspace?.name || 'Relay'}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {wsDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setWsDropdown(false)} />
              <div className="dropdown absolute left-0 top-full mt-1 z-20 w-full">
                {workspaces.map(ws => (
                  <div
                    key={ws.id}
                    className="dropdown-item"
                    onClick={() => { setActiveWorkspaceId(ws.id); setWsDropdown(false); navigate(ROUTES.WORKSPACE) }}
                    style={ws.id === wsId ? { background: 'var(--accent-subtle)', color: 'var(--accent-primary)' } : {}}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 9, flexShrink: 0 }}>
                      {ws.name[0]?.toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav style={{ padding: '4px 8px', flex: 1, overflowY: 'auto' }}>
        <NavLink to={ROUTES.WORKSPACE} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={15} className="nav-icon" />
          Dashboard
        </NavLink>

        <NavLink to={ROUTES.NOTIFICATIONS} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={15} className="nav-icon" />
          Notifications
        </NavLink>

        <NavLink to={ROUTES.SETTINGS} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={15} className="nav-icon" />
          Settings
        </NavLink>

        {/* ── Projects ── */}
        <div style={{ marginTop: 16, marginBottom: 4 }}>
          <p className="text-xs font-medium px-2 mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Projects
          </p>
        </div>

        {projects.map(project => {
          const expanded = expandedProjects.has(project.id)
          const basePath = `/workspace/${wsId}/project/${project.id}`

          return (
            <div key={project.id}>
              <div
                className="nav-item"
                onClick={() => toggleProject(project.id)}
                style={{ cursor: 'pointer' }}
              >
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <Hash size={13} style={{ color: 'var(--accent-primary)' }} />
                <span className="truncate flex-1">{project.name}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>{project.key}</span>
              </div>

              {expanded && (
                <div style={{ paddingLeft: 24 }}>
                  <NavLink to={`${basePath}/board`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ fontSize: 12 }}>
                    <KanbanSquare size={13} />
                    Board
                  </NavLink>
                  <NavLink to={`${basePath}/analytics`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ fontSize: 12 }}>
                    <BarChart3 size={13} />
                    Analytics
                  </NavLink>
                </div>
              )}
            </div>
          )
        })}

        {projects.length === 0 && (
          <p className="text-xs px-2 py-2" style={{ color: 'var(--text-tertiary)' }}>
            No projects yet
          </p>
        )}
      </nav>

      {/* ── User footer ── */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>{user?.email}</p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => logout.mutate()} title="Log out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
