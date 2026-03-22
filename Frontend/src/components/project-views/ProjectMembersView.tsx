import React, { useState } from 'react';
import { useProjectMembers } from '@/hooks/useProjectMembers';
import { Shield, User, HardHat, Mail, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';

export function ProjectMembersView({ projectId }: { projectId: string }) {
    const { members, isLoading, error, refresh } = useProjectMembers(projectId);
    const [isAdding, setIsAdding] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [inviteStatus, setInviteStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
    const [inviteMessage, setInviteMessage] = useState('');

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        
        setInviteStatus('submitting');
        try {
            const res = await apiFetch(`/api/v1/project/${projectId}/add-member`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
            });

            if (res.ok) {
                setInviteStatus('success');
                setInviteMessage('Member added successfully!');
                refresh();
                setTimeout(() => {
                    setIsAdding(false);
                    setInviteStatus('idle');
                    setInviteEmail('');
                }, 1500);
            } else {
                const data = await res.json();
                setInviteStatus('error');
                setInviteMessage(data.message || 'Failed to add member.');
            }
        } catch (err: any) {
            setInviteStatus('error');
            setInviteMessage(err.message || 'An error occurred.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 w-full max-w-5xl mx-auto p-6 space-y-6 animate-pulse mt-4">
                <div className="flex justify-between items-end mb-6">
                    <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                    <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-full h-[72px] bg-white dark:bg-zinc-950/50 border border-transparent dark:border-zinc-800/40 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-900" />
                                <div className="space-y-2">
                                    <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-900 rounded" />
                                    <div className="w-48 h-3 bg-zinc-100 dark:bg-zinc-900/50 rounded" />
                                </div>
                            </div>
                            <div className="w-20 h-6 rounded-full bg-zinc-200 dark:bg-zinc-900" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
                <p>Failed to load project members</p>
            </div>
        );
    }

    const roleIcon = (role: string) => {
        if (role === 'OWNER') return <Shield size={14} className="text-amber-500" />;
        if (role === 'ADMIN') return <HardHat size={14} className="text-sky-500" />;
        return <User size={14} className="text-zinc-500" />;
    };

    return (
        <div className="px-6 py-6 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Member Directory</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Manage who has access to this project's boards and issues.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="h-9 px-4 rounded-md bg-white text-black text-[12px] font-bold tracking-wide transition-colors hover:bg-zinc-200"
                >
                    Add Member
                </button>
            </div>

            {/* In-View Invite Modal Layer */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsAdding(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 relative"
                        >
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <X size={18} />
                            </button>
                            <h3 className="text-lg font-bold text-white mb-1">Add to Project</h3>
                            <p className="text-[13px] text-zinc-400 mb-6">User must already be a member of the Workspace.</p>
                            
                            {inviteMessage && (
                                <div className={`p-3 rounded-lg mb-4 text-[13px] font-medium flex items-center gap-2 border ${
                                    inviteStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                    {inviteStatus === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                    {inviteMessage}
                                </div>
                            )}

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Email Address</label>
                                    <input 
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-white text-[13px] outline-none focus:border-zinc-600"
                                        placeholder="colleague@company.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Role</label>
                                    <select 
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                        className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-white text-[13px] outline-none focus:border-zinc-600"
                                    >
                                        <option value="MEMBER">Member (Standard)</option>
                                        <option value="ADMIN">Admin (Manage settings)</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={inviteStatus === 'submitting'}
                                    className="w-full h-10 mt-2 bg-white text-black font-bold tracking-wide text-[13px] rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {inviteStatus === 'submitting' ? 'Adding...' : 'Add Member'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/80 bg-zinc-900/20">
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase w-1/2">Member</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Role</th>
                            <th className="py-4 px-6 text-[10px] font-bold tracking-widest text-zinc-500 uppercase text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                        {members.map((member: any) => (
                            <tr key={member.userId} className="group hover:bg-zinc-900/40 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={member.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.name}`} 
                                            alt={member.user?.name}
                                            className="w-10 h-10 rounded-full border border-zinc-800 object-cover bg-zinc-900" 
                                        />
                                        <div>
                                            <p className="text-[13px] font-bold text-zinc-100">{member.user?.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 font-medium">
                                                <Mail size={12} />
                                                <span>{member.user?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
                                        {roleIcon(member.role)}
                                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{member.role}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="text-[13px] text-zinc-500 font-medium">
                                        {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="p-8 text-center text-[13px] text-zinc-500">No members found in this project.</div>
                )}
            </div>
        </div>
    );
}
