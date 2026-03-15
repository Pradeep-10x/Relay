import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useCreateIssue } from '@/hooks'
import { Spinner } from '@/components/ui'
import { PRIORITY_CONFIG } from '@/constants'
import type { IssuePriority } from '@/types'

interface Props {
  projectId: string
  onClose: () => void
}

export function CreateIssueModal({ projectId, onClose }: Props) {
  const createIssue = useCreateIssue(projectId)
  const [form, setForm] = useState({
    title:       '',
    description: '',
    priority:    'MEDIUM' as IssuePriority,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createIssue.mutate(
      { title: form.title, description: form.description || undefined, priority: form.priority },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal w-full max-w-lg mx-4"
        style={{ padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Create Issue</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 flex flex-col gap-4">
            {/* Title */}
            <input
              className="input text-sm font-medium"
              placeholder="Issue title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
              required
              style={{ fontSize: 15, fontWeight: 500 }}
            />

            {/* Description */}
            <textarea
              className="input resize-none text-sm"
              placeholder="Add a description..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />

            {/* Priority */}
            <div className="flex flex-wrap gap-2">
              <PrioritySelect
                value={form.priority}
                onChange={v => setForm(f => ({ ...f, priority: v }))}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 px-5 py-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createIssue.isPending || !form.title.trim()}>
              {createIssue.isPending ? <><Spinner size={13} /> Creating...</> : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PrioritySelect({ value, onChange }: { value: IssuePriority; onChange: (v: IssuePriority) => void }) {
  const [open, setOpen] = useState(false)
  const current = PRIORITY_CONFIG[value]

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-secondary btn-sm flex items-center gap-1"
        onClick={() => setOpen(v => !v)}
      >
        <span>{current.icon}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{current.label}</span>
        <ChevronDown size={11} style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="dropdown absolute left-0 top-full mt-1 z-20">
            {(Object.entries(PRIORITY_CONFIG) as [IssuePriority, typeof current][]).map(([k, v]) => (
              <div
                key={k}
                className="dropdown-item"
                onClick={() => { onChange(k); setOpen(false) }}
              >
                <span>{v.icon}</span>
                <span style={{ color: v.color }}>{v.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
