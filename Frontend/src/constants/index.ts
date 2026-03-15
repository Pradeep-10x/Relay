import type { IssuePriority } from '@/types'

// ── Workflow state display config (dynamic, but we provide defaults) ─
// These map backend WorkflowState.name → display props
export const STATE_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  OPEN:          { label: 'Open',        color: '#8b5cf6', icon: '○' },
  In_Progress:   { label: 'In Progress', color: '#06a6f0', icon: '◑' },
  Review:        { label: 'Review',      color: '#f59e0b', icon: '◕' },
  Done:          { label: 'Done',        color: '#10b981', icon: '●' },
  DONE:          { label: 'Done',        color: '#10b981', icon: '●' },
}

export function getStateDisplay(name: string) {
  return STATE_DISPLAY[name] ?? { label: name.replace(/_/g, ' '), color: '#64748b', icon: '○' }
}

// ── Priority config ──────────────────────────────────────
export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; icon: string }> = {
  HIGH:   { label: 'High',   color: '#ef4444', icon: '🔴' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', icon: '🟡' },
  LOW:    { label: 'Low',    color: '#10b981', icon: '🟢' },
}

// ── Routes ───────────────────────────────────────────────
export const ROUTES = {
  LOGIN:          '/login',
  REGISTER:       '/register',
  WORKSPACE:      '/workspace',
  SETTINGS:       '/settings',
  NOTIFICATIONS:  '/notifications',
  JOIN_WORKSPACE: '/join/:inviteCode',
  PROJECT:        (wId: string, pId: string) => `/workspace/${wId}/project/${pId}`,
  PROJECT_BOARD:  (wId: string, pId: string) => `/workspace/${wId}/project/${pId}/board`,
  PROJECT_ANALYTICS: (wId: string, pId: string) => `/workspace/${wId}/project/${pId}/analytics`,
  PROJECT_DRAWING:   (wId: string, pId: string) => `/workspace/${wId}/project/${pId}/drawing`,
} as const

// ── Query keys ──────────────────────────────────────────
export const QUERY_KEYS = {
  ME:            ['me'],
  WORKSPACES:    ['workspaces'],
  WORKSPACE:     (id: string) => ['workspace', id],
  PROJECTS:      (wId: string) => ['projects', wId],
  PROJECT:       (id: string) => ['project', id],
  KANBAN:        (pId: string) => ['kanban', pId],
  ISSUES:        (pId: string) => ['issues', pId],
  ISSUE:         (id: string) => ['issue', id],
  COMMENTS:      (issueId: string) => ['comments', issueId],
  ACTIVITY:      (issueId: string) => ['activity', issueId],
  NOTIFICATIONS: ['notifications'],
  ANALYTICS:     (pId: string) => ['analytics', pId],
  MEMBERS:       (wId: string) => ['members', wId],
  PROJECT_MEMBERS: (pId: string) => ['project-members', pId],
} as const
