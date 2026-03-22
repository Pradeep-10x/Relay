'use client';

import React from 'react';
import { Filter, Download, MoreHorizontal, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Fira_Sans, PT_Serif } from 'next/font/google';
import { useWorkspaceAnalytics } from '@/hooks/useWorkspaceAnalytics';
import { useProjects } from '@/hooks/useProjects';

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

export default function DashboardPage() {
    const { data, isLoading: analyticsLoading, error } = useWorkspaceAnalytics();
    const { projects, isLoading: projectsLoading } = useProjects();
    
    const [statusFilter, setStatusFilter] = React.useState('ALL');
    const [priorityFilter, setPriorityFilter] = React.useState('ALL');

    if (analyticsLoading || projectsLoading) {
        return (
            <div className={`flex-1 min-h-[calc(100vh-6rem)] w-full flex items-center justify-center`}>
                <div className="w-8 h-8 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
            </div>
        )
    }

    // if (error) {
    //     return (
    //         <div className={`p-8 w-full max-w-[1600px] mx-auto text-rose-500 font-medium`}>
    //             Error loading analytics: {error}
    //         </div>
    //     )
    // }

    // Dynamic Extractions
    const totalProjects = data?.totalProjects || 0;
    const totalIssues = data?.totalIssues || 0;
    const pendingIssues = data?.pendingIssues || 0;
    const resolvedIssues = data?.resolvedIssues || 0;

    // Traffic Donut Mapping (Priorities)
    const priorities = data?.tasksPerPriority || [];
    let highCount = 0; let mediumCount = 0; let lowCount = 0;
    priorities.forEach((p: any) => {
        if(p.priority === "HIGH") highCount = p._count;
        else if(p.priority === "MEDIUM") mediumCount = p._count;
        else if(p.priority === "LOW") lowCount = p._count;
    });

    const totalPriority = (highCount + mediumCount + lowCount) || 1;
    const pctHigh = (highCount / totalPriority) * 100;
    const pctMedium = (mediumCount / totalPriority) * 100;
    const pctLow = (lowCount / totalPriority) * 100;

    // SVG Mathematics for the Rings (Radius = 40, C = 2 * PI * 40 = 251.327)
    const circumference = 251.327;
    const dashHigh = ((pctHigh || 0) / 100) * circumference;
    const dashMed = ((pctMedium || 0) / 100) * circumference;
    const dashLow = ((pctLow || 0) / 100) * circumference;

    // Chart Scaling Calculations
    const revenueChart = data?.revenueChart || [];
    const maxRevenueRaw = Math.max(...revenueChart.map((m: any) => m.profit)) || 1;
    const maxRevenue = Math.ceil(maxRevenueRaw / 4) * 4; // Round up to nearest nice divisible number

    return (
        <div className={`p-8 w-full max-w-[1600px] mx-auto space-y-6 font-sans ${firaSans.className}`}>
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-[26px] font-semibold text-zinc-100 tracking-wide">Dashboard</h1>
                    <p className={`text-zinc-500 text-[13px] mt-1 ${ptSerif.className}`}>Here's your activity details</p>
                </div>
                
            </header>

            {/* Top Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 4 Metric Cards (Left 7 cols) */}
                <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <MetricCard 
                        title="Total Projects" 
                        value={totalProjects.toString()} 
                        pct="12.3%" 
                        trendUp={true} 
                        desc="Active across workspace"
                        iconSrc="/projects_icon_142976.svg"
                    />
                    <MetricCard 
                        title="Total Issues" 
                        value={totalIssues.toString()} 
                        pct="20.1%" 
                        trendUp={true} 
                        desc="Assigned to you"
                        iconSrc="/file.svg"
                    />
                    <MetricCard 
                        title="Pending Issues" 
                        value={pendingIssues.toString()} 
                        pct="7.6%" 
                        trendUp={false} 
                        desc="Requires attention"
                        iconSrc="/time.svg"
                    />
                    <MetricCard 
                        title="Resolved Issues" 
                        value={resolvedIssues.toString()} 
                        pct="13%" 
                        trendUp={true} 
                        desc="Completed workloads"
                        iconSrc="/done.svg"
                    />
                </div>

                {/* Revenue Chart (Right 5 cols) */}
                <div className="xl:col-span-5 bg-white dark:bg-zinc-950 shadow-sm rounded-xl p-6 flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-[14px] text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">Issue Momentum</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`text-[26px] font-semibold text-zinc-900 dark:text-white ${ptSerif.className}`}>{totalIssues} Total</span>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                                    <ArrowUpRight size={12} strokeWidth={3} />
                                    Active
                                </span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium rounded-lg hover:bg-[#323235] transition-colors border border-transparent mt-1">
                            Current
                            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" className="text-zinc-500 ml-1">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-5 text-[11px] text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                        <div className="flex items-center gap-2 relative z-20">
                            <span className="w-2 h-2 rounded-[2px] bg-zinc-900 dark:bg-zinc-100" /> Total Created
                        </div>
                        <div className="flex items-center gap-2 relative z-20">
                            <span className="w-2 h-2 rounded-[2px] bg-zinc-300 dark:bg-zinc-700/80" /> Pending
                        </div>
                    </div>

                    {/* Chart Playground */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 relative mt-2">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between -ml-8 pb-6 pointer-events-none">
                            {[4, 3, 2, 1, 0].map(val => {
                                const yVal = Math.round(maxRevenue * (val / 4));
                                return (
                                <div key={val} className="flex items-center w-full gap-4 opacity-50">
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 w-4 text-right font-medium">{yVal}</span>
                                    <div className="flex-1 border-b border-dashed border-zinc-300 dark:border-zinc-800" />
                                </div>
                            )})}
                        </div>
                        
                        {/* Dynamic Bars array */}
                        <div className="relative w-[95%] h-full flex items-end justify-between pb-6 pl-4 z-10 opacity-100 mix-blend-normal">
                            {revenueChart.map((m: any, idx: number) => {
                                const pPct = Math.max((m.profit / maxRevenue) * 100, 2);
                                const lPct = Math.max((m.loss / maxRevenue) * 100, 2);
                                return <ChartBar key={idx} month={m.month} h1={`${pPct}%`} h2={`${lPct}%`} profit={m.profit} loss={m.loss} />
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">
                
                {/* Recent Activity (Left 8 cols) */}
                <div className="xl:col-span-8 bg-white dark:bg-zinc-950 shadow-sm rounded-md flex flex-col overflow-hidden h-[400px]">
                    <div className="flex items-center justify-between p-6 pb-1">
                        <h2 className="text-[18px] font-semibold text-zinc-100">Your Issues</h2>
                        <CustomDropdown 
                            value={statusFilter} 
                            onChange={setStatusFilter} 
                            options={[
                                { value: "ALL", label: "All States", icon: "•" },
                                { value: "OPEN", label: "Open", icon: "○" },
                                { value: "IN_PROGRESS", label: "In Progress", icon: "○" },
                                { value: "REVIEW", label: "Review", icon: "○" },
                                { value: "BLOCKED", label: "Blocked", icon: "○" },
                                { value: "DONE", label: "Resolved", icon: "✓" }
                            ]}
                        />
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto px-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-zinc-950 z-10 box-shadow-b">
                                <tr className="border-b border-zinc-800/40">
                                    <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950">Issue Details</th>
                                    <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950">State</th>
                                    <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950">Identifier</th>
                                    <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950">Last Updated</th>
                                    <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 whitespace-nowrap text-right bg-white dark:bg-zinc-950">Priority</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                                {data?.recentAssignedIssues?.length > 0 ? (() => {
                                    const filtered = data.recentAssignedIssues.filter((issue: any) => {
                                        if (statusFilter === 'ALL') return true;
                                        const stateUpper = (issue.state?.name || "Pending").toUpperCase();
                                        
                                        if (statusFilter === 'OPEN') return ["OPEN", "TODO", "BACKLOG", "PENDING"].includes(stateUpper);
                                        if (statusFilter === 'IN_PROGRESS') return ["IN PROGRESS", "DOING", "IN-PROGRESS", "IN_PROGRESS", "ACTIVE"].includes(stateUpper);
                                        if (statusFilter === 'REVIEW') return ["REVIEW", "IN REVIEW", "QA", "TESTING"].includes(stateUpper);
                                        if (statusFilter === 'BLOCKED') return ["BLOCKED", "STUCK"].includes(stateUpper);
                                        if (statusFilter === 'DONE') return ["DONE", "RESOLVED", "COMPLETED"].includes(stateUpper);
                                        return true;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-[12px] font-medium text-zinc-500">
                                                    No issues matching selected state.
                                                </td>
                                            </tr>
                                        )
                                    }

                                    return filtered.map((issue: any) => {
                                        const stateName = issue.state?.name || "Pending";
                                        const snUpper = stateName.toUpperCase();
                                        
                                        let statusColor = "text-zinc-400 bg-transparent border border-zinc-500/20"; // Default (TODO/Backlog)
                                        if (["DONE", "RESOLVED", "COMPLETED"].includes(snUpper)) {
                                            statusColor = "text-emerald-400 bg-transparent border border-emerald-500/20";
                                        } else if (["BLOCKED", "STUCK"].includes(snUpper)) {
                                            statusColor = "text-rose-400 bg-transparent border border-rose-500/20";
                                        } else if (["IN PROGRESS", "DOING", "IN-PROGRESS", "IN_PROGRESS", "ACTIVE"].includes(snUpper)) {
                                            statusColor = "text-amber-400 bg-transparent border border-amber-500/20";
                                        }
                                        
                                        return (
                                            <ActivityRow 
                                                key={issue.id}
                                                name={issue.title} 
                                                email={issue.project?.name || "Unknown Project"} 
                                                avatar={`https://api.dicebear.com/7.x/initials/svg?seed=${issue.project?.key || 'PR'}`}
                                                status={stateName} 
                                                statusColor={statusColor}
                                                id={issue.key || `#${issue.id.slice(0,6)}`} 
                                                retained={new Date(issue.updatedAt).toLocaleDateString()} 
                                                amount={issue.priority || "MEDIUM"} 
                                            />
                                        )
                                    });
                                })() : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[12px] font-medium text-zinc-500">
                                            No assigned workloads detected.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Traffic Channel -> Priority Distribution (Right 4 cols) */}
                <div className="xl:col-span-4 bg-white dark:bg-zinc-950 shadow-sm rounded-xl p-7 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[15px] font-semibold text-zinc-100">Workload Priority</h2>
                        
                    </div>

                    <div className="flex-1 flex flex-row items-center justify-between w-full h-full relative pr-2">
                        {/* Dynamic SVG Donut Mapping */}
                        <div className="w-[200px] h-[200px] relative group shrink-0 ml-4 transition-transform hover:scale-[1.03] duration-500">
                            {/* Base Background Circle */}
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-sm">
                                <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-zinc-100 dark:stroke-zinc-900" strokeWidth="16" />
                                
                                {/* High Priority */}
                                <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-rose-500 dark:stroke-rose-400 drop-shadow-md" strokeWidth="16" strokeDasharray={`${dashHigh} ${circumference}`} strokeDashoffset="-1" style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                {/* Medium Priority */}
                                <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-amber-400 dark:stroke-amber-500 drop-shadow-md" strokeWidth="16" strokeDasharray={`${dashMed} ${circumference}`} strokeDashoffset={-dashHigh} style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                {/* Low Priority */}
                                <circle cx="50" cy="50" r="40" fill="transparent" className="stroke-emerald-400 dark:stroke-emerald-500 drop-shadow-md" strokeWidth="16" strokeDasharray={`${dashLow} ${circumference}`} strokeDashoffset={-(dashHigh + dashMed)} style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-white/5 dark:bg-black/5 rounded-full">
                                <span className={`text-[36px] font-bold text-zinc-900 dark:text-zinc-50 leading-none ${ptSerif.className}`}>{totalPriority}</span>
                                <span className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wide">Workloads</span>
                            </div>
                        </div>

                        {/* Interactive Legend */}
                        <div className="flex flex-col gap-4 py-4 pl-4 border-l border-zinc-100 dark:border-zinc-800/60 grow ml-4 w-auto">
                            <LegendItem color="bg-rose-500 dark:bg-rose-400" label="High Priority" count={highCount} pct={pctHigh} />
                            <LegendItem color="bg-amber-400 dark:bg-amber-500" label="Medium" count={mediumCount} pct={pctMedium} />
                            <LegendItem color="bg-emerald-400 dark:bg-emerald-500" label="Low Priority" count={lowCount} pct={pctLow} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------ Helper Components ------

function MetricCard({ title, value, pct, trendUp, desc, iconSrc }: any) {
    return (
        <div className={`group bg-white dark:bg-zinc-950 shadow-sm rounded-xl p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200 dark:border-zinc-800 flex flex-col justify-between`}>
            {/* Top Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 text-zinc-900 shadow-sm`}>
                        <img src={iconSrc} alt={title} className="w-[16px] h-[16px] opacity-75 rounded-sm" />
                    </div>
                    <div className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300 tracking-wide">{title}</div>
                </div>
                <button className="text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 transition-colors">
                    <MoreHorizontal size={14} />
                </button>
            </div>
            
            {/* Bottom Row */}
            <div className="pt-2">
                <div className={`text-[26px] font-semibold text-zinc-900 dark:text-white tracking-tight leading-none mb-3`}>
                    {value}
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
                            {trendUp ? <ArrowUpRight size={12} strokeWidth={3} className="mb-px" /> : <ArrowDownRight size={12} strokeWidth={3} className="mb-px" />}
                            {pct}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500 tracking-wide">{desc}</span>
                    </div>
                    
                    <button className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 hover:text-zinc-900 dark:text-white transition-colors group/btn">
                        View Report <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform text-zinc-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChartBar({ month, h1, h2, profit, loss }: { month: string, h1: string, h2: string, profit: number, loss: number }) {
    return (
        <div className="flex flex-col items-center gap-2.5 w-full group relative h-full justify-end z-[50]">
            <div className="w-full flex items-end justify-center gap-[4px] sm:gap-[6px] h-[calc(100%-1.5rem)] relative cursor-pointer z-50">
                {/* Tooltip Overlay */}
                <div className="absolute -top-12 z-[100] flex flex-col items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10.5px] px-2.5 py-1.5 rounded-[6px] whitespace-nowrap font-medium flex flex-col gap-[3px] shadow-xl relative min-w-max">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-[2px] bg-white dark:bg-zinc-900" /> {profit} Created</span>
                        <span className="flex items-center gap-1.5 text-zinc-300 dark:text-zinc-600"><span className="w-1.5 h-1.5 rounded-[2px] bg-zinc-500 dark:bg-zinc-400" /> {loss} Pending</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-white rotate-45" />
                    </div>
                </div>

                {/* Main Bar (Profit -> Total Created) */}
                <div style={{ height: h1 }} className={`w-[14px] sm:w-[18px] bg-zinc-900 dark:bg-zinc-100 rounded-t-[4px] opacity-90 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom z-30`} />
                {/* Secondary Bar (Loss -> Pending) */}
                <div style={{ height: h2 }} className={`w-[14px] sm:w-[18px] bg-zinc-300 dark:bg-zinc-700/80 rounded-t-[4px] opacity-[0.85] group-hover:opacity-100 group-hover:bg-rose-400 dark:group-hover:bg-rose-500 transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom z-30`} />
            </div>
            <span className="text-[11px] text-zinc-500 font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors cursor-pointer">{month}</span>
        </div>
    )
}

function LegendItem({ color, label, count, pct }: any) {
    return (
        <div className="flex items-center gap-3 py-1 group cursor-default">
            <span className={`w-[13px] h-[13px] rounded-full shadow-inner ${color} group-hover:scale-[1.15] transition-transform duration-300 pointer-events-none`} />
            <div className="flex flex-col gap-0.5">
                <span className="text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{label}</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                    {count || 0} issues &bull; {Math.round(pct || 0)}%
                </span>
            </div>
        </div>
    )
}

function CustomDropdown({ value, onChange, options }: any) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o: any) => o.value === value) || options[0];

    return (
        <div className="relative" tabIndex={0} onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
        }}>
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11.5px] font-medium rounded-lg px-3 py-1.5 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 group cursor-pointer select-none"
            >
                <div className="flex items-center gap-2"><span className="text-zinc-400 dark:text-zinc-500 font-bold">{selected.icon}</span> <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{selected.label}</span></div>
                <svg width="8" height="5" viewBox="0 0 10 6" fill="none" className={`text-zinc-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <div 
                className={`absolute top-full right-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xl shadow-zinc-200/50 dark:shadow-black/40 p-1 flex items-center flex-col z-[100] transition-all duration-200 origin-top overflow-hidden select-none ${open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}
            >
                {options.map((opt: any) => (
                    <button 
                        key={opt.value}
                        onClick={() => { onChange(opt.value); setOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-left text-[11.5px] font-medium transition-all duration-200 ${value === opt.value ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 translate-x-0' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:translate-x-1'}`}
                    >
                        <span className={`text-[12px] font-bold ${value === opt.value ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-600'}`}>{opt.icon}</span>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function ActivityRow({ name, email, status, statusColor, id, retained, amount }: any) {
    return (
        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group relative cursor-pointer">
            <td className="px-6 py-[18px]">
                <div className="flex items-center gap-3.5">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{name}</span>
                        <span className="text-[11px] text-zinc-500">{email}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-[18px]">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-[4px] ${statusColor}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-[18px]">
                <span className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{id}</span>
            </td>
            <td className="px-6 py-[18px]">
                <span className="text-[12px] font-medium text-zinc-500">{retained}</span>
            </td>
            <td className="px-6 py-[18px] text-right">
                <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">{amount}</span>
            </td>
        </tr>
    )
}
