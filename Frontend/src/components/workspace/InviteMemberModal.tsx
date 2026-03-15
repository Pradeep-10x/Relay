import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { useGenerateInvite } from '@/hooks'
import { Spinner } from '@/components/ui'
import { copyToClipboard } from '@/utils'

export function InviteMemberModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const generateInvite = useGenerateInvite()
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    generateInvite.mutate(workspaceId, {
      onSuccess: (invite) => {
        const link = `${window.location.origin}/join/${invite.token}`
        setInviteLink(link)
      },
    })
  }

  const handleCopy = async () => {
    await copyToClipboard(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal w-full max-w-md mx-4" style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Invite Members</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Generate an invite link to share with your team. Links expire after 24 hours.
          </p>

          {!inviteLink ? (
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generateInvite.isPending}
            >
              {generateInvite.isPending ? <><Spinner size={13} /> Generating...</> : 'Generate Invite Link'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                className="input flex-1 text-xs font-mono"
                value={inviteLink}
                readOnly
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button className="btn btn-secondary btn-icon" onClick={handleCopy}>
                {copied ? <Check size={14} style={{ color: 'var(--status-done)' }} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
