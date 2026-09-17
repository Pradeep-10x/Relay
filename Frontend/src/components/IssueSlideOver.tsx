import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Activity, ChevronDown, Plus, Trash2, Pencil, Check, Search, Link2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { useUser } from '@/hooks/useUser';

interface IssueSlideOverProps {
    issueId: string;
    onClose: () => void;
    availableStates?: { id: string; name: string }[];
}

const STATE_DOT: Record<string, string> = {
    BACKLOG: 'bg-zinc-300', TODO: 'bg-zinc-400', IN_PROGRESS: 'bg-amber-400',
    REVIEW: 'bg-sky-400', QA: 'bg-sky-400', DONE: 'bg-emerald-500',
    COMPLETED: 'bg-emerald-500', BLOCKED: 'bg-rose-500',
};
const dotFor = (name?: string) => STATE_DOT[(name || '').toUpperCase().replace(/[\s-]+/g, '_')] || 'bg-zinc-400';

export function IssueSlideOver({ issueId, onClose, availableStates = [] }: IssueSlideOverProps) {
    const [issue, setIssue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

    const { user } = useUser();

    // Comments
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    // Description
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editDescription, setEditDescription] = useState('');

    // Dependencies
    const [showDepPicker, setShowDepPicker] = useState(false);
    const [depQuery, setDepQuery] = useState('');
    const [projectIssues, setProjectIssues] = useState<any[]>([]);
    const [depLoading, setDepLoading] = useState(false);

    const { members } = useProjectMembers(issue?.projectId || '');

    const fetchIssue = useCallback(async () => {
        try {
            const res = await apiFetch(`/api/v1/issues/${issueId}`);
            if (res.ok) {
                const data = await res.json();
                setIssue(data);
                setEditDescription(data.description || '');
            }
        } catch (err) {
            console.error("Failed to fetch issue data", err);
        } finally {
            setIsLoading(false);
        }
    }, [issueId]);

    useEffect(() => { fetchIssue(); }, [fetchIssue]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        setIsSubmittingComment(true);
        try {
            const res = await apiFetch(`/api/v1/issues/${issueId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentText.trim() })
            });
            if (res.ok) { setCommentText(''); fetchIssue(); }
        } catch (err) { console.error(err); }
        finally { setIsSubmittingComment(false); }
    };

    const handleSaveEditComment = async (commentId: string) => {
        if (!editingCommentText.trim()) return;
        try {
            const res = await apiFetch(`/api/v1/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editingCommentText.trim() })
            });
            if (res.ok) { setEditingCommentId(null); setEditingCommentText(''); fetchIssue(); }
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const res = await apiFetch(`/api/v1/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) fetchIssue();
        } catch (err) { console.error(err); }
    };

    const handleSaveDescription = async () => {
        try {
            await apiFetch(`/api/v1/issues/${issueId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: editDescription })
            });
            setIssue((prev: any) => ({ ...prev, description: editDescription }));
            setIsEditingDesc(false);
        } catch (err) { console.error(err); }
    };

    const handleUpdateAssignee = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const targetAssigneeId = val === 'unassigned' ? null : val;
        try {
            await apiFetch(`/api/v1/issues/${issueId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assigneeId: targetAssigneeId })
            });
            if (!targetAssigneeId) {
                setIssue((prev: any) => ({ ...prev, assignee: null, assigneeId: null }));
            } else {
                const member = members.find((m: any) => m.userId === targetAssigneeId);
                if (member) setIssue((prev: any) => ({ ...prev, assignee: member.user, assigneeId: targetAssigneeId }));
            }
        } catch (err) { console.error(err); }
    };

    const updatePriority = async (newPriority: string) => {
        setIssue((prev: any) => ({ ...prev, priority: newPriority }));
        try {
            await apiFetch(`/api/v1/issues/${issueId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority })
            });
        } catch (err) { console.error(err); }
    };

    const updateState = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const targetStateId = e.target.value;
        const stateObj = availableStates.find(s => s.id === targetStateId);
        if (stateObj) {
            setIssue((prev: any) => ({ ...prev, state: stateObj, stateId: targetStateId }));
            try {
                await apiFetch(`/api/v1/issues/${issueId}/state`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetStateId })
                });
            } catch (err) { console.error(err); }
        }
    };

    // Dependencies
    const openDepPicker = async () => {
        setShowDepPicker(true);
        if (projectIssues.length === 0 && issue?.projectId) {
            setDepLoading(true);
            try {
                const res = await apiFetch(`/api/v1/projects/${issue.projectId}/kanban`);
                if (res.ok) {
                    const data = await res.json();
                    const flat: any[] = [];
                    Object.values(data.board || {}).forEach((arr: any) => arr.forEach((i: any) => flat.push(i)));
                    setProjectIssues(flat);
                }
            } catch (err) { console.error(err); }
            finally { setDepLoading(false); }
        }
    };

    const handleAddDependency = async (blockerId: string) => {
        try {
            const res = await apiFetch(`/api/v1/issues/${issueId}/dependencies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blockerId })
            });
            if (res.ok) { setShowDepPicker(false); setDepQuery(''); fetchIssue(); }
        } catch (err) { console.error(err); }
    };

    const handleRemoveDependency = async (blockerId: string) => {
        try {
            const res = await apiFetch(`/api/v1/issues/${issueId}/dependencies/${blockerId}`, { method: 'DELETE' });
            if (res.ok) fetchIssue();
        } catch (err) { console.error(err); }
    };

    const priorityDot: Record<string, string> = { HIGH: 'bg-rose-500', MEDIUM: 'bg-amber-500', LOW: 'bg-emerald-500' };

    const linkedIds = new Set<string>([
        issueId,
        ...(issue?.blockedBy?.map((b: any) => b.blocker?.id) || []),
        ...(issue?.blocking?.map((b: any) => b.blocked?.id) || []),
    ]);
    const pickerResults = projectIssues
        .filter((i) => !linkedIds.has(i.id))
        .filter((i) => {
            const q = depQuery.toLowerCase();
            return !q || i.title?.toLowerCase().includes(q) || i.key?.toLowerCase().includes(q);
        })
        .slice(0, 6);

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-zinc-900/40 z-[100] backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="fixed top-0 right-0 h-screen w-full md:w-[820px] bg-white border-l border-zinc-200 shadow-pop z-[110] flex flex-col font-sans"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="w-7 h-7 rounded-full border-[3px] border-zinc-200 border-t-zinc-800 animate-spin" />
                    </div>
                ) : !issue ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-3">
                        <p className="text-[14px]">Issue not found</p>
                        <button onClick={onClose} className="text-[13px] font-medium text-zinc-900 underline underline-offset-4">Close</button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <header className="px-8 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
                            <span className="text-[12.5px] font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md tracking-wide">
                                {issue.key || `#${issue.id.slice(0, 5).toUpperCase()}`}
                            </span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
                            {/* Left column */}
                            <div className="flex-1 p-8 space-y-7 min-w-0">
                                <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-zinc-900 leading-tight">
                                    {issue.title}
                                </h1>

                                {/* Description */}
                                <div className="space-y-2.5 relative group">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[13px] font-semibold text-zinc-900">Description</h3>
                                        {!isEditingDesc && (
                                            <button
                                                onClick={() => setIsEditingDesc(true)}
                                                className="opacity-0 group-hover:opacity-100 text-[12px] font-medium text-zinc-500 hover:text-zinc-800 transition-all"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {isEditingDesc ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className="w-full min-h-[120px] p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[14px] text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-y"
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setIsEditingDesc(false); setEditDescription(issue.description || ''); }} className="px-3 py-1.5 text-[12.5px] font-medium text-zinc-500 hover:text-zinc-800">Cancel</button>
                                                <button onClick={handleSaveDescription} className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[12.5px] font-medium">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditingDesc(true)}
                                            className="text-[14px] text-zinc-600 leading-relaxed min-h-[64px] whitespace-pre-wrap cursor-text hover:bg-zinc-50 p-2 -mx-2 rounded-lg transition-colors"
                                        >
                                            {issue.description || <span className="text-zinc-400">No description provided. Click to add one.</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-zinc-200">
                                    <div className="flex gap-6">
                                        {(['comments', 'activity'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`pb-3 text-[13.5px] font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'}`}
                                            >
                                                {tab} ({tab === 'comments' ? (issue.issueComments?.length || 0) : (issue.activities?.length || 0)})
                                                {activeTab === tab && (
                                                    <motion.div layoutId="tabMarker" className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab content */}
                                <div className="space-y-6 pt-1">
                                    {activeTab === 'comments' ? (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <Avatar name={user?.name} src={user?.avatar} />
                                                <div className="flex-1 space-y-2.5">
                                                    <textarea
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Add a comment…"
                                                        className="w-full min-h-[88px] rounded-lg bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white outline-none text-[14px] text-zinc-900 p-3.5 resize-y transition-colors placeholder:text-zinc-400"
                                                    />
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button className="text-[13px] font-medium text-zinc-500 hover:text-zinc-800" onClick={() => setCommentText('')}>Cancel</button>
                                                        <button
                                                            onClick={handleAddComment}
                                                            disabled={isSubmittingComment || !commentText.trim()}
                                                            className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                                                        >
                                                            {isSubmittingComment ? 'Saving…' : 'Comment'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5 mt-6">
                                                {issue.issueComments?.length > 0 ? issue.issueComments.map((comment: any) => {
                                                    const isOwn = user?.id && comment.user?.id === user.id;
                                                    const isEditing = editingCommentId === comment.id;
                                                    return (
                                                        <div key={comment.id} className="flex gap-3 group/c">
                                                            <Avatar name={comment.user?.name} src={comment.user?.avatar} />
                                                            <div className="flex-1 space-y-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-[13px] text-zinc-800">{comment.user?.name}</span>
                                                                    <span className="text-[11px] text-zinc-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}{comment.edited ? ' · edited' : ''}</span>
                                                                    {isOwn && !isEditing && (
                                                                        <span className="ml-auto flex items-center gap-1 opacity-0 group-hover/c:opacity-100 transition-opacity">
                                                                            <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }} className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"><Pencil size={13} /></button>
                                                                            <button onClick={() => handleDeleteComment(comment.id)} className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={13} /></button>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {isEditing ? (
                                                                    <div className="space-y-2">
                                                                        <textarea
                                                                            value={editingCommentText}
                                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                                            className="w-full min-h-[72px] rounded-lg bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white outline-none text-[13.5px] text-zinc-900 p-3 resize-y transition-colors"
                                                                            autoFocus
                                                                        />
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <button onClick={() => setEditingCommentId(null)} className="px-2.5 py-1 text-[12px] font-medium text-zinc-500 hover:text-zinc-800">Cancel</button>
                                                                            <button onClick={() => handleSaveEditComment(comment.id)} className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[12px] font-medium flex items-center gap-1"><Check size={12} /> Save</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[14px] text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 whitespace-pre-wrap break-words">
                                                                        {comment.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="text-center py-8 text-[13px] text-zinc-400">No comments yet.</div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            {issue.activities?.length > 0 ? issue.activities.map((act: any) => (
                                                <div key={act.id} className="flex gap-3 items-start">
                                                    <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Activity size={12} className="text-zinc-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] text-zinc-600">
                                                            <span className="font-semibold text-zinc-900">{act.user?.name}</span> changed <span className="text-zinc-500">{act.field.replace(/_/g, ' ')}</span>
                                                        </p>
                                                        <p className="text-[11px] text-zinc-400 mt-0.5">{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-8 text-[13px] text-zinc-400">No activity yet.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="w-full md:w-[272px] p-8 md:pl-6 border-t md:border-t-0 md:border-l border-zinc-100 flex-shrink-0">
                                <h4 className="text-[11px] font-semibold tracking-wide uppercase text-zinc-400 mb-5">Details</h4>

                                <div className="space-y-6">
                                    {/* Status */}
                                    <Field label="Status">
                                        <SelectShell value={<><span className={`w-2 h-2 rounded-full ${dotFor(issue.state?.name)}`} /><span className="capitalize">{(issue.state?.name || 'todo').toLowerCase().replace(/_/g, ' ')}</span></>}>
                                            <select value={issue.stateId || issue.state?.id || ''} onChange={updateState} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                                {availableStates.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                                            </select>
                                        </SelectShell>
                                    </Field>

                                    {/* Priority */}
                                    <Field label="Priority">
                                        <div className="grid grid-cols-3 gap-2">
                                            {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                                                const isActive = issue.priority === p;
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => updatePriority(p)}
                                                        className={`h-8 flex items-center justify-center gap-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                                                            isActive ? 'border-zinc-300 bg-zinc-100 text-zinc-900' : 'text-zinc-500 border-zinc-200 bg-white hover:bg-zinc-50'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[p]}`} />
                                                        {p.charAt(0) + p.slice(1).toLowerCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Field>

                                    {/* Assignee */}
                                    <Field label="Assignee">
                                        <SelectShell value={
                                            issue.assignee ? (
                                                <><Avatar name={issue.assignee.name} src={issue.assignee.avatar} sm /><span className="font-medium text-zinc-800 truncate max-w-[120px]">{issue.assignee.name}</span></>
                                            ) : (
                                                <><span className="w-6 h-6 rounded-full bg-zinc-100 border border-dashed border-zinc-300 flex items-center justify-center"><UserPlus size={11} className="text-zinc-400" /></span><span className="text-zinc-500">Unassigned</span></>
                                            )
                                        }>
                                            <select value={issue.assigneeId || 'unassigned'} onChange={handleUpdateAssignee} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                                                <option value="unassigned">Unassigned</option>
                                                {members.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                                            </select>
                                        </SelectShell>
                                    </Field>

                                    {/* Reporter */}
                                    <Field label="Reporter">
                                        <div className="flex items-center gap-2.5 py-1 h-10">
                                            <Avatar name={issue.reporter?.name} src={issue.reporter?.avatar} sm />
                                            <span className="font-medium text-[13px] text-zinc-800">{issue.reporter?.name || 'System'}</span>
                                        </div>
                                    </Field>

                                    {/* Dependencies */}
                                    <Field label="Dependencies" action={
                                        <button onClick={() => (showDepPicker ? setShowDepPicker(false) : openDepPicker())} className="p-0.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors">
                                            <Plus size={14} className={showDepPicker ? 'rotate-45 transition-transform' : 'transition-transform'} />
                                        </button>
                                    }>
                                        {showDepPicker && (
                                            <div className="mb-2 rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
                                                <div className="flex items-center gap-2 px-2.5 h-9 border-b border-zinc-100">
                                                    <Search size={13} className="text-zinc-400" />
                                                    <input autoFocus value={depQuery} onChange={(e) => setDepQuery(e.target.value)} placeholder="Find issue to block on…" className="flex-1 bg-transparent outline-none text-[12.5px] text-zinc-800 placeholder:text-zinc-400" />
                                                </div>
                                                <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
                                                    {depLoading ? (
                                                        <div className="px-3 py-3 text-[12px] text-zinc-400">Loading…</div>
                                                    ) : pickerResults.length === 0 ? (
                                                        <div className="px-3 py-3 text-[12px] text-zinc-400">No issues found.</div>
                                                    ) : pickerResults.map((i) => (
                                                        <button key={i.id} onClick={() => handleAddDependency(i.id)} className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center gap-2 transition-colors">
                                                            <span className="text-[11px] font-medium text-zinc-400 shrink-0">{i.key}</span>
                                                            <span className="text-[12.5px] text-zinc-700 truncate">{i.title}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {(issue.blockedBy?.length > 0 || issue.blocking?.length > 0) ? (
                                            <div className="space-y-1.5">
                                                {issue.blockedBy?.map((b: any) => (
                                                    <div key={b.id} className="group/d flex items-center gap-2 text-[12px] text-zinc-700 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg">
                                                        <Link2 size={12} className="text-rose-500 shrink-0" />
                                                        <span className="text-zinc-500">Blocked by</span>
                                                        <span className="font-medium truncate">{b.blocker?.key}</span>
                                                        <button onClick={() => handleRemoveDependency(b.blocker?.id)} className="ml-auto opacity-0 group-hover/d:opacity-100 text-zinc-400 hover:text-rose-600 transition-all"><X size={13} /></button>
                                                    </div>
                                                ))}
                                                {issue.blocking?.map((b: any) => (
                                                    <div key={b.id} className="flex items-center gap-2 text-[12px] text-zinc-700 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg">
                                                        <Link2 size={12} className="text-amber-500 shrink-0" />
                                                        <span className="text-zinc-500">Blocks</span>
                                                        <span className="font-medium truncate">{b.blocked?.key}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !showDepPicker ? (
                                            <p className="text-[12px] text-zinc-400">No dependencies</p>
                                        ) : null}
                                    </Field>

                                    {/* Timestamps */}
                                    <div className="pt-4 border-t border-zinc-100 space-y-1.5">
                                        <p className="text-[11px] text-zinc-400">Created {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</p>
                                        <p className="text-[11px] text-zinc-400">Updated {formatDistanceToNow(new Date(issue.updatedAt), { addSuffix: true })}</p>
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

// ── Small building blocks ──
function Field({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium tracking-wide uppercase text-zinc-400">{label}</label>
                {action}
            </div>
            {children}
        </div>
    );
}

function SelectShell({ value, children }: { value: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="relative w-full h-10">
            {children}
            <div className="w-full h-10 px-3 rounded-lg bg-white border border-zinc-200 flex items-center justify-between text-[13px] text-zinc-900 font-medium shadow-sm pointer-events-none">
                <div className="flex items-center gap-2 min-w-0">{value}</div>
                <ChevronDown size={14} className="text-zinc-400 shrink-0" />
            </div>
        </div>
    );
}

function Avatar({ name, src, sm }: { name?: string; src?: string | null; sm?: boolean }) {
    const size = sm ? 'w-6 h-6 text-[10px]' : 'w-9 h-9 text-[12px]';
    if (src) return <img src={src} alt={name || ''} className={`${size} rounded-full object-cover bg-zinc-100 shrink-0`} />;
    return (
        <div className={`${size} rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold shrink-0`}>
            {(name || 'U').slice(0, 2).toUpperCase()}
        </div>
    );
}
