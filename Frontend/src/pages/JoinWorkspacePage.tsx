import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { useJoinWorkspace } from '@/hooks'
import { ROUTES } from '@/constants'

export function JoinWorkspacePage() {
  const { inviteCode = '' } = useParams()
  const join = useJoinWorkspace()
  const navigate = useNavigate()

  useEffect(() => {
    if (inviteCode) {
      join.mutate(inviteCode)
    }
  }, [inviteCode])

  if (join.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #2fbeff 0%, #06a6f0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulseSoft 2s ease-in-out infinite',
            }}>
              <Layers size={20} color="#fff" />
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Joining workspace…</p>
        </div>
      </div>
    )
  }

  if (join.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-sm font-semibold mb-2" style={{ color: '#ef4444' }}>
            Failed to join workspace
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            {(join.error as any)?.response?.data?.message || 'The invite link may be invalid or expired.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate(ROUTES.WORKSPACE)}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
