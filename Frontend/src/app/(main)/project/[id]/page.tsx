'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import { KanbanSquare, Presentation, Users, BarChart2, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { KanbanBoardView } from '@/components/project-views/KanbanBoardView';
import { WhiteboardView } from '@/components/project-views/WhiteboardView';
import { ProjectMembersView } from '@/components/project-views/ProjectMembersView';
import { ProjectAnalyticsView } from '@/components/project-views/ProjectAnalyticsView';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { apiFetch } from '@/lib/api';
import { useProjects } from '@/hooks/useProjects';

const firaSans = Inter({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
});

type TabType = 'board' | 'whiteboard' | 'members' | 'analytics';

export default function ProjectMasterPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { projects } = useProjects();
    const currentProject = projects.find(p => p.id === projectId);

    const [activeTab, setActiveTab] = useState<TabType>('board');
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleDeleteProject = async () => {
        const res = await apiFetch(`/api/v1/project/${projectId}/delete`, { method: 'DELETE' });
        if (res.ok) {
            // Full navigation so the sidebar's project list refetches.
            window.location.href = '/dashboard';
        } else {
            setConfirmDelete(false);
        }
    };

    const tabs = [
        { id: 'board', label: 'Kanban Board', icon: KanbanSquare },
        { id: 'whiteboard', label: 'Whiteboard', icon: Presentation },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 }
    ];

    if (!projectId) return null;

    return (
        <div className={`h-[calc(100vh-4rem)] flex flex-col bg-zinc-50 md:px-0 pt-0 ${firaSans.className}`}>

            {/* Unified Header */}
            <header className="shrink-0 px-8 pt-6 pb-3 border-b border-zinc-200 bg-zinc-50 z-10 sticky top-0">
                <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    {/* Top Row: Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[15px] font-semibold shrink-0">
                            {currentProject ? currentProject.name.charAt(0).toUpperCase() : '·'}
                        </div>
                        <div>
                            <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 leading-tight">
                                {currentProject ? currentProject.name : 'Loading…'}
                            </h1>
                            <p className="text-[12.5px] text-zinc-500 leading-none mt-0.5">
                                {currentProject?.key ? `${currentProject.key} · Project workspace` : 'Project workspace'}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Segmented Control + actions */}
                    <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`relative flex items-center gap-2 px-3.5 py-1.5 text-[12.5px] font-medium transition-colors rounded-md ${
                                        isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabPill"
                                            className="absolute inset-0 bg-white border border-zinc-200 rounded-md shadow-sm"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon size={14} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Project actions menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${menuOpen ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                            title="Project actions"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-0 mt-1.5 w-44 bg-white border border-zinc-200 rounded-xl shadow-pop p-1 z-50"
                                >
                                    <button
                                        onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 size={15} /> Delete project
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    </div>
                </div>
            </header>

            <ConfirmDialog
                open={confirmDelete}
                danger
                title="Delete this project?"
                description={<>This permanently deletes <span className="font-medium text-zinc-800">{currentProject?.name || 'the project'}</span> and all of its issues, comments, and board data. This cannot be undone.</>}
                confirmLabel="Delete project"
                confirmPhrase={currentProject?.name}
                onConfirm={handleDeleteProject}
                onClose={() => setConfirmDelete(false)}
            />

            {/* View Container */}
            <main className="flex-1 overflow-hidden relative break-words bg-zinc-50">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.99, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.01, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="h-full w-full max-w-[1600px] mx-auto pt-2 flex flex-col min-w-0 min-h-0"
                    >
                        {activeTab === 'board' && <KanbanBoardView projectId={projectId} />}
                        {activeTab === 'whiteboard' && <WhiteboardView projectId={projectId} />}
                        {activeTab === 'members' && <ProjectMembersView projectId={projectId} />}
                        {activeTab === 'analytics' && <ProjectAnalyticsView projectId={projectId} />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
