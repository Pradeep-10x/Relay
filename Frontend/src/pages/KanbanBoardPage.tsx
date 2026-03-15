import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, GripVertical } from 'lucide-react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanbanBoard, useUpdateIssueState, useCreateIssue } from '@/hooks'
import { useUIStore } from '@/store/uiStore'
import { Skeleton, EmptyState, Avatar, PriorityIcon } from '@/components/ui'
import { CreateIssueModal } from '@/components/issue/CreateIssueModal'
import { IssueDetailPanel } from '@/components/issue/IssueDetailPanel'
import { getStateDisplay, PRIORITY_CONFIG } from '@/constants'
import type { Issue, KanbanBoard } from '@/types'

export function KanbanBoardPage() {
  const { projectId = '' } = useParams()
  const { data: board, isLoading } = useKanbanBoard(projectId)
  const updateState = useUpdateIssueState(projectId)
  const { activeIssueId, openIssueDetail } = useUIStore()

  const [showCreate, setShowCreate] = useState(false)
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)

  // Build a stateId lookup from board keys
  // Each board key = state name, issues in that column have a stateId
  const stateNameToId = useMemo(() => {
    if (!board) return {} as Record<string, string>
    const map: Record<string, string> = {}
    Object.entries(board).forEach(([stateName, issues]) => {
      if (issues.length > 0) {
        map[stateName] = issues[0].stateId
      }
    })
    return map
  }, [board])

  // Find all issues flat for detail panel
  const allIssues = useMemo(() => {
    if (!board) return []
    return Object.values(board).flat()
  }, [board])

  const activeIssue = allIssues.find(i => i.id === activeIssueId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: any) => {
    const issueId = event.active.id as string
    const issue = allIssues.find(i => i.id === issueId)
    if (issue) setDraggedIssue(issue)
  }

  const handleDragEnd = (event: any) => {
    setDraggedIssue(null)
    const { active, over } = event
    if (!over || !board) return

    const issueId = active.id as string
    const targetColumnName = over.id as string

    // Find target stateId
    const targetStateId = stateNameToId[targetColumnName]
    if (!targetStateId) return

    // Find current issue
    const issue = allIssues.find(i => i.id === issueId)
    if (!issue || issue.stateId === targetStateId) return

    updateState.mutate({ issueId, targetStateId })
  }

  if (isLoading) {
    return (
      <div className="page-content kanban-board">
        {[1,2,3,4].map(i => (
          <div key={i} className="kanban-column">
            <div className="kanban-column-header"><Skeleton width={80} height={14} /></div>
            <div className="kanban-cards">
              {[1,2,3].map(j => <Skeleton key={j} height={72} />)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!board || Object.keys(board).length === 0) {
    return (
      <div className="page-content">
        <EmptyState
          title="No board data"
          description="Create your first issue to see the board."
          action={
            <button className="btn btn-primary btn-sm mt-2" onClick={() => setShowCreate(true)}>
              <Plus size={13} /> Create Issue
            </button>
          }
        />
        {showCreate && <CreateIssueModal projectId={projectId} onClose={() => setShowCreate(false)} />}
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Board</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={13} /> New Issue
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {Object.entries(board).map(([stateName, issues]) => {
            const display = getStateDisplay(stateName)
            return (
              <KanbanColumn
                key={stateName}
                id={stateName}
                name={display.label}
                icon={display.icon}
                color={display.color}
                issues={issues}
                count={issues.length}
                onIssueClick={openIssueDetail}
              />
            )
          })}
        </div>

        <DragOverlay>
          {draggedIssue && <IssueCard issue={draggedIssue} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {showCreate && <CreateIssueModal projectId={projectId} onClose={() => setShowCreate(false)} />}
      {activeIssue && <IssueDetailPanel issue={activeIssue} />}
    </div>
  )
}

// ── Kanban Column ───────────────────────────────────
function KanbanColumn({
  id, name, icon, color, issues, count, onIssueClick,
}: {
  id: string
  name: string
  icon: string
  color: string
  issues: Issue[]
  count: number
  onIssueClick: (id: string) => void
}) {
  const { setNodeRef } = useSortable({ id, data: { type: 'column' } })

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
          <span
            className="text-xs px-1.5 rounded-full"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontSize: 10 }}
          >
            {count}
          </span>
        </div>
      </div>
      <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-cards">
          {issues.map(issue => (
            <SortableIssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue.id)} />
          ))}
          {issues.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No issues</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Sortable Issue Card ─────────────────────────────
function SortableIssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <IssueCard issue={issue} onClick={onClick} dragListeners={listeners} />
    </div>
  )
}

// ── Issue Card ──────────────────────────────────────
function IssueCard({
  issue,
  isDragging,
  onClick,
  dragListeners,
}: {
  issue: Issue
  isDragging?: boolean
  onClick?: () => void
  dragListeners?: any
}) {
  return (
    <div
      className={`issue-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>
          {issue.title}
        </p>
        <div {...dragListeners} style={{ cursor: 'grab', padding: 2 }}>
          <GripVertical size={12} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
            {issue.key}
          </span>
          <PriorityIcon priority={issue.priority} />
        </div>
        {issue.assignee && (
          <Avatar user={issue.assignee} size="sm" />
        )}
      </div>
    </div>
  )
}
