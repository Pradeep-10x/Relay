import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateProject } from '@/hooks'
import { Spinner } from '@/components/ui'

export function CreateProjectModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const createProject = useCreateProject()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createProject.mutate({ workspaceId, name }, { onSuccess: onClose })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal w-full max-w-md mx-4" style={{ padding: 0 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Create Project</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Project Name
              </label>
              <input
                className="input"
                placeholder="e.g. Mobile App"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                A project key will be auto-generated from the name.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createProject.isPending || !name.trim()}>
              {createProject.isPending ? <><Spinner size={13} /> Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
