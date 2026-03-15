import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { PRIORITY_CONFIG } from '@/constants'

export function IssueFiltersBar({
  onFiltersChange,
}: {
  projectId: string
  onFiltersChange?: (filters: { priority: string[]; search: string }) => void
}) {
  const [priority, setPriority] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
    setArr(next)
    onFiltersChange?.({ priority: next, search })
  }

  const hasFilters = priority.length > 0 || search.length > 0

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 flex-wrap"
      style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}
    >
      {/* Priority filter */}
      <FilterGroup
        label="Priority"
        options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label, color: v.color }))}
        selected={priority}
        onToggle={v => toggle(priority, setPriority, v)}
      />

      {/* Search */}
      <input
        className="input btn-sm"
        placeholder="Search issues..."
        value={search}
        onChange={e => { setSearch(e.target.value); onFiltersChange?.({ priority, search: e.target.value }) }}
        style={{ maxWidth: 200, padding: '4px 8px', fontSize: 12 }}
      />

      {hasFilters && (
        <button
          className="btn btn-ghost btn-sm ml-auto"
          style={{ color: 'var(--text-tertiary)' }}
          onClick={() => { setPriority([]); setSearch(''); onFiltersChange?.({ priority: [], search: '' }) }}
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  )
}

function FilterGroup({
  label, options, selected, onToggle
}: {
  label: string
  options: { value: string; label: string; color: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="btn btn-secondary btn-sm gap-1"
        onClick={() => setOpen(v => !v)}
        style={selected.length > 0 ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' } : {}}
      >
        {label}
        {selected.length > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-white"
            style={{ background: 'var(--accent-primary)', fontSize: 10 }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="dropdown absolute left-0 top-full mt-1 z-20">
            {options.map(o => (
              <div
                key={o.value}
                className="dropdown-item"
                onClick={() => onToggle(o.value)}
              >
                <span
                  className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: selected.includes(o.value) ? 'var(--accent-primary)' : 'var(--border-default)',
                    background: selected.includes(o.value) ? 'var(--accent-primary)' : 'transparent',
                  }}
                >
                  {selected.includes(o.value) && <span className="text-white text-xs">✓</span>}
                </span>
                <span style={{ color: o.color }}>●</span>
                <span>{o.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
