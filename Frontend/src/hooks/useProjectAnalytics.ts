import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useProjectAnalytics(projectId: string | null) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
        setIsLoading(false);
        return;
    }

    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch(`/api/v1/projects/${projectId}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch project analytics');
        
        const data = await res.json();
        if (isMounted) setAnalytics(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching analytics');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalytics();

    return () => { isMounted = false; };
  }, [projectId]);

  return { analytics, isLoading, error };
}
