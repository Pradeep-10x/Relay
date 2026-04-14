'use client';

import React, { useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Users, FolderKanban, CheckCircle2, BarChart3, X, Copy, Check } from 'lucide-react';
import { Fira_Sans, PT_Serif } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useWorkspaceOverview } from '@/hooks/useWorkspaceOverview';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateInvite = async () => {
        setIsGenerating(true);
        try {
            const res = await apiFetch(`/api/v1/workspace/${data?.workspaceId}/invite`, {
                method: 'POST'
            });
            if (res.ok) {
                const result = await res.json();
                setInviteToken(result.invite.token);
            } else {
                console.error('Failed to generate invite');
            }
        } catch (err) {
            console.error('Failed to generate invite', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!inviteToken) return;
        const link = `${window.location.origin}/join/${inviteToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className={`p-8 w-full max-w-[1600px] mx-auto space-y-8 font-sans animate-pulse ${firaSans.className}`}>
                <div className="flex flex-col gap-2 mb-2">
                    <div className="w-64 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                    <div className="w-48 h-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-md mt-1" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-zinc-950 rounded-md p-5 border border-transparent dark:border-zinc-800/40 h-[140px] flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-900" />
                                    <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                                </div>
                                <div className="w-12 h-4 rounded bg-zinc-200 dark:bg-zinc-900" />
                            </div>
                            <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                            <div className="w-32 h-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-md mt-2" />
                        </div>
                    ))}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4 mt-8">
                        <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                        </div>
                    </div>
                    <div className="flex gap-5 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="min-w-[260px] max-w-[300px] h-[160px] bg-white dark:bg-zinc-950 rounded-md p-5 border border-transparent dark:border-zinc-800/40 shrink-0">
                                <div className="w-32 h-5 bg-zinc-200 dark:bg-zinc-900 rounded-md mb-2" />
                                <div className="w-16 h-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-md mb-6" />
                                <div className="w-full h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md mb-3" />
                                <div className="w-16 h-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
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
                        Global control center for <span className="text-zinc-700 dark:text-zinc-300 font-medium">{data.workspaceName}</span>
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
                                    src={m.avatar || '/4092564-about-mobile-ui-profile-ui-user-website_114033.svg'}
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
                    onBadgeClick={() => setIsInviteOpen(true)}
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

            {/* In-View Workspace Invite Modal */}
            <AnimatePresence>
                {isInviteOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsInviteOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 relative overflow-hidden"
                        >
                            <button onClick={() => setIsInviteOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors z-10">
                                <X size={18} />
                            </button>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Invite Team Members</h3>
                                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed flex-1">
                                    Generate a unique invitation link to bring new members into the <span className="text-zinc-900 dark:text-white font-medium">{data?.workspaceName}</span> workspace. The link will expire in 24 hours.
                                </p>
                                
                                <div className="space-y-4">
                                    {inviteToken ? (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Share this link</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-10 px-3 flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/50 rounded-md text-sky-600 dark:text-sky-400 font-mono text-[12px] overflow-hidden whitespace-nowrap overflow-ellipsis">
                                                    {window.location.origin}/join/{inviteToken}
                                                </div>
                                                <button 
                                                    onClick={handleCopy}
                                                    className="w-10 h-10 flex items-center justify-center shrink-0 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                                                    title="Copy link"
                                                >
                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 font-medium">This link grants Member access and expires in 24 hours.</p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleGenerateInvite}
                                            disabled={isGenerating}
                                            className="w-full h-10 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold tracking-wide text-[13px] rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                                                    Generating Link...
                                                </>
                                            ) : (
                                                'Generate Invite Link'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Recent Projects Carousel ─── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">Recent Projects</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md">
                            {data.projects.length} Active
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => scroll('left')} className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => scroll('right')} className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                    {data.projects.map(project => (
                        <ProjectCard key={project.id} project={project} ptSerif={ptSerif.className} onClick={() => router.push(`/project/${project.id}`)} />
                    ))}
                    {data.projects.length === 0 && (
                        <div className="w-full py-12 flex items-center justify-center text-zinc-600 text-sm">No projects in this workspace yet.</div>
                    )}
                </div>
            </section>

            {/* ─── Bottom Grid: Team Workload + Issue Velocity ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Team Workload Table */}
                <div className="xl:col-span-8 bg-white dark:bg-zinc-950 shadow-sm rounded-md overflow-hidden border border-transparent dark:border-zinc-800/40">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <div>
                            <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">Team Workload</h2>
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
                <div className="xl:col-span-4 bg-white dark:bg-zinc-950 shadow-sm rounded-md p-6 border border-transparent dark:border-zinc-800/40 flex flex-col">
                    <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Issue Velocity</h2>
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

function StatCard({ icon, label, value, badge, badgeColor, borderColor, sub, extra, onBadgeClick }: any) {
    return (
        <div className={`bg-white dark:bg-zinc-950 rounded-md p-5 shadow-sm border border-transparent dark:border-zinc-800/40 border-l-[3px] ${borderColor} flex flex-col justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-500">{icon}</span>
                    <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400 tracking-wide">{label}</span>
                </div>
                {badge && (
                    <button 
                        onClick={onBadgeClick}
                        disabled={!onBadgeClick}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor} ${onBadgeClick ? 'hover:opacity-80 transition-opacity cursor-pointer' : 'cursor-default'}`}
                    >
                        {badge}
                    </button>
                )}
            </div>
            <div className="text-[30px] font-bold text-zinc-900 dark:text-white leading-none tracking-tight">{value}</div>
            {sub && <p className="text-[11px] text-zinc-500 mt-2">{sub}</p>}
            {extra}
        </div>
    );
}

function ProjectCard({ project, ptSerif, onClick }: { project: any, ptSerif: string, onClick?: () => void }) {
    const progressColor = project.progress >= 80 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-sky-500' : 'bg-amber-500';

    return (
        <div onClick={onClick} className="min-w-[260px] cursor-pointer max-w-[300px] bg-white dark:bg-zinc-950 rounded-md p-5 shadow-sm border border-zinc-200/60 dark:border-zinc-800/40 flex-shrink-0 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-white leading-snug">{project.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{project.key}</span>
                </div>
            </div>

            <div className="mt-4 mb-2 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Progress</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{project.progress}%</span>
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

    const avatar = member.avatar || `/4092564-about-mobile-ui-profile-ui-user-website_114033.svg`;

    const pctColor = member.pct >= 50 ? 'text-emerald-400' : member.pct >= 20 ? 'text-amber-400' : 'text-rose-400';

    return (
        <tr className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
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
                <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{member.assigned}</span>
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
