import { Bell, CheckCheck, Circle } from 'lucide-react'
import { useNotifications, useMarkNotificationRead } from '@/hooks'
import { Skeleton, EmptyState } from '@/components/ui'
import { formatRelative } from '@/utils'

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()

  if (isLoading) {
    return (
      <div className="page-content p-6 flex flex-col gap-3">
        <Skeleton height={28} width={200} />
        {[1,2,3].map(i => <Skeleton key={i} height={68} />)}
      </div>
    )
  }

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="page-content">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h2>
          {unread.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {unread.length} unread
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title="No notifications"
            description="You're all caught up! Notifications will appear here when you get mentioned or assigned."
          />
        ) : (
          <div className="flex flex-col gap-1">
            {/* Unread */}
            {unread.length > 0 && (
              <>
                <p className="text-xs font-medium mb-2 px-1" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  New
                </p>
                {unread.map(n => (
                  <NotificationItem key={n.id} notification={n} onRead={() => markRead.mutate(n.id)} />
                ))}
              </>
            )}

            {/* Read */}
            {read.length > 0 && (
              <>
                <p className="text-xs font-medium mb-2 mt-4 px-1" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Earlier
                </p>
                {read.map(n => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: any
  onRead?: () => void
}) {
  const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    MENTION: { label: 'Mentioned you', icon: <span>@</span>, color: '#06a6f0' },
    ISSUE_ASSIGNED: { label: 'Assigned to you', icon: <Circle size={10} />, color: '#8b5cf6' },
  }

  const cfg = typeLabels[notification.type] || { label: notification.type, icon: <Bell size={10} />, color: 'var(--text-tertiary)' }

  return (
    <div
      className="card flex items-start gap-3 p-3 cursor-pointer"
      style={{
        background: notification.read ? 'var(--bg-primary)' : 'var(--accent-subtle)',
        borderColor: notification.read ? 'var(--border-subtle)' : 'var(--accent-primary)',
        transition: 'all 0.15s',
      }}
      onClick={onRead}
    >
      <div
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${cfg.color}15`, color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 12, fontWeight: 600,
        }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {cfg.label}
          </p>
          {!notification.read && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
          )}
        </div>
        {notification.issue && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
            {notification.issue.title}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
          {formatRelative(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <button className="btn btn-ghost btn-icon btn-sm flex-shrink-0" onClick={e => { e.stopPropagation(); onRead?.() }}>
          <CheckCheck size={13} />
        </button>
      )}
    </div>
  )
}
