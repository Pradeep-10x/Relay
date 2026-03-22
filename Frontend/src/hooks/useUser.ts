import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function useUser() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiFetch(`/api/v1/user/me`);

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user || data);
                }
            } catch (err: any) {
                console.error("Failed to fetch user profile", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, isLoading };
}
