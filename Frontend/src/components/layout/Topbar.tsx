import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { Kbd } from '@/components/ui'

export function Topbar() {
  const { toggleSidebar } = useUIStore()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <div className="topbar">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={toggleSidebar}>
          <Menu size={16} />
        </button>

        <div className="flex-1" />

        <button
          className="btn btn-secondary btn-sm flex items-center gap-2"
          onClick={() => setSearchOpen(true)}
          style={{ minWidth: 180 }}
        >
          <Search size={13} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ color: 'var(--text-tertiary)', flex: 1, textAlign: 'left' }}>Search…</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="modal w-full max-w-xl mx-4"
            style={{ padding: 0, marginTop: '15vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm"
                placeholder="Search issues, projects…"
                autoFocus
                style={{ color: 'var(--text-primary)' }}
              />
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSearchOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Start typing to search across your workspace
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      {children}
    </div>
  )
}
