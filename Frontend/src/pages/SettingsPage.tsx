import { useState } from 'react'
import { User, Lock, Users, Link2, Trash2 } from 'lucide-react'
import {
  useUpdateProfile, useChangePassword, useWorkspaceMembers,
  useRemoveWorkspaceMember, useAddWorkspaceMember,
} from '@/hooks'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar, Spinner, Divider, EmptyState } from '@/components/ui'
import { InviteMemberModal } from '@/components/workspace/InviteMemberModal'
import type { WorkspaceRole } from '@/types'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'password' | 'members'>('profile')
  const { activeWorkspaceId } = useUIStore()

  const tabs = [
    { key: 'profile', label: 'Profile', icon: <User size={14} /> },
    { key: 'password', label: 'Password', icon: <Lock size={14} /> },
    ...(activeWorkspaceId ? [{ key: 'members', label: 'Members', icon: <Users size={14} /> }] : []),
  ] as const

  return (
    <div className="page-content">
      <div className="p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className="btn btn-ghost btn-sm flex items-center gap-1.5"
              onClick={() => setTab(t.key as any)}
              style={{
                color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                borderRadius: 0,
                paddingBottom: 8,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ProfileTab />}
        {tab === 'password' && <PasswordTab />}
        {tab === 'members' && activeWorkspaceId && <MembersTab workspaceId={activeWorkspaceId} />}
      </div>
    </div>
  )
}

// ── Profile Tab ─────────────────────────────────────
function ProfileTab() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({ name: name || undefined, username: username || undefined })
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        <Avatar user={user} size="xl" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
        </div>
      </div>

      <Divider />

      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Username</label>
        <input className="input" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <><Spinner size={13} /> Saving...</> : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ── Password Tab ────────────────────────────────────
function PasswordTab() {
  const changePassword = useChangePassword()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    changePassword.mutate(
      { oldPassword: form.oldPassword, newPassword: form.newPassword },
      { onSuccess: () => setForm({ oldPassword: '', newPassword: '', confirm: '' }) }
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
        <input type="password" className="input" value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))} required />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>New Password</label>
        <input type="password" className="input" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
      </div>
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
        <input type="password" className="input" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={changePassword.isPending}>
          {changePassword.isPending ? <><Spinner size={13} /> Updating...</> : 'Change Password'}
        </button>
      </div>
    </form>
  )
}

// ── Members Tab ─────────────────────────────────────
function MembersTab({ workspaceId }: { workspaceId: string }) {
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId)
  const removeMember = useRemoveWorkspaceMember()
  const addMember = useAddWorkspaceMember()
  const { user } = useAuthStore()

  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('MEMBER')

  const currentMember = members.find(m => m.user.id === user?.id)
  const isOwnerOrAdmin = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN'

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    addMember.mutate({ workspaceId, email, role }, { onSuccess: () => setEmail('') })
  }

  return (
    <div>
      {/* Add member */}
      {isOwnerOrAdmin && (
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <form onSubmit={handleAddMember} className="flex gap-2 flex-1">
              <input
                className="input flex-1"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <select
                className="input"
                value={role}
                onChange={e => setRole(e.target.value as WorkspaceRole)}
                style={{ width: 'auto' }}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={addMember.isPending || !email.trim()}>
                Add
              </button>
            </form>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)}>
            <Link2 size={13} /> Generate Invite Link
          </button>
        </div>
      )}

      <Divider />

      {/* Member list */}
      {isLoading ? (
        <div className="flex flex-col gap-2 mt-4">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-1 mt-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-md" style={{ transition: 'background 0.1s' }}>
              <Avatar user={member.user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{member.user.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{member.user.email}</p>
              </div>
              <span
                className="badge text-xs"
                style={{
                  background: member.role === 'OWNER' ? '#f59e0b18' : member.role === 'ADMIN' ? '#8b5cf618' : 'var(--bg-tertiary)',
                  color: member.role === 'OWNER' ? '#f59e0b' : member.role === 'ADMIN' ? '#8b5cf6' : 'var(--text-tertiary)',
                }}
              >
                {member.role}
              </span>
              {isOwnerOrAdmin && member.user.id !== user?.id && (
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => removeMember.mutate({ workspaceId, memberId: member.userId })}
                  title="Remove member"
                >
                  <Trash2 size={13} style={{ color: '#ef4444' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showInvite && <InviteMemberModal workspaceId={workspaceId} onClose={() => setShowInvite(false)} />}
    </div>
  )
}
