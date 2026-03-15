import { useState, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { useComments, useCreateComment, useIssueActivity } from '@/hooks'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import {
  Avatar, StateBadge, PriorityIcon,
  Skeleton, Spinner, Divider,
} from '@/components/ui'
import { PRIORITY_CONFIG, getStateDisplay } from '@/constants'
import { formatDate, formatRelative, renderMentionContent } from '@/utils'
import type { Issue, IssuePriority } from '@/types'

interface Props {
  issue: Issue
  onUpdateIssue?: (data: any) => void
}

export function IssueDetailPanel({ issue, onUpdateIssue }: Props) {
  const closeDetail = useUIStore(s => s.closeIssueDetail)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={closeDetail} />
      <div className="right-panel z-50">
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {issue.key}
            </span>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={closeDetail}>
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {/* Title */}
            <h1 className="text-base font-semibold mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
              {issue.title}
            </h1>

            {/* Description */}
            {issue.description ? (
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {issue.description}
              </p>
            ) : (
              <p className="text-sm mb-4 italic" style={{ color: 'var(--text-tertiary)' }}>
                No description
              </p>
            )}

            <Divider />

            {/* ── Properties ── */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 my-4">
              <Property label="Priority">
                <div className="flex items-center gap-1.5">
                  <PriorityIcon priority={issue.priority} />
                  <span className="text-xs font-medium" style={{ color: PRIORITY_CONFIG[issue.priority]?.color }}>
                    {PRIORITY_CONFIG[issue.priority]?.label}
                  </span>
                </div>
              </Property>

              <Property label="Assignee">
                {issue.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar user={issue.assignee} size="sm" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{issue.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>
                )}
              </Property>

              <Property label="Reporter">
                {issue.reporter && (
                  <div className="flex items-center gap-1.5">
                    <Avatar user={issue.reporter} size="sm" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{issue.reporter.name}</span>
                  </div>
                )}
              </Property>

              <Property label="Created">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(issue.createdAt)}
                </span>
              </Property>

              <Property label="Updated">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatRelative(issue.updatedAt)}
                </span>
              </Property>
            </div>

            <Divider />

            {/* ── Comments + Activity ── */}
            <CommentSection issueId={issue.id} />
          </div>
        </div>
      </div>
    </>
  )
}

// ── Property row ──────────────────────────────────────────
function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      {children}
    </div>
  )
}

// ── Comment section ───────────────────────────────────────
function CommentSection({ issueId }: { issueId: string }) {
  const user = useAuthStore(s => s.user)
  const { data: comments = [], isLoading } = useComments(issueId)
  const { data: activities = [] } = useIssueActivity(issueId)
  const createComment = useCreateComment(issueId)

  const [text, setText] = useState('')
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!text.trim()) return
    createComment.mutate({ content: text }, {
      onSuccess: () => setText(''),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="mt-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4">
        {(['comments', 'activity'] as const).map(t => (
          <button
            key={t}
            className="btn btn-ghost btn-sm capitalize"
            onClick={() => setTab(t)}
            style={{
              color: tab === t ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
              borderRadius: 0,
              paddingBottom: 6,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'comments' && (
        <>
          {/* Comments list */}
          <div className="flex flex-col gap-4 mb-4">
            {isLoading && [1,2].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton width={28} height={28} className="rounded-full flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton width={120} height={12} />
                  <Skeleton height={36} />
                </div>
              </div>
            ))}

            {!isLoading && comments.map(comment => (
              <div key={comment.id} className="flex gap-2.5">
                <Avatar user={comment.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {comment.user.name}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatRelative(comment.createdAt)}
                    </span>
                    {comment.edited && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>(edited)</span>
                    )}
                  </div>
                  <div
                    className="text-sm leading-relaxed p-3 rounded-lg"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    dangerouslySetInnerHTML={{ __html: renderMentionContent(comment.content) }}
                  />
                </div>
              </div>
            ))}

            {!isLoading && comments.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>

          {/* Comment composer */}
          {user && (
            <div className="flex gap-2.5">
              <Avatar user={user} size="sm" />
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  className="input resize-none text-sm"
                  placeholder="Write a comment… (use @username to mention)"
                  rows={2}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ minHeight: 60 }}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    ⌘↵ to submit
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmit}
                    disabled={createComment.isPending || !text.trim()}
                  >
                    {createComment.isPending ? <Spinner size={12} /> : <Send size={12} />}
                    Comment
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'activity' && (
        <div className="flex flex-col gap-3">
          {activities.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
              No activity yet.
            </p>
          )}
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-2.5 items-start">
              <Avatar user={activity.user} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activity.user.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatRelative(activity.createdAt)}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Changed <strong>{activity.field}</strong>
                  {activity.fromValue && <> from <code style={{ fontSize: 11, padding: '0 3px', background: 'var(--bg-tertiary)', borderRadius: 3 }}>{activity.fromValue}</code></>}
                  {activity.toValue && <> to <code style={{ fontSize: 11, padding: '0 3px', background: 'var(--bg-tertiary)', borderRadius: 3 }}>{activity.toValue}</code></>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
