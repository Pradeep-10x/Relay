import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, Plus, Link2, LogOut,
  Users, ChevronRight, Sparkles,
} from 'lucide-react'
import { useWorkspaces, useLogout, useJoinWorkspace, useCreateWorkspace } from '@/hooks'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar, Spinner, Skeleton } from '@/components/ui'
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal'
import toast from 'react-hot-toast'

export function OnboardingPage() {
  const { user } = useAuthStore()
  const { setActiveWorkspaceId } = useUIStore()
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const logout = useLogout()
  const joinWorkspace = useJoinWorkspace()
  const navigate = useNavigate()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinLink, setJoinLink] = useState('')
  const [showJoinInput, setShowJoinInput] = useState(false)

  const handleSelectWorkspace = (wsId: string) => {
    setActiveWorkspaceId(wsId)
    navigate('/workspace')
  }

  const handleJoin = () => {
    if (!joinLink.trim()) return
    // Extract the invite code from a full URL or just use the raw code
    let code = joinLink.trim()
    const match = code.match(/\/join\/([a-zA-Z0-9]+)/)
    if (match) code = match[1]
    joinWorkspace.mutate(code)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #0b0f19 0%, #0d1321 40%, #111827 100%)',
      }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #2fbeff 0%, #06a6f0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(47,190,255,0.25)',
          }}>
            <Layers size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#e6edf3', letterSpacing: '-0.02em' }}>
            Relay
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar user={user} size="sm" />
            <span className="text-xs font-medium" style={{ color: '#8b949e' }}>{user?.name}</span>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => logout.mutate()}
            title="Sign out"
            style={{ color: '#484f58' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: '#e6edf3', letterSpacing: '-0.025em' }}
            >
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm" style={{ color: '#6e7681' }}>
              Select a workspace to continue, or create a new one.
            </p>
          </div>

          {/* ── Workspace list ── */}
          <div
            className="rounded-xl overflow-hidden mb-4"
            style={{
              background: '#161b22',
              border: '1px solid #21262d',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid #21262d' }}
            >
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: '#8b949e' }} />
                <span className="text-xs font-semibold" style={{ color: '#c9d1d9', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your Workspaces
                </span>
              </div>
              <span className="text-xs" style={{ color: '#484f58' }}>
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* List */}
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {isLoading ? (
                <div className="p-4 flex flex-col gap-3">
                  {[1, 2].map(i => <Skeleton key={i} height={56} />)}
                </div>
              ) : workspaces.length === 0 ? (
                <div className="p-8 text-center">
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: '#1c2333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Sparkles size={20} style={{ color: '#484f58' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#8b949e' }}>
                    No workspaces yet
                  </p>
                  <p className="text-xs" style={{ color: '#484f58' }}>
                    Create your first workspace or join one with an invite link.
                  </p>
                </div>
              ) : (
                workspaces.map((ws, idx) => (
                  <div
                    key={ws.id}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer group"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    style={{
                      borderBottom: idx < workspaces.length - 1 ? '1px solid #21262d' : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c2333')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Workspace icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `linear-gradient(135deg, ${['#2fbeff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][idx % 5]} 0%, ${['#06a6f0', '#7c3aed', '#059669', '#d97706', '#dc2626'][idx % 5]} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {ws.name[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e6edf3' }}>
                        {ws.name}
                      </p>
                      <p className="text-xs" style={{ color: '#484f58' }}>
                        {ws.members?.[0]?.role || 'Member'}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={16}
                      style={{ color: '#484f58', transition: 'color 0.15s' }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'linear-gradient(135deg, #2fbeff 0%, #06a6f0 100%)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
                boxShadow: '0 4px 16px rgba(47,190,255,0.2)',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={15} />
              Create Workspace
            </button>

            <button
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium"
              onClick={() => setShowJoinInput(v => !v)}
              style={{
                background: '#1c2333',
                color: '#8b949e',
                border: '1px solid #21262d',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#30363d')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262d')}
            >
              <Link2 size={15} />
              Join
            </button>
          </div>

          {/* ── Join input ── */}
          {showJoinInput && (
            <div
              className="mt-3 rounded-lg p-4 flex gap-2"
              style={{
                background: '#161b22',
                border: '1px solid #21262d',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <input
                className="flex-1 text-sm rounded-md px-3 py-2"
                placeholder="Paste invite link or code…"
                value={joinLink}
                onChange={e => setJoinLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                autoFocus
                style={{
                  background: '#0d1117',
                  border: '1px solid #21262d',
                  color: '#e6edf3',
                  outline: 'none',
                }}
              />
              <button
                className="px-4 py-2 rounded-md text-sm font-medium"
                onClick={handleJoin}
                disabled={joinWorkspace.isPending || !joinLink.trim()}
                style={{
                  background: '#238636',
                  color: '#fff',
                  border: 'none',
                  cursor: joinLink.trim() ? 'pointer' : 'not-allowed',
                  opacity: joinLink.trim() ? 1 : 0.5,
                }}
              >
                {joinWorkspace.isPending ? <Spinner size={14} /> : 'Join'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: '#21262d' }}>
          Relay — Project Management
        </p>
      </div>

      {showCreateModal && <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
