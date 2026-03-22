import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useWorkspaceAnalytics() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                let workspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
                
                if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
                    throw new Error('No active workspace selected (Local Storage empty)');
                }

                // Retrieve current authenticated user to trace assignee identifiers
                const userRes = await apiFetch(`/api/v1/user/me`);
                if (!userRes.ok) throw new Error("Failed connecting to profile");
                const userData = await userRes.json();
                const userId = userData.user?.id || userData.id;

                // Load all involved projects targeting the current workspace
                const projRes = await apiFetch(`/api/v1/project/${workspaceId}`);
                if (!projRes.ok) throw new Error("Failed to sync project streams");
                const pData = await projRes.json();
                const projects = pData.projects || pData;

                let allIssues: any[] = [];

                // Filter projects strictly to subsets where the authenticated user is explicitly a member
                const activeProjects = Array.isArray(projects) ? projects.filter((p: any) => 
                    p.members && p.members.some((m: any) => m.userId === userId)
                ) : [];

                // Compile underlying issues from those active projects that are explicitly assigned to the user
                activeProjects.forEach((p: any) => {
                    if (Array.isArray(p.Issues)) {
                        const myIssues = p.Issues.filter((is: any) => is.assigneeId === userId && !is.isDeleted);
                        // Inject project metadata manually since Issue models won't have it explicitly populated here
                        myIssues.forEach((is: any) => is.project = { id: p.id, name: p.name, key: p.key });
                        allIssues.push(...myIssues);
                    }
                });

                // Compute Math Distributions based solely on the requested aggregated arrays
                let totalIssues = 0;
                let pendingIssues = 0;
                let resolvedIssues = 0;
                let tasksPerPriority: { priority: string, _count: number }[] = [];
                let recentAssignedIssues: any[] = [];
                let revenueChart: any[] = [];

                const priorityMap: Record<string, number> = {};

                allIssues.forEach((is: any) => {
                    totalIssues++;
                    const statusName = is.state?.name?.toUpperCase() || "";
                    if (["DONE", "RESOLVED", "COMPLETED"].includes(statusName)) {
                        resolvedIssues++;
                    } else {
                        pendingIssues++;
                    }

                    const pri = is.priority || "MEDIUM";
                    priorityMap[pri] = (priorityMap[pri] || 0) + 1;
                });

                Object.keys(priorityMap).forEach((key: string) => {
                    tasksPerPriority.push({ priority: key, _count: priorityMap[key] });
                });

                // Sort for Recent Assignment tables inside widget
                allIssues.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                recentAssignedIssues = allIssues.slice(0, 30);

                const projectBuckets = activeProjects.map((p: any) => {
                    const myProjectIssues = (p.Issues || []).filter((is: any) => is.assigneeId === userId && !is.isDeleted);
                    const totalAssigned = myProjectIssues.length;
                    const doneAssigned = myProjectIssues.filter((is: any) => {
                        const stName = (is.state?.name || "").toUpperCase();
                        return ["DONE", "RESOLVED", "COMPLETED"].includes(stName);
                    }).length;

                    let label = p.name || p.key || "Unknown";
                    if (label.length > 8) label = label.substring(0, 6) + '..';

                    return { month: label, profit: totalAssigned, loss: doneAssigned };
                });

                // Dynamically purge rigid elements completely to only operate on available workload mapping
                const populatedBuckets = projectBuckets.filter((b: any) => b.profit > 0 || b.loss > 0);
                populatedBuckets.sort((a, b) => b.profit - a.profit);
                const chartDataSliced = populatedBuckets.slice(0, 8);

                revenueChart.push(...chartDataSliced);

                setData({
                    totalProjects: activeProjects.length,
                    totalIssues,
                    pendingIssues,
                    resolvedIssues,
                    tasksPerPriority,
                    revenueChart,
                    recentAssignedIssues,
                    allAssignedIssues: allIssues,
                    activeProjectsList: activeProjects.filter((p: any) => {
                        return (p.Issues || []).some((is: any) => is.assigneeId === userId && !is.isDeleted);
                    }).map((p: any) => ({ id: p.id, name: p.name }))
                });
                
                // Clear obsolete error tags
                setError(null);
            } catch (err: any) {
                console.error("Dashboard Analytics Dynamic Re-Router Error:", err);
                setError(err.message || 'Error fetching data dynamically');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return { data, isLoading, error };
}
