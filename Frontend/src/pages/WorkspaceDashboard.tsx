import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers, Users, FolderKanban, ArrowRight } from 'lucide-react'
import { useWorkspaces, useProjects, useWorkspaceMembers } from '@/hooks'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Skeleton, EmptyState } from '@/components/ui'
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal'
import { CreateProjectModal } from '@/components/project/CreateProjectModal'

export function WorkspaceDashboard() {
  const { user } = useAuthStore()
  const { activeWorkspaceId, setActiveWorkspaceId } = useUIStore()
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces()
  const navigate = useNavigate()

  const wsId = activeWorkspaceId || workspaces[0]?.id || ''
  const currentWs = workspaces.find(w => w.id === wsId)

  const { data: projects = [], isLoading: projLoading } = useProjects(wsId)
  const { data: members = [] } = useWorkspaceMembers(wsId)

  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)

  // Auto-set first workspace
  if (workspaces.length > 0 && !activeWorkspaceId) {
    setActiveWorkspaceId(workspaces[0].id)
  }

  if (wsLoading) {
    return (
      <div className="page-content p-6 flex flex-col gap-4">
        <Skeleton height={28} width={200} />
        <Skeleton height={16} width={300} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[1,2,3].map(i => <Skeleton key={i} height={80} />)}
        </div>
      </div>
    )
  }

  // No workspaces — show creation
  if (workspaces.length === 0) {
    return (
      <div className="page-content flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #2fbeff 0%, #06a6f0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 32px rgba(47,190,255,0.2)',
          }}>
            <Layers size={22} color="#fff" />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Welcome to Relay
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)', maxWidth: 320, margin: '0 auto' }}>
            Create your first workspace to start managing projects and issues.
          </p>
          <button className="btn btn-primary" onClick={() => setShowCreateWs(true)}>
            <Plus size={14} /> Create Workspace
          </button>
        </div>
        {showCreateWs && <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />}
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-content">
      <div className="p-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {currentWs?.name} — {projects.length} project{projects.length !== 1 ? 's' : ''}, {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <StatCard icon={<FolderKanban size={16} />} label="Projects" value={projects.length} color="#06a6f0" />
          <StatCard icon={<Users size={16} />} label="Members" value={members.length} color="#8b5cf6" />
          <StatCard icon={<Layers size={16} />} label="Workspace" value={currentWs?.name || ''} color="#10b981" />
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Projects</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateProject(true)}>
            <Plus size={13} /> New Project
          </button>
        </div>

        {projLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} height={100} />)}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban />}
            title="No projects yet"
            description="Create your first project to start tracking issues."
            action={
              <button className="btn btn-primary btn-sm mt-2" onClick={() => setShowCreateProject(true)}>
                <Plus size={13} /> Create Project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map(project => (
              <div
                key={project.id}
                className="card p-4 cursor-pointer group"
                onClick={() => navigate(`/workspace/${wsId}/project/${project.id}/board`)}
                style={{ transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {project.key}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-tertiary)', opacity: 0, transition: 'opacity 0.15s' }} className="group-hover:opacity-100" />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {project.issueCounter} issue{project.issueCounter !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateWs && <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />}
      {showCreateProject && wsId && <CreateProjectModal workspaceId={wsId} onClose={() => setShowCreateProject(false)} />}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${color}15`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}
