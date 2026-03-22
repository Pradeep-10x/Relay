import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useProjectMembers(projectId: string | null) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
        setIsLoading(false);
        return;
    }

    let isMounted = true;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/v1/project/${projectId}/members`);
        if (!res.ok) throw new Error('Failed to fetch project members');
        
        const data = await res.json();
        if (isMounted) setMembers(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching members');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMembers();

    return () => { isMounted = false; };
  }, [projectId]);

  return { members, isLoading, error };
}
