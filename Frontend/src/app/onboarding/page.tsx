'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Sparkles, Link as LinkIcon, Users, Plus, Loader2, ArrowRight, ChevronLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -2 },
    show: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { staggerChildren: 0.1, type: "spring", stiffness: 260, damping: 20 }
    }
} as any;

const itemVariants = {
    hidden: { opacity: 0, y: 15, rotate: -2 },
    show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as any;

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState<{name: string, email: string} | null>(null);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI states
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

                // Fetch User
                const userRes = await apiFetch(`/api/v1/user/me`);
                if (!userRes.ok) throw new Error('Failed to load user');
                const userData = await userRes.json();
                setUser(userData.user || userData);

                // Fetch Workspaces
                const wsRes = await apiFetch(`/api/v1/workspace`);
                if (wsRes.ok) {
                    const wsData = await wsRes.json();
                    setWorkspaces(wsData.workspaces || []);
                }
            } catch (err) {
                console.error(err);
                // If unauthorized, go back to auth
                router.push('/auth');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [baseUrl, router]);

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await apiFetch(`/api/v1/workspace/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newWorkspaceName })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create workspace');
            
            if (data.workspace?.id) {
                localStorage.setItem('activeWorkspaceId', data.workspace.id);
            }
            router.push('/dashboard');
        } catch (err: any) {
            setErrorMsg(err.message);
            setActionLoading(false);
        }
    };

    const handleJoinWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;
        
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await apiFetch(`/api/v1/workspace/${inviteCode}/join`, {
                method: 'POST'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to join workspace');
            
            if (data.workspace?.id) {
                localStorage.setItem('activeWorkspaceId', data.workspace.id);
            }
            router.push('/dashboard');
        } catch (err: any) {
            setErrorMsg(err.message);
            setActionLoading(false);
        }
    };

    const selectWorkspace = (id: string) => {
        localStorage.setItem('activeWorkspaceId', id);
        router.push('/dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center p-4">
            {/* Background elements identical to auth/page.tsx */}
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 z-0 pointer-events-none" aria-hidden="true">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 dark:opacity-70" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 1000">
                    <defs>
                        <g id="box3d">
                            <polygon points="0,-40 60,-10 0,20 -60,-10" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
                            <polygon points="-60,-10 0,20 0,80 -60,50" className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
                            <polygon points="0,20 60,-10 60,50 0,80" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
                        </g>
                    </defs>
                    <path d="M 200 200 C 400 50, 700 200, 850 450" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" />
                    <path d="M 850 450 C 900 700, 500 800, 300 850" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" />
                    <path d="M 300 850 C 100 900, 50 400, 200 200" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" />
                    <circle cx="530" cy="180" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
                    <circle cx="750" cy="680" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
                    <circle cx="150" cy="550" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
                    <g transform="translate(200, 200)"><use href="#box3d" /></g>
                    <g transform="translate(850, 450)"><use href="#box3d" /></g>
                    <g transform="translate(300, 850)"><use href="#box3d" /></g>
                </svg>
            </div>
            


            <Button variant="ghost" className="absolute top-7 left-5 z-20" asChild>
                <a href="/">
                    <ChevronLeftIcon className='size-4 me-2' />
                    Home
                </a>
            </Button>

            <motion.div 
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="w-full max-w-[500px] space-y-6 bg-white dark:bg-zinc-950 p-8 sm:p-10 rounded-[6px] shadow-xl border border-zinc-200 dark:border-zinc-800 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="text-center space-y-2">
                    <img src="/logo.svg" alt="Relay" width={48} height={48} className="mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Hello, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Select a workspace to continue, or create a new one.
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div variants={itemVariants} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-md overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-900/60">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">
                            Your Workspaces
                        </div>
                        <div className="text-[11px] font-bold text-zinc-500">
                            {workspaces.length}
                        </div>
                    </div>

                    <div className="p-0">
                        {workspaces.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                                <Sparkles className="w-6 h-6 text-zinc-400 dark:text-zinc-600 mb-4" />
                                <h3 className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold mb-1">No workspaces yet</h3>
                                <p className="text-zinc-500 text-xs font-medium">Create one or join with an invite link.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50 max-h-[250px] overflow-y-auto">
                                {workspaces.map((ws) => (
                                    <button 
                                        key={ws.id}
                                        onClick={() => selectWorkspace(ws.id)}
                                        className="w-full text-left px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between group"
                                    >
                                        <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{ws.name}</span>
                                        <ArrowRight size={16} className="text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Actions Section */}
                <motion.div variants={itemVariants} className="space-y-3 pt-2">
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs text-center font-medium overflow-hidden"
                            >
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {!isCreating && (
                        <div className="flex gap-2.5">
                            <Button 
                                onClick={() => { setIsCreating(true); setIsJoining(false); }}
                                className="flex-1 h-11 transition-all rounded-[8px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm"
                            >
                                <Plus className="mr-1.5" size={16} />
                                Create Workspace
                            </Button>
                            
                            <Button 
                                variant="outline"
                                onClick={() => { setIsJoining(!isJoining); setIsCreating(false); }}
                                className={`w-28 h-11 border-zinc-200 dark:border-zinc-800 transition-all rounded-[8px] font-semibold shadow-sm ${isJoining ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'bg-white dark:bg-zinc-950 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                            >
                                <LinkIcon className="mr-1.5" size={14} />
                                Join
                            </Button>
                        </div>
                    )}

                    {/* Join Input Drawer */}
                    {isJoining && (
                        <motion.form 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            onSubmit={handleJoinWorkspace} 
                            className="flex gap-2.5"
                        >
                            <div className="relative flex-1">
                                <Input 
                                    autoFocus
                                    placeholder="Paste invite link or code..." 
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:outline-none ring-0 focus:ring-0 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors shadow-sm text-sm rounded-[8px] px-4 font-medium"
                                />
                            </div>
                            <Button 
                                type="submit"
                                disabled={actionLoading || !inviteCode.trim()}
                                className="h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-[8px] px-6 font-semibold shadow-sm"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                            </Button>
                        </motion.form>
                    )}

                    {/* Create Input Drawer */}
                    {isCreating && (
                        <motion.form 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            onSubmit={handleCreateWorkspace} 
                            className="flex gap-2.5"
                        >
                            <Input 
                                autoFocus
                                placeholder="Workspace Name" 
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                className="h-11 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:outline-none ring-0 focus:ring-0 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors shadow-sm text-sm rounded-[8px] pl-4 font-medium"
                            />
                            <Button 
                                type="submit"
                                disabled={actionLoading || !newWorkspaceName.trim()}
                                className="h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-[8px] px-6 font-semibold shadow-sm"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                            </Button>
                            <Button 
                                type="button"
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                className="h-11 font-semibold text-muted-foreground hover:text-foreground rounded-[8px]"
                            >
                                Cancel
                            </Button>
                        </motion.form>
                    )}
                </motion.div>
            </motion.div>
        </main>
    );
}


