import React from 'react';
import { useProjectAnalytics } from '@/hooks/useProjectAnalytics';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function ProjectAnalyticsView({ projectId }: { projectId: string }) {
    const { analytics, isLoading, error } = useProjectAnalytics(projectId);

    if (isLoading) {
        return (
            <div className="px-6 py-6 w-full max-w-7xl mx-auto space-y-6 animate-pulse mt-4">
                <div>
                    <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-900 rounded-md mb-2" />
                    <div className="w-64 h-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-5 rounded-lg border border-transparent dark:border-zinc-800/40 bg-white dark:bg-zinc-950 h-[130px] flex flex-col justify-between">
                            <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                            <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-8 border-t border-zinc-800/40 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-900 rounded-md" />
                        <div className="w-32 h-32 rounded-full border-[12px] border-zinc-200 dark:border-zinc-900" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
                <p>Failed to load analytics</p>
            </div>
        );
    }

    const ratePct = (analytics.completionRate * 100).toFixed(0);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (analytics.completionRate * circumference);

    return (
        <div className="px-6 py-6 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Telemetry</h2>
                <p className="text-[13px] text-zinc-600 dark:text-zinc-500">High-level metrics and issue progression states.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Total Issues</span>
                    </div>
                    <div className="text-[32px] font-black text-zinc-900 dark:text-white">{analytics.totalIssues}</div>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 shadow-sm flex flex-col justify-between h-[130px]">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Completed</span>
                    </div>
                    <div className="text-[32px] font-black text-emerald-600 dark:text-emerald-500">{analytics.completedIssues}</div>
                </div>

                {/* Metric 3 (Chart) */}
                <div className="md:col-span-2 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm flex items-center gap-8 h-[130px]">
                    <div className="relative w-[70px] h-[70px] flex-shrink-0">
                        <svg className="w-full h-full -rotate-90 drop-shadow-md">
                            <circle cx="35" cy="35" r={radius} fill="none" className="stroke-zinc-100 dark:stroke-zinc-900" strokeWidth="6" />
                            <circle 
                                cx="44" cy="44" r={radius} 
                                fill="none" 
                                className="stroke-sky-500 transition-all duration-1000 ease-out" 
                                strokeWidth="8" 
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[15px] font-black text-zinc-900 dark:text-white">{ratePct}%</span>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-200">Completion Velocity</h4>
                        <p className="text-[12px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                            {ratePct}% of absolute project scope has currently progressed linearly to Done states.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Issues Per State */}
               <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm">
                   <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Distribution by State</h3>
                   <div className="space-y-5">
                       {analytics.issuesPerState?.map((item: any, i: number) => (
                           <div key={i} className="flex flex-col gap-2">
                               <div className="flex items-center justify-between text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                   <span>{item.stateId}</span>
                                   <span>{item._count}</span>
                               </div>
                               <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-sky-500 rounded-full" 
                                      style={{ width: `${(item._count / analytics.totalIssues) * 100}%` }} 
                                   />
                               </div>
                           </div>
                       ))}
                       {analytics.issuesPerState?.length === 0 && (
                           <div className="text-[12px] text-zinc-500">No issues indexed.</div>
                       )}
                   </div>
               </div>
               
               {/* Workload */}
               <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm">
                   <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Active Workload</h3>
                   <div className="space-y-0">
                       {analytics.tasksPerUser?.map((item: any, i: number) => (
                           <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 px-2 -mx-2 rounded-md transition-colors">
                               <span className="text-[12px] font-bold text-zinc-800 dark:text-zinc-300">{item.assigneeId}</span>
                               <span className="text-[10px] font-bold font-mono text-zinc-500 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded">
                                   {item._count} issues
                               </span>
                           </div>
                       ))}
                       {analytics.tasksPerUser?.length === 0 && (
                           <div className="text-[13px] text-zinc-500">No assigned tasks indexed.</div>
                       )}
                   </div>
               </div>
            </div>
        </div>
    );
}
