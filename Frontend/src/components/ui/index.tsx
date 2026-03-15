import { getInitials, getAvatarColor } from '@/utils'
import { PRIORITY_CONFIG, getStateDisplay } from '@/constants'
import type { User, IssuePriority } from '@/types'

// ── Spinner ─────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}

// ── Skeleton ────────────────────────────────────────────
export function Skeleton({ width, height, className = '' }: {
  width?: number | string
  height?: number | string
  className?: string
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width ?? '100%', height: height ?? 14 }}
    />
  )
}

// ── Avatar ──────────────────────────────────────────────
export function Avatar({ user, size = 'md' }: {
  user: Pick<User, 'name' | 'avatar'> | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const name = user?.name || '?'
  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`avatar avatar-${size}`}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ background: bgColor, color: '#fff', border: 'none' }}>
      {initials}
    </div>
  )
}

// ── Priority Icon ───────────────────────────────────────
export function PriorityIcon({ priority }: { priority: IssuePriority }) {
  const cfg = PRIORITY_CONFIG[priority]
  if (!cfg) return null
  return <span style={{ fontSize: 12 }}>{cfg.icon}</span>
}

// ── State Badge (dynamic) ───────────────────────────────
export function StateBadge({ stateName }: { stateName: string }) {
  const display = getStateDisplay(stateName)
  return (
    <span
      className="badge"
      style={{
        background: `${display.color}18`,
        color: display.color,
      }}
    >
      {display.icon} {display.label}
    </span>
  )
}

// ── LabelBadge ──────────────────────────────────────────
export function LabelBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color, fontSize: 10 }}
    >
      {name}
    </span>
  )
}

// ── ProgressBar ─────────────────────────────────────────
export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Divider ─────────────────────────────────────────────
export function Divider() {
  return <div className="divider" />
}

// ── EmptyState ──────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: 32, opacity: 0.5 }}>{icon}</div>}
      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>{title}</p>
      {description && <p style={{ fontSize: 13, maxWidth: 320 }}>{description}</p>}
      {action}
    </div>
  )
}

// ── Tooltip ─────────────────────────────────────────────
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group" style={{ display: 'inline-flex' }}>
      {children}
      <div
        className="tooltip"
        style={{
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 6,
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.15s',
        }}
      >
        {text}
      </div>
    </div>
  )
}

// ── Kbd ─────────────────────────────────────────────────
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 5px',
        borderRadius: 4,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-tertiary)',
        fontSize: 11,
        fontFamily: 'inherit',
        color: 'var(--text-tertiary)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </kbd>
  )
}
