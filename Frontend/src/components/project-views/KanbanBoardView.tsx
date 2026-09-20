'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Inter } from 'next/font/google';
import {
    KanbanSquare, MoreHorizontal, Plus, Calendar, SlidersHorizontal,
    ArrowUpDown, ChevronDown, MessageSquare, Flag, Check,
    Circle, CircleDashed, CircleDot, CircleCheck, CircleSlash, Loader,
} from 'lucide-react';
import { useKanban } from '@/hooks/useKanban';
import { IssueSlideOver } from '@/components/IssueSlideOver';
import { CreateIssueModal } from '@/components/CreateIssueModal';

const inter = Inter({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

// ─────────────────────────────────────────────
// Column status themes (icon + accent color per workflow state)
// ─────────────────────────────────────────────
type StateMeta = { Icon: React.ElementType; color: string; dot: string };

const STATE_META: Record<string, StateMeta> = {
    BACKLOG: { Icon: CircleDashed, color: 'text-zinc-400', dot: 'bg-zinc-300' },
    TODO: { Icon: Circle, color: 'text-zinc-500', dot: 'bg-zinc-400' },
    IN_PROGRESS: { Icon: Loader, color: 'text-amber-500', dot: 'bg-amber-400' },
    REVIEW: { Icon: CircleDot, color: 'text-sky-500', dot: 'bg-sky-400' },
    QA: { Icon: CircleDot, color: 'text-sky-500', dot: 'bg-sky-400' },
    DONE: { Icon: CircleCheck, color: 'text-emerald-500', dot: 'bg-emerald-400' },
    COMPLETED: { Icon: CircleCheck, color: 'text-emerald-500', dot: 'bg-emerald-400' },
    BLOCKED: { Icon: CircleSlash, color: 'text-rose-500', dot: 'bg-rose-400' },
};

function metaFor(name: string): StateMeta {
    const key = name.toUpperCase().replace(/[\s-]+/g, '_');
    return STATE_META[key] || STATE_META.TODO;
}

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

type Ordering = 'MANUAL' | 'PRIORITY' | 'DUE';

export function KanbanBoardView({ projectId }: { projectId: string }) {

    const { data, isLoading, error, moveIssue, refresh } = useKanban(projectId);

    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Avoid hydration mismatch with @hello-pangea/dnd
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Toolbar state
    const [showFilters, setShowFilters] = useState(false);
    const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
    const [filterDate, setFilterDate] = useState<'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING'>('ALL');
    const [ordering, setOrdering] = useState<Ordering>('MANUAL');

    const activeFilterCount = (filterAssignee !== 'ALL' ? 1 : 0) + (filterDate !== 'ALL' ? 1 : 0);

    const uniqueAssignees = useMemo(() => {
        if (!data) return [];
        const map = new Map();
        data.states.forEach(s => {
            (data.board[s.name] || []).forEach((i: any) => {
                if (i.assignee) map.set(i.assignee.id, i.assignee);
            });
        });
        return Array.from(map.values());
    }, [data]);

    const filteredBoard = useMemo(() => {
        if (!data) return {};
        const filtered: Record<string, any[]> = {};
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        data.states.forEach(state => {
            let issues = [...(data.board[state.name] || [])];

            if (filterAssignee !== 'ALL') {
                issues = filterAssignee === 'UNASSIGNED'
                    ? issues.filter((i: any) => !i.assignee)
                    : issues.filter((i: any) => i.assignee?.id === filterAssignee);
            }

            if (filterDate !== 'ALL') {
                issues = issues.filter((i: any) => {
                    if (!i.dueDate) return false;
                    const due = new Date(i.dueDate);
                    const dueStr = due.toISOString().split('T')[0];
                    if (filterDate === 'OVERDUE') return due < now && dueStr !== todayStr;
                    if (filterDate === 'TODAY') return dueStr === todayStr;
                    if (filterDate === 'UPCOMING') return due > now && dueStr !== todayStr;
                    return true;
                });
            }

            if (ordering === 'PRIORITY') {
                issues.sort((a: any, b: any) =>
                    (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
            } else if (ordering === 'DUE') {
                issues.sort((a: any, b: any) => {
                    const ax = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const bx = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    return ax - bx;
                });
            }

            filtered[state.name] = issues;
        });
        return filtered;
    }, [data, filterAssignee, filterDate, ordering]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !data) return;
        const sourceColumn = result.source.droppableId;
        const destColumn = result.destination.droppableId;
        const issueId = result.draggableId;
        if (sourceColumn === destColumn && result.source.index === result.destination.index) return;
        const newState = data.states.find(s => s.name === destColumn);
        if (newState) {
            moveIssue(issueId, newState.id, newState.name, sourceColumn, result.destination.index);
        }
    };

    // ── Loading skeleton ──
    if (!mounted || isLoading) {
        return (
            <div className={`flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden animate-pulse ${inter.className}`}>
                <div className="shrink-0 px-6 py-3 flex items-center gap-3">
                    <div className="w-28 h-9 bg-zinc-200 dark:bg-zinc-900 rounded-lg" />
                    <div className="w-20 h-9 bg-zinc-100 dark:bg-zinc-900/60 rounded-lg" />
                    <div className="w-24 h-9 bg-zinc-100 dark:bg-zinc-900/60 rounded-lg" />
                </div>
                <div className="flex-1 overflow-hidden px-6 pb-6 pt-2">
                    <div className="flex h-full items-start w-full gap-5">
                        {[1, 2, 3, 4].map(col => (
                            <div key={col} className="flex flex-col flex-1 min-w-[240px] h-full">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-900 rounded-full" />
                                    <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-900 rounded" />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {[1, 2].map(card => (
                                        <div key={card} className="bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 h-[128px] shadow-sm">
                                            <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-900 rounded" />
                                            <div className="w-1/2 h-3 bg-zinc-100 dark:bg-zinc-900/60 rounded" />
                                            <div className="flex justify-between items-center mt-auto">
                                                <div className="w-16 h-5 bg-zinc-100 dark:bg-zinc-900/60 rounded-full" />
                                                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-900" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <KanbanSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-[14px]">Failed to load project board.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden ${inter.className}`}>

            {/* ── Toolbar ── */}
            <div className="shrink-0 px-6 py-3 flex items-center gap-2.5">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-medium rounded-lg px-3.5 py-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-[0.98]"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    New Issue
                </button>

                <button
                    onClick={() => setShowFilters(v => !v)}
                    className={`flex items-center gap-2 text-[13px] font-medium rounded-lg px-3.5 py-2 border transition-colors ${
                        showFilters || activeFilterCount > 0
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                >
                    <SlidersHorizontal size={15} />
                    Filter
                    {activeFilterCount > 0 && (
                        <span className="ml-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[11px] font-semibold rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <ToolbarSelect
                    icon={<ArrowUpDown size={15} />}
                    value={ordering}
                    onChange={(v) => setOrdering(v as Ordering)}
                    options={[
                        { label: 'Manual', value: 'MANUAL' },
                        { label: 'Priority', value: 'PRIORITY' },
                        { label: 'Due date', value: 'DUE' },
                    ]}
                    prefix="Ordering"
                />

                <div className="ml-auto flex items-center gap-2 text-[12px] text-zinc-400 dark:text-zinc-500">
                    <span className="font-medium">
                        {data.states.reduce((n, s) => n + (filteredBoard[s.name]?.length || 0), 0)} issues
                    </span>
                </div>
            </div>

            {/* ── Filter row (collapsible) ── */}
            {showFilters && (
                <div className="shrink-0 px-6 pb-3 flex items-center gap-2.5 flex-wrap">
                    <ToolbarSelect
                        value={filterAssignee}
                        onChange={setFilterAssignee}
                        prefix="Assignee"
                        options={[
                            { label: 'Everyone', value: 'ALL' },
                            { label: 'Unassigned', value: 'UNASSIGNED' },
                            ...uniqueAssignees.map((a: any) => ({ label: a.name, value: a.id })),
                        ]}
                    />
                    <ToolbarSelect
                        value={filterDate}
                        onChange={(v) => setFilterDate(v as any)}
                        prefix="Due"
                        options={[
                            { label: 'Any time', value: 'ALL' },
                            { label: 'Overdue', value: 'OVERDUE' },
                            { label: 'Today', value: 'TODAY' },
                            { label: 'Upcoming', value: 'UPCOMING' },
                        ]}
                    />
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => { setFilterAssignee('ALL'); setFilterDate('ALL'); }}
                            className="text-[12px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors px-2"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {/* ── Board ── */}
            <main className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden custom-scrollbar px-6 pb-6 pt-1">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full items-start w-full gap-5">
                        {data.states.map((state: any, index: number) => {
                            const issues = filteredBoard[state.name] || [];
                            const meta = metaFor(state.name);
                            const StatusIcon = meta.Icon;

                            return (
                                <div key={state.id} className="flex flex-col flex-1 min-w-[248px] max-w-[340px] h-full max-h-full">
                                    {/* Column header */}
                                    <div className="group/col flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <StatusIcon size={15} className={meta.color} strokeWidth={2.25} />
                                            <h2 className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 capitalize">
                                                {state.name.toLowerCase().replace(/_/g, ' ')}
                                            </h2>
                                            <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500">
                                                {issues.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-md p-1 transition-colors"
                                                title="New issue"
                                            >
                                                <Plus size={15} />
                                            </button>
                                            <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-md p-1 transition-colors">
                                                <MoreHorizontal size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Droppable */}
                                    <Droppable droppableId={state.name}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto custom-scrollbar rounded-xl p-1 -m-1 min-h-[120px] transition-colors ${
                                                    snapshot.isDraggingOver ? 'bg-zinc-100/70 dark:bg-zinc-900/40' : ''
                                                }`}
                                            >
                                                <div className="flex flex-col gap-2.5 pb-8">
                                                    {issues.map((issue, idx) => (
                                                        <Draggable key={issue.id} draggableId={issue.id} index={idx}>
                                                            {(prov, snap) => (
                                                                <IssueCard
                                                                    issue={issue}
                                                                    provided={prov}
                                                                    isDragging={snap.isDragging}
                                                                    onClick={(id: string) => setSelectedIssueId(id)}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}

                                                    {issues.length === 0 && !snapshot.isDraggingOver && (
                                                        <button
                                                            onClick={() => setIsCreateModalOpen(true)}
                                                            className="mt-1 flex items-center gap-2 text-[12.5px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 px-3 py-2.5 transition-colors"
                                                        >
                                                            <Plus size={14} /> Add issue
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </main>

            {selectedIssueId && (
                <IssueSlideOver
                    issueId={selectedIssueId}
                    onClose={() => setSelectedIssueId(null)}
                    availableStates={data?.states}
                />
            )}

            <CreateIssueModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={projectId}
                onSuccess={() => refresh()}
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Toolbar Select (Filter / Ordering pills)
// ─────────────────────────────────────────────
function ToolbarSelect({ value, onChange, options, prefix, icon }: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    prefix?: string;
    icon?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`flex items-center gap-2 text-[13px] font-medium rounded-lg px-3.5 py-2 border transition-colors ${
                    isOpen
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
            >
                {icon}
                {prefix && <span className="text-zinc-400 dark:text-zinc-500">{prefix}</span>}
                <span className="text-zinc-800 dark:text-zinc-100">{selected?.label || 'Select'}</span>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full min-w-[180px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-zinc-200/60 dark:shadow-black/40 overflow-hidden z-50 p-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-2.5 py-2 text-[13px] font-medium rounded-lg transition-colors flex items-center justify-between gap-2 ${
                                value === opt.value
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                            <span className="truncate">{opt.label}</span>
                            {value === opt.value && <Check size={14} className="text-zinc-900 dark:text-white shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Issue Card
// ─────────────────────────────────────────────
function IssueCard({ issue, provided, isDragging, onClick }: any) {
    const avatar = issue.assignee?.avatar || '/4092564-about-mobile-ui-profile-ui-user-website_114033.svg';
    const firstName = issue.assignee?.name?.split(' ')[0] || 'Unassigned';
    const commentCount = issue._count?.issueComments ?? 0;

    // Priority → flag color
    const priorityFlag: Record<string, string> = {
        HIGH: 'text-rose-500',
        MEDIUM: 'text-amber-500',
        LOW: 'text-emerald-500',
    };
    const flagColor = priorityFlag[issue.priority] || 'text-zinc-300 dark:text-zinc-600';

    // Due date
    let dueDateStr: string | null = null;
    let dueTone = 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60';
    if (issue.dueDate) {
        const due = new Date(issue.dueDate);
        const now = new Date();
        const isToday = due.toDateString() === now.toDateString();
        const isOverdue = due < now && !isToday;
        dueDateStr = isToday ? 'Today' : due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (isOverdue) dueTone = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10';
        else if (isToday) dueTone = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10';
    }

    // High priority / overdue → subtle top accent
    const overdue = issue.dueDate && new Date(issue.dueDate) < new Date() &&
        new Date(issue.dueDate).toDateString() !== new Date().toDateString();
    const accent = overdue ? 'before:bg-rose-500' : issue.priority === 'HIGH' ? 'before:bg-rose-400' : '';

    return (
        <div
            onClick={() => onClick(issue.id)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
                group relative bg-white dark:bg-zinc-950 border rounded-xl flex flex-col p-3.5 cursor-pointer
                transition-all duration-150 overflow-hidden
                ${accent ? `before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] ${accent}` : ''}
                ${isDragging
                    ? 'shadow-xl shadow-zinc-300/50 dark:shadow-black/60 border-zinc-300 dark:border-zinc-700 rotate-[1.5deg] scale-[1.02] z-50'
                    : 'border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'}
            `}
        >
            {/* Key */}
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide">
                    {issue.key || issue.id.substring(0, 6).toUpperCase()}
                </span>
                <MoreHorizontal size={15} className="text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Title */}
            <p className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2">
                {issue.title}
            </p>

            {/* Description / subtitle */}
            {issue.description && (
                <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500 leading-snug line-clamp-1 mt-1">
                    {issue.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3.5">
                <div className="flex items-center gap-2">
                    {/* Priority flag */}
                    <Flag size={14} className={flagColor} fill="currentColor" strokeWidth={0} />

                    {/* Due date pill */}
                    {dueDateStr && (
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${dueTone}`}>
                            <Calendar size={11} />
                            <span className="text-[11px] font-medium">{dueDateStr}</span>
                        </div>
                    )}

                    {/* Comment count */}
                    {commentCount > 0 && (
                        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                            <MessageSquare size={12} />
                            <span className="text-[11px] font-medium">{commentCount}</span>
                        </div>
                    )}
                </div>

                {/* Assignee avatar */}
                <div
                    title={firstName}
                    className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-950 bg-zinc-100 dark:bg-zinc-900 shrink-0"
                >
                    {issue.assignee ? (
                        <img src={avatar} alt={issue.assignee.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-800">
                            ?
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
