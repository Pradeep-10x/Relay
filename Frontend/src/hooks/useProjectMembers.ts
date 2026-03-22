import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useProjectMembers(projectId: string | null) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const res = await apiFetch(`/api/v1/project/${projectId}/members`);
      if (!res.ok) throw new Error('Failed to fetch project members');
      
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, isLoading, error, refresh: fetchMembers };
}
