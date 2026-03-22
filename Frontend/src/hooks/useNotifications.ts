import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export interface NotificationItem {
    id: string;
    type: string;
    read: boolean;
    createdAt: string;
    issue?: {
        id: string;
        title: string;
    };
    comment?: any;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await apiFetch(`/api/v1/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data || []);
            }
        } catch (err: any) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
        } catch (err) {
            console.error("Failed to mark as read", err);
            // Revert changes on error (ideally)
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        // Mark all conceptually
        for (const id of unreadIds) {
            try {
                await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
            } catch (err) {
                console.error("Failed to run bulk read", err);
            }
        }
    };

    return { notifications, isLoading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}
