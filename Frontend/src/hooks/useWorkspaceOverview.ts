'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface MemberWorkload {
    userId: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    assigned: number;
    resolved: number;
    remaining: number;
    pct: number;
}

interface ProjectSummary {
    id: string;
    name: string;
    key: string;
    status: string;
    totalIssues: number;
    resolvedIssues: number;
    progress: number;
    memberCount: number;
}

interface WorkspaceOverviewData {
    workspaceName: string;
    totalProjects: number;
    activeMembers: number;
    totalIssues: number;
    resolvedIssues: number;
    resolvedPct: number;
    completionRate: number;
    projects: ProjectSummary[];
    members: MemberWorkload[];
    memberAvatars: { name: string; avatar: string }[];
}

export function useWorkspaceOverview() {
    const [data, setData] = useState<WorkspaceOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
                if (!workspaceId || workspaceId === 'undefined') throw new Error('No active workspace');

                // Parallel fetch: projects, members, workspaces (for name)
                const [projRes, membersRes, wsRes] = await Promise.all([
                    apiFetch(`/api/v1/project/${workspaceId}`),
                    apiFetch(`/api/v1/workspace/${workspaceId}/members`),
                    apiFetch(`/api/v1/workspace/`),
                ]);

                if (!projRes.ok) throw new Error('Failed to load projects');
                if (!membersRes.ok) throw new Error('Failed to load members');

                const projData = await projRes.json();
                const membersData = await membersRes.json();
                const wsData = wsRes.ok ? await wsRes.json() : { workspaces: [] };

                const projects = projData.projects || projData || [];
                const members = membersData.members || membersData || [];
                const workspace = (wsData.workspaces || []).find((w: any) => w.id === workspaceId);
                const workspaceName = workspace?.name || 'Workspace';

                // Compute project summaries
                let totalIssuesAll = 0;
                let resolvedIssuesAll = 0;

                const projectSummaries: ProjectSummary[] = projects.map((p: any) => {
                    const issues = (p.Issues || []).filter((i: any) => !i.isDeleted);
                    const total = issues.length;
                    const resolved = issues.filter((i: any) => {
                        const st = (i.state?.name || '').toUpperCase();
                        return ['DONE', 'RESOLVED', 'COMPLETED'].includes(st);
                    }).length;

                    totalIssuesAll += total;
                    resolvedIssuesAll += resolved;

                    const progress = total > 0 ? Math.round((resolved / total) * 100) : 0;
                    const status = progress === 100 ? 'COMPLETED' : progress > 0 ? 'ACTIVE' : 'PLANNING';

                    return {
                        id: p.id,
                        name: p.name || 'Untitled',
                        key: p.key || '',
                        status,
                        totalIssues: total,
                        resolvedIssues: resolved,
                        progress,
                        memberCount: (p.members || []).length,
                    };
                });

                // Compute member workloads by scanning all project issues
                const memberMap: Record<string, MemberWorkload> = {};

                members.forEach((m: any) => {
                    const u = m.user || {};
                    memberMap[u.id] = {
                        userId: u.id,
                        name: u.name || 'Unknown',
                        email: u.email || '',
                        avatar: u.avatar || null,
                        role: m.role || 'MEMBER',
                        assigned: 0,
                        resolved: 0,
                        remaining: 0,
                        pct: 0,
                    };
                });

                projects.forEach((p: any) => {
                    (p.Issues || []).filter((i: any) => !i.isDeleted).forEach((issue: any) => {
                        const assigneeId = issue.assigneeId;
                        if (assigneeId && memberMap[assigneeId]) {
                            memberMap[assigneeId].assigned++;
                            const st = (issue.state?.name || '').toUpperCase();
                            if (['DONE', 'RESOLVED', 'COMPLETED'].includes(st)) {
                                memberMap[assigneeId].resolved++;
                            } else {
                                memberMap[assigneeId].remaining++;
                            }
                        }
                    });
                });

                const memberWorkloads = Object.values(memberMap).map(m => ({
                    ...m,
                    pct: m.assigned > 0 ? Math.round((m.resolved / m.assigned) * 100) : 0,
                }));

                memberWorkloads.sort((a, b) => b.assigned - a.assigned);

                const resolvedPct = totalIssuesAll > 0 ? Math.round((resolvedIssuesAll / totalIssuesAll) * 100) : 0;

                // Completion rate: average of all project completion percentages
                const completionRate = projectSummaries.length > 0
                    ? Math.round(projectSummaries.reduce((s, p) => s + p.progress, 0) / projectSummaries.length)
                    : 0;

                const memberAvatars = memberWorkloads.slice(0, 5).map(m => ({
                    name: m.name,
                    avatar: m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`,
                }));

                setData({
                    workspaceName,
                    totalProjects: projectSummaries.length,
                    activeMembers: memberWorkloads.length,
                    totalIssues: totalIssuesAll,
                    resolvedIssues: resolvedIssuesAll,
                    resolvedPct,
                    completionRate,
                    projects: projectSummaries,
                    members: memberWorkloads,
                    memberAvatars,
                });
                setError(null);
            } catch (err: any) {
                console.error('Workspace overview fetch error:', err);
                setError(err.message || 'Failed to load workspace data');
            } finally {
                setIsLoading(false);
            }
        };

        fetch_();
    }, []);

    return { data, isLoading, error };
}
