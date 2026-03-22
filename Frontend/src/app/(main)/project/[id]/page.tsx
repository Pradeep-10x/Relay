'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Fira_Sans } from 'next/font/google';
import { KanbanSquare, Presentation, Users, Activity, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { KanbanBoardView } from '@/components/project-views/KanbanBoardView';
import { WhiteboardView } from '@/components/project-views/WhiteboardView';
import { ProjectMembersView } from '@/components/project-views/ProjectMembersView';
import { ProjectAnalyticsView } from '@/components/project-views/ProjectAnalyticsView';
import { useProjects } from '@/hooks/useProjects';

const firaSans = Fira_Sans({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
});

type TabType = 'board' | 'whiteboard' | 'members' | 'analytics';

export default function ProjectMasterPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { projects } = useProjects();
    const currentProject = projects.find(p => p.id === projectId);
    
    const [activeTab, setActiveTab] = useState<TabType>('board');

    const tabs = [
        { id: 'board', label: 'Kanban Board', icon: KanbanSquare },
        { id: 'whiteboard', label: 'Whiteboard', icon: Presentation },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 }
    ];

    if (!projectId) return null;

    return (
        <div className={`h-[calc(100vh-4rem)] flex flex-col bg-black md:px-0 pt-0 ${firaSans.className}`}>
            
            {/* Unified Header */}
            <header className="shrink-0 px-8 pt-8 pb-4 border-b border-zinc-800/60 bg-black z-10 sticky top-0">
                <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    {/* Top Row: Title */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">Environment Active</span>
                        </div>
                        <h1 className="text-[28px] font-bold tracking-tight text-white leading-none">
                            {currentProject ? currentProject.name : 'Loading...'}
                        </h1>
                    </div>

                    {/* Bottom Row: Auth Aesthetics Segmented Control */}
                    <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/80">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`relative flex items-center gap-2 px-4 py-2 text-[12px] font-semibold tracking-wide transition-colors rounded-md ${
                                        isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabPill"
                                            className="absolute inset-0 bg-zinc-800 border border-zinc-700/50 rounded-md"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon size={14} className={isActive ? 'text-sky-400' : 'text-zinc-600'} />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* View Container */}
            <main className="flex-1 overflow-hidden relative break-words bg-[#0a0a0c]">
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
