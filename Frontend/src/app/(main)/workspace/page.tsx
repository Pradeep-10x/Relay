'use client';

import React, { useRef } from 'react';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Users, FolderKanban, CheckCircle2, BarChart3 } from 'lucide-react';
import { Fira_Sans, PT_Serif } from 'next/font/google';
import { useWorkspaceOverview } from '@/hooks/useWorkspaceOverview';

const firaSans = Fira_Sans({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const ptSerif = PT_Serif({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export default function WorkspacePage() {
    const { data, isLoading, error } = useWorkspaceOverview();
    const scrollRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return (
            <div className="flex-1 min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
                <p className="text-zinc-500 text-sm">{error || 'Unable to load workspace data'}</p>
            </div>
        );
    }

    const scroll = (dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    };

    // Find max assigned among members for bar scaling
    const maxAssigned = Math.max(...data.members.map(m => m.assigned), 1);

    return (
        <div className={`p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans ${firaSans.className}`}>

            {/* ─── Header ─── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">Workspace Overview</h1>
                    <p className={`text-zinc-500 text-[13px] mt-1 ${ptSerif.className}`}>
                        Global control center for <span className="text-zinc-300 font-medium">{data.workspaceName}</span>
                    </p>
                </div>
            </header>

            {/* ─── Metric Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                    icon={<FolderKanban size={18} />}
                    label="Total Projects"
                    value={data.totalProjects}
                    badge={`${data.totalProjects}`}
                    badgeColor="bg-violet-500/15 text-violet-400"
                    borderColor="border-l-violet-500"
                />
                <StatCard
                    icon={<Users size={18} />}
                    label="Active Members"
                    value={data.activeMembers}
                    extra={
                        <div className="flex -space-x-2 mt-2">
                            {data.memberAvatars.map((m, i) => (
                                <img
                                    key={i}
                                    src={m.avatar}
                                    alt={m.name}
                                    title={m.name}
                                    className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-950 object-cover bg-zinc-200 dark:bg-zinc-800"
                                />
                            ))}
                            {data.activeMembers > 5 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                                    +{data.activeMembers - 5}
                                </div>
                            )}
                        </div>
                    }
                    badgeColor="bg-sky-500/15 text-sky-400"
                    badge="Manage →"
                    borderColor="border-l-sky-500"
                />
                <StatCard
                    icon={<CheckCircle2 size={18} />}
                    label="Issues Resolved"
                    value={`${data.resolvedPct}%`}
                    sub={`${data.resolvedIssues} of ${data.totalIssues} total issues`}
                    badgeColor="bg-emerald-500/15 text-emerald-400"
                    badge={`${data.resolvedPct}%`}
                    borderColor="border-l-emerald-500"
                />
                <StatCard
                    icon={<BarChart3 size={18} />}
                    label="Completion Rate"
                    value={`${data.completionRate}%`}
                    sub="Across all projects"
                    badgeColor="bg-amber-500/15 text-amber-400"
                    badge={`${data.completionRate}%`}
                    borderColor="border-l-amber-500"
                />
            </div>

            {/* ─── Recent Projects Carousel ─── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[17px] font-semibold text-zinc-100">Recent Projects</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-md">
                            {data.projects.length} Active
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => scroll('left')} className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => scroll('right')} className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                    {data.projects.map(project => (
                        <ProjectCard key={project.id} project={project} ptSerif={ptSerif.className} />
                    ))}
                    {data.projects.length === 0 && (
                        <div className="w-full py-12 flex items-center justify-center text-zinc-600 text-sm">No projects in this workspace yet.</div>
                    )}
                </div>
            </section>

            {/* ─── Bottom Grid: Team Workload + Issue Velocity ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Team Workload Table */}
                <div className="xl:col-span-8 bg-white dark:bg-zinc-950 shadow-sm rounded-xl overflow-hidden border border-transparent dark:border-zinc-800/40">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-[17px] font-semibold text-zinc-100">Team Workload</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Issues assigned per member</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 w-[200px]">Member</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Progress</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 text-center w-[60px]">Assigned</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 text-center w-[60px]">Resolved</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 text-center w-[70px]">Remaining</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 text-right w-[55px]">Perf</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.members.map((member, idx) => (
                                    <MemberRow key={member.userId} member={member} maxAssigned={maxAssigned} idx={idx} />
                                ))}
                                {data.members.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500 text-sm">No members found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Issue Velocity Chart */}
                <div className="xl:col-span-4 bg-white dark:bg-zinc-950 shadow-sm rounded-xl p-6 border border-transparent dark:border-zinc-800/40 flex flex-col">
                    <h2 className="text-[15px] font-semibold text-zinc-100 mb-1">Issue Velocity</h2>
                    <p className="text-[11px] text-zinc-500 mb-6">Created vs Resolved per project</p>

                    <div className="flex-1 flex flex-col gap-4 justify-center">
                        {data.projects.slice(0, 6).map(project => (
                            <VelocityBar key={project.id} project={project} maxIssues={Math.max(...data.projects.map(p => p.totalIssues), 1)} />
                        ))}
                        {data.projects.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 text-sm">No project data</div>
                        )}
                    </div>

                    <div className="flex items-center gap-5 mt-6 pt-4 border-t border-zinc-800/40 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-zinc-700" /> Total</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Resolved</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ───────── Helper Components ─────────

function StatCard({ icon, label, value, badge, badgeColor, borderColor, sub, extra }: any) {
    return (
        <div className={`bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-transparent dark:border-zinc-800/40 border-l-[3px] ${borderColor} flex flex-col justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-500">{icon}</span>
                    <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">{label}</span>
                </div>
                {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>{badge}</span>
                )}
            </div>
            <div className="text-[30px] font-bold text-zinc-900 dark:text-white leading-none tracking-tight">{value}</div>
            {sub && <p className="text-[11px] text-zinc-500 mt-2">{sub}</p>}
            {extra}
        </div>
    );
}

function ProjectCard({ project, ptSerif }: { project: any, ptSerif: string }) {
    const progressColor = project.progress >= 80 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-sky-500' : 'bg-amber-500';

    return (
        <div className="min-w-[260px] max-w-[300px] bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-sm border border-zinc-200/60 dark:border-zinc-800/40 flex-shrink-0 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-white leading-snug">{project.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{project.key}</span>
                </div>
            </div>

            <div className="mt-4 mb-2 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Progress</span>
                <span className="font-semibold text-zinc-300">{project.progress}%</span>
            </div>
            <div className="w-full h-[6px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${progressColor} rounded-full transition-all duration-700 ease-out`} style={{ width: `${project.progress}%` }} />
            </div>

            <p className="text-[11px] text-zinc-500 mt-3">{project.totalIssues} Issues</p>
        </div>
    );
}

function MemberRow({ member, maxAssigned, idx }: { member: any; maxAssigned: number; idx: number }) {
    const barWidth = maxAssigned > 0 ? (member.assigned / maxAssigned) * 100 : 0;
    const resolvedWidth = member.assigned > 0 ? (member.resolved / member.assigned) * 100 : 0;

    const avatar = member.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`;

    // Generate a unique color per member row — cycling through a palette
    const palette = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
    const dotColor = palette[idx % palette.length];

    const pctColor = member.pct >= 50 ? 'text-emerald-400' : member.pct >= 20 ? 'text-amber-400' : 'text-rose-400';

    return (
        <tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <div className={`w-[8px] h-[8px] rounded-full ${dotColor} shrink-0`} />
                    <img src={avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">{member.name}</span>
                </div>
            </td>
            <td className="px-4 py-3.5">
                <div className="w-full max-w-[300px] h-[8px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                    {/* Total assigned bar */}
                    <div className="absolute inset-y-0 left-0 bg-zinc-700 dark:bg-zinc-600 rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    {/* Resolved portion overlay */}
                    <div className="absolute inset-y-0 left-0 bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${barWidth * resolvedWidth / 100}%` }} />
                </div>
            </td>
            <td className="px-4 py-3.5 text-center">
                <span className="text-[13px] font-semibold text-zinc-300">{member.assigned}</span>
            </td>
            <td className="px-4 py-3.5 text-center">
                <span className="text-[13px] font-semibold text-emerald-400">{member.resolved}</span>
            </td>
            <td className="px-4 py-3.5 text-center">
                <span className="text-[13px] font-semibold text-zinc-400">{member.remaining}</span>
            </td>
            <td className="px-4 py-3.5 text-right">
                <span className={`text-[13px] font-bold ${pctColor}`}>{member.pct}%</span>
            </td>
        </tr>
    );
}

function VelocityBar({ project, maxIssues }: { project: any; maxIssues: number }) {
    const totalWidth = maxIssues > 0 ? (project.totalIssues / maxIssues) * 100 : 0;
    const resolvedWidth = project.totalIssues > 0 ? (project.resolvedIssues / project.totalIssues) * totalWidth : 0;

    let label = project.name;
    if (label.length > 14) label = label.substring(0, 12) + '..';

    return (
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-500 w-[90px] truncate text-right">{label}</span>
            <div className="flex-1 h-[10px] bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-zinc-700 rounded-full transition-all duration-500" style={{ width: `${totalWidth}%` }} />
                <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${resolvedWidth}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 w-[30px] text-right">{project.totalIssues}</span>
        </div>
    );
}
