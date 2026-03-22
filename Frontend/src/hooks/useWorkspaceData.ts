import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '@/lib/api';

export interface WorkspaceMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        username: string;
    };
}

export interface Issue {
    id: string;
    title: string;
    assigneeId: string | null;
    state: {
        name: string;
    };
    assignee?: {
        id: string;
        name: string;
        avatar: string | null;
    } | null;
}

export interface Project {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    Issues: Issue[];
    members: any[];
}

export function useWorkspaceData() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
        if (!workspaceId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [projectsRes, membersRes] = await Promise.all([
                apiFetch(`/api/v1/project/${workspaceId}`),
                apiFetch(`/api/v1/workspace/${workspaceId}/members`)
            ]);

            if (projectsRes.ok) {
                const pData = await projectsRes.json();
                setProjects(pData || []);
            }
            if (membersRes.ok) {
                const mData = await membersRes.json();
                setMembers(mData.members || []);
            }
        } catch (error) {
            console.error("Failed to fetch workspace data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const metrics = useMemo(() => {
        let issuesCreated = 0;
        let issuesResolved = 0;

        projects.forEach(p => {
            issuesCreated += p.Issues.length;
            issuesResolved += p.Issues.filter(i => 
                i.state.name.toUpperCase() === 'DONE' || i.state.name.toUpperCase() === 'RESOLVED'
            ).length;
        });

        // Compute member workload
        const workloadMap: Record<string, { assigned: number, resolved: number, user: any }> = {};
        members.forEach(m => {
            workloadMap[m.user.id] = { assigned: 0, resolved: 0, user: m.user };
        });

        projects.forEach(p => {
            p.Issues.forEach(i => {
                if (i.assigneeId && workloadMap[i.assigneeId]) {
                    workloadMap[i.assigneeId].assigned += 1;
                    if (i.state.name.toUpperCase() === 'DONE' || i.state.name.toUpperCase() === 'RESOLVED') {
                        workloadMap[i.assigneeId].resolved += 1;
                    }
                }
            });
        });

        const sortedWorkload = Object.values(workloadMap)
            .sort((a, b) => b.assigned - a.assigned); // Most assigned first

        return {
            issuesCreated,
            issuesResolved,
            activeProjects: projects.length,
            totalMembers: members.length,
            memberWorkload: sortedWorkload
        };
    }, [projects, members]);

    return { projects, members, metrics, isLoading, refresh: fetchData };
}
