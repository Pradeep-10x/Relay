import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, FileText, Activity } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface IssueSlideOverProps {
    issueId: string;
    onClose: () => void;
    availableStates?: { id: string; name: string }[];
}

export function IssueSlideOver({ issueId, onClose, availableStates = [] }: IssueSlideOverProps) {
    const [issue, setIssue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchIssue = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/api/v1/issues/${issueId}`);
                if (res.ok) {
                    const data = await res.json();
                    setIssue(data);
                }
            } catch (err) {
                console.error("Failed to fetch issue data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIssue();
    }, [issueId]);

    const updatePriority = async (newPriority: string) => {
        setIssue((prev: any) => ({ ...prev, priority: newPriority }));
        try {
            await apiFetch(`/api/v1/issues/${issueId}`, {
                method: 'PATCH',
                body: JSON.stringify({ priority: newPriority })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const updateState = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const targetStateId = e.target.value;
        const stateObj = availableStates.find(s => s.id === targetStateId);
        if (stateObj) {
            setIssue((prev: any) => ({ ...prev, state: stateObj, stateId: targetStateId }));
            try {
                await apiFetch(`/api/v1/issues/${issueId}/state`, {
                    method: 'PATCH',
                    body: JSON.stringify({ targetStateId })
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Format utility
    const priorityColor = (pri: string) => {
        if (pri === 'HIGH') return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
        if (pri === 'MEDIUM') return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
        return 'text-sky-500 border-sky-500/20 bg-sky-500/10';
    };

    return (
        <AnimatePresence>
            {/* Backdrop Layer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-screen w-full md:w-[850px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[110] flex flex-col font-sans"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-800 animate-spin" />
                    </div>
                ) : !issue ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-zinc-500">
                        <p>Issue not found</p>
                        <button onClick={onClose} className="mt-4 text-emerald-400">Close</button>
                    </div>
                ) : (
                    <>
                        {/* Top Header */}
                        <header className="px-8 py-5 flex items-center justify-between border-b border-zinc-800/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="text-[14px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md shadow-sm">
                                    {issue.key || `#${issue.id.slice(0, 5).toUpperCase()}`}
                                </span>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        {/* Scrolling Content - 2 Column Layout */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
                            
                            {/* Left Column (Main Content) */}
                            <div className="flex-1 p-8 space-y-8 min-w-0">
                                {/* Title */}
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
                                        {issue.title}
                                    </h1>
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <h3 className="text-[16px] font-bold text-zinc-100 tracking-wide">Description</h3>
                                    <div className="text-[14px] text-zinc-400 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                                        {issue.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-zinc-800">
                                    <div className="flex gap-6">
                                        <button 
                                            onClick={() => setActiveTab('comments')}
                                            className={`pb-3 text-[14px] font-semibold transition-colors relative ${activeTab === 'comments' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Comments ({issue.issueComments?.length || 0})
                                            {activeTab === 'comments' && (
                                                <motion.div layoutId="tabMarker" className="absolute bottom-0 left-0 w-full h-[2px] bg-sky-500 rounded-t-full" />
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('activity')}
                                            className={`pb-3 text-[14px] font-semibold transition-colors relative ${activeTab === 'activity' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            Activity ({issue.activities?.length || 0})
                                            {activeTab === 'activity' && (
                                                <motion.div layoutId="tabMarker" className="absolute bottom-0 left-0 w-full h-[2px] bg-sky-500 rounded-t-full" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content Area */}
                                <div className="space-y-6 pt-2">
                                    {activeTab === 'comments' ? (
                                        <>
                                            {/* Comment Input Auth-Style */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-9 h-9 shrink-0 rounded-full bg-sky-500 text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
                                                    ME
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <textarea 
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Add a comment..."
                                                        className="w-full min-h-[100px] rounded-lg bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 outline-none text-[14px] text-zinc-100 p-4 resize-y transition-colors shadow-sm placeholder:text-zinc-600"
                                                    />
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            className="text-[13px] font-semibold text-zinc-400 hover:text-zinc-200"
                                                            onClick={() => setCommentText('')}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button className="h-9 px-5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[13px] font-bold tracking-wide transition-colors shadow-sm">
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comments List */}
                                            <div className="space-y-6 mt-8">
                                                {issue.issueComments?.length > 0 ? issue.issueComments.map((comment: any) => (
                                                    <div key={comment.id} className="flex gap-4">
                                                        <img src={comment.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.name}`} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-[13px] text-zinc-200">{comment.user?.name}</span>
                                                                <span className="text-[11px] text-zinc-500">{formatDistanceToNow(new Date(comment.createdAt), {addSuffix: true})}</span>
                                                            </div>
                                                            <p className="text-[14px] text-zinc-300 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50 block">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-8 text-[13px] text-zinc-500">
                                                        No comments yet. Be the first!
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            {issue.activities?.length > 0 ? issue.activities.map((act: any) => (
                                                <div key={act.id} className="flex gap-3 items-start">
                                                    <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Activity size={12} className="text-zinc-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] text-zinc-300">
                                                            <span className="font-semibold text-zinc-100">{act.user?.name}</span> changed <span className="text-zinc-400 font-mono">{act.field}</span>
                                                        </p>
                                                        <p className="text-[11px] text-zinc-500 mt-1">{formatDistanceToNow(new Date(act.createdAt), {addSuffix: true})}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-8 text-[13px] text-zinc-500">No activity yet.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column (Sidebar) */}
                            <div className="w-full md:w-[280px] p-8 md:pl-0 border-l border-zinc-900 lg:border-none flex-shrink-0">
                                <h4 className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-6">Details</h4>

                                <div className="space-y-8">
                                    {/* Status */}
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Status</label>
                                        <div className="relative w-full h-10">
                                            <select 
                                                value={issue.stateId || issue.state?.id || ''}
                                                onChange={updateState}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            >
                                                {availableStates.map(st => (
                                                    <option key={st.id} value={st.id}>{st.name}</option>
                                                ))}
                                            </select>
                                            <div className="w-full h-10 px-3 rounded-md bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[13px] text-white font-medium cursor-pointer shadow-sm hover:border-zinc-700 transition-colors pointer-events-none">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                                    {issue.state?.name || 'TODO'}
                                                </div>
                                                <span className="text-zinc-500 text-[10px]">▼</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Priority Selector */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Priority</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['HIGH', 'MEDIUM', 'LOW'].map((p) => {
                                                const isActive = issue.priority === p;
                                                return (
                                                    <button 
                                                        key={p} 
                                                        onClick={() => updatePriority(p)}
                                                        className={`h-9 flex flex-col items-center justify-center rounded-md border text-[10px] font-bold transition-all shadow-sm ${
                                                            isActive ? priorityColor(p) : 'text-zinc-500 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800'
                                                        }`}
                                                    >
                                                        <span className="text-[12px] leading-none mb-0.5">{p === 'HIGH' ? '↑↑' : p === 'MEDIUM' ? '↑' : '↓'}</span>
                                                        {p}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Assignee */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Assignee</label>
                                        <div className="flex items-center gap-3 py-1 text-[13px] font-medium text-zinc-300">
                                            {issue.assignee ? (
                                                <>
                                                    <img src={issue.assignee.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${issue.assignee.name}`} className="w-7 h-7 rounded-full bg-zinc-800 shrink-0" />
                                                    <span className="font-semibold text-zinc-100">{issue.assignee.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 border-dashed flex items-center justify-center shrink-0">
                                                        <UserPlus size={12} className="text-zinc-500" />
                                                    </div>
                                                    <span className="text-zinc-500">Unassigned</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reporter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Reporter</label>
                                        <div className="flex items-center gap-3 py-1 text-[13px] font-medium text-zinc-300">
                                            <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center shrink-0 text-[10px] font-bold">
                                                {issue.reporter?.name?.slice(0, 2).toUpperCase() || 'NA'}
                                            </div>
                                            <span className="font-semibold text-zinc-100">{issue.reporter?.name || 'System'}</span>
                                        </div>
                                    </div>

                                    {/* Dependencies */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Dependencies</label>
                                            <button className="text-sky-400 hover:text-sky-300 text-[18px] leading-none transition-colors">+</button>
                                        </div>
                                        {issue.blocking?.length > 0 || issue.blockedBy?.length > 0 ? (
                                            <div className="space-y-2">
                                                {issue.blocking?.map((b: any) => (
                                                    <div key={b.id} className="text-[12px] text-zinc-300 bg-zinc-900 border border-zinc-800 p-2 rounded-md">Blocks {b.blocked.key}</div>
                                                ))}
                                                {issue.blockedBy?.map((b: any) => (
                                                    <div key={b.id} className="text-[12px] text-zinc-300 bg-zinc-900 border border-zinc-800 p-2 rounded-md">Blocked by {b.blocker.key}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[12px] text-zinc-500 border-t border-zinc-800/60 pt-3">No dependencies</p>
                                        )}
                                    </div>

                                    {/* Timestamps */}
                                    <div className="pt-4 border-t border-zinc-800/60 space-y-1.5">
                                        <p className="text-[11px] text-zinc-500 font-medium">Created {formatDistanceToNow(new Date(issue.createdAt), {addSuffix: true})}</p>
                                        <p className="text-[11px] text-zinc-500 font-medium">Updated {formatDistanceToNow(new Date(issue.updatedAt), {addSuffix: true})}</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
