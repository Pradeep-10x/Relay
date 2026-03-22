import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useProjects() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('activeWorkspaceId') : null;
                if (!workspaceId) {
                    setIsLoading(false);
                    return;
                }

                const res = await apiFetch(`/api/v1/project/${workspaceId}`);

                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.projects || []);
                }
            } catch (err: any) {
                console.error("Failed to fetch workspace projects", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return { projects, isLoading };
}
