import { useParams } from 'react-router-dom'
import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { useProjectAnalytics } from '@/hooks'
import { Skeleton, ProgressBar, EmptyState } from '@/components/ui'
import { getStateDisplay } from '@/constants'

export function AnalyticsPage() {
  const { projectId = '' } = useParams()
  const { data: analytics, isLoading } = useProjectAnalytics(projectId)

  if (isLoading) {
    return (
      <div className="page-content p-6 flex flex-col gap-4">
        <Skeleton height={28} width={200} />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} height={100} />)}
        </div>
        <Skeleton height={200} />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="page-content">
        <EmptyState
          icon={<BarChart3 />}
          title="No analytics data"
          description="Create some issues to see project analytics."
        />
      </div>
    )
  }

  const completionPct = Math.round(analytics.completionRate * 100)

  return (
    <div className="page-content">
      <div className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Project Analytics
        </h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <KpiCard
            icon={<BarChart3 size={16} />}
            label="Total Issues"
            value={analytics.totalIssues}
            color="#06a6f0"
          />
          <KpiCard
            icon={<CheckCircle2 size={16} />}
            label="Completed"
            value={analytics.completedIssues}
            color="#10b981"
          />
          <KpiCard
            icon={<TrendingUp size={16} />}
            label="Completion Rate"
            value={`${completionPct}%`}
            color="#f59e0b"
          />
        </div>

        {/* Completion progress */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Overall Progress</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>{completionPct}%</p>
          </div>
          <ProgressBar value={analytics.completedIssues} max={analytics.totalIssues} />
        </div>

        {/* Issues per state */}
        <div className="card p-4 mb-6">
          <h3 className="text-xs font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Issues per State
          </h3>
          <div className="flex flex-col gap-2.5">
            {analytics.issuesPerState.map(item => {
              // stateId here — we'll show the ID or resolve it
              const pct = analytics.totalIssues > 0 ? Math.round((item._count / analytics.totalIssues) * 100) : 0
              return (
                <div key={item.stateId} className="flex items-center gap-3">
                  <span className="text-xs w-24 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.stateId.slice(0, 8)}...
                  </span>
                  <div className="flex-1">
                    <div
                      style={{
                        height: 6,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-primary)',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)', minWidth: 32, textAlign: 'right' }}>
                    {item._count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks per user */}
        {analytics.tasksPerUser.length > 0 && (
          <div className="card p-4">
            <h3 className="text-xs font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tasks per Assignee
            </h3>
            <div className="flex flex-col gap-2.5">
              {analytics.tasksPerUser.map(item => (
                <div key={item.assigneeId} className="flex items-center gap-3">
                  <span className="text-xs w-24 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.assigneeId.slice(0, 8)}...
                  </span>
                  <div className="flex-1">
                    <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--border-subtle)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.round((item._count / analytics.totalIssues) * 100)}%`,
                          borderRadius: 'var(--radius-full)',
                          background: '#8b5cf6',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)', minWidth: 32, textAlign: 'right' }}>
                    {item._count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `${color}15`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}
