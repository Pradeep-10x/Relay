'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Fira_Sans, PT_Serif } from 'next/font/google';
import { KanbanSquare, MoreHorizontal, Plus } from 'lucide-react';
import { useKanban } from '@/hooks/useKanban';
import { useParams } from 'next/navigation';
import { IssueSlideOver } from '@/components/IssueSlideOver';

const firaSans = Fira_Sans({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

const ptSerif = PT_Serif({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});

// A small map to customize column header icons or colors if we recognize the state name.
const STATE_THEMES: Record<string, { color: string, border: string }> = {
    'TODO': { color: 'text-zinc-400', border: 'border-zinc-800' },
    'IN_PROGRESS': { color: 'text-sky-400', border: 'border-sky-500/30' },
    'REVIEW': { color: 'text-amber-400', border: 'border-amber-500/30' },
    'QA': { color: 'text-amber-400', border: 'border-amber-500/30' },
    'DONE': { color: 'text-emerald-400', border: 'border-emerald-500/30' },
    'BLOCKED': { color: 'text-rose-400', border: 'border-rose-500/30' }
};

export function KanbanBoardView({ projectId }: { projectId: string }) {
    
    // We fall back to the active workspace id if no project id is matched, 
    // although technically this is a project route, so there should be an ID.
    const { data, isLoading, error, moveIssue } = useKanban(projectId);

    // State for slide-over wrapper
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

    // To avoid hydration mismatch errors with @hello-pangea/dnd, ensure we're mounted
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !data) return;

        const sourceColumn = result.source.droppableId;
        const destColumn = result.destination.droppableId;
        const issueId = result.draggableId;

        if (sourceColumn === destColumn && result.source.index === result.destination.index) {
            return;
        }

        const newState = data.states.find(s => s.name === destColumn);
        if (newState) {
            moveIssue(issueId, newState.id, newState.name, sourceColumn, result.destination.index);
        }
    };

    if (!mounted || isLoading) {
        return (
            <div className="flex-1 w-full h-[calc(100vh-6rem)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <KanbanSquare className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500 text-[14px]">Failed to load project board.</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col flex-1 min-w-0 min-h-0 w-full overflow-hidden ${firaSans.className}`}>
            
            {/* Board Area */}
            <main className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-hidden custom-scrollbar px-6 pb-6 pt-2">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full items-start w-full">
                        {data.states.map((state: any, index: number) => {
                            const issues = data.board[state.name] || [];
                            const themeKey = state.name.toUpperCase().replace(' ', '_');
                            const theme = STATE_THEMES[themeKey] || STATE_THEMES['TODO'];

                            return (
                                <React.Fragment key={state.id}>
                                    <div className="flex flex-col flex-1 min-w-[200px] h-full max-h-full mr-4">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2.5">
                                            <h2 className="text-[12px] font-bold tracking-[0.05em] uppercase text-zinc-300">
                                                {state.name}
                                            </h2>
                                            <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                                                {issues.length}
                                            </span>
                                        </div>
                                        <button className="text-zinc-600 hover:text-zinc-300 transition-colors bg-zinc-900 border border-zinc-800 rounded-md p-1">
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Column Body / Droppable Zone */}
                                    <Droppable droppableId={state.name}>
                                        {(provided, snapshot) => (
                                            <div 
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 overflow-y-auto custom-scrollbar p-1 -mx-1 min-h-[150px] transition-colors rounded-lg ${
                                                    snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''
                                                }`}
                                            >
                                                <div className="flex flex-col gap-3 pb-8">
                                                    {issues.map((issue, index) => (
                                                        <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <IssueCard 
                                                                    issue={issue}
                                                                    provided={provided}
                                                                    isDragging={snapshot.isDragging}
                                                                    theme={theme}
                                                                    onClick={(id: string) => setSelectedIssueId(id)}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                                {index < data.states.length - 1 && (
                                    <div className="w-[1px] h-[calc(100vh-14rem)] bg-zinc-800/50 shrink-0 mr-4 mt-2 rounded-full" />
                                )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </DragDropContext>
            </main>

            {/* Slide Over */}
            {selectedIssueId && (
                <IssueSlideOver 
                    issueId={selectedIssueId} 
                    onClose={() => setSelectedIssueId(null)} 
                    availableStates={data?.states}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Issue Card Component
// ─────────────────────────────────────────────
function IssueCard({ issue, provided, isDragging, theme, onClick }: any) {
    const avatar = issue.assignee?.avatar || `/4092564-about-mobile-ui-profile-ui-user-website_114033.svg`;
    
    // Determine priority color marker
    let priorityColor = 'bg-zinc-700'; // Default low priority/none
    if (issue.priority === 'HIGH') priorityColor = 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
    if (issue.priority === 'MEDIUM') priorityColor = 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]';
    if (issue.priority === 'LOW') priorityColor = 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]';

    return (
        <div 
            onClick={() => onClick(issue.id)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
                group relative bg-black border rounded-lg flex flex-col p-4
                transition-all duration-200 hover:bg-zinc-950
                ${isDragging ? 'shadow-2xl border-zinc-700 rotate-[1.5deg] scale-[1.02] z-50' : 'border-zinc-800/80 shadow-md'}
            `}
        >
            <div className="flex flex-col gap-3.5">
                {/* Top Row: Meta & Assignee */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 tracking-wider">
                                {issue.key || issue.id.substring(0,6).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content: Title */}
                <p className="text-[14px] font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">
                    {issue.title}
                </p>

                {/* Bottom Row: Priority & Avatar */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        {/* Priority Dot */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${priorityColor}`} />
                            <span className="text-[10px] font-medium text-zinc-400 tracking-wide uppercase">
                                {issue.priority || 'NORMAL'}
                            </span>
                        </div>
                    </div>

                    <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0 shadow-sm">
                        {issue.assignee ? (
                            <img src={avatar} alt={issue.assignee.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-bold bg-zinc-800">?</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
