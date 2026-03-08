import { useState, useCallback } from "react";

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
    }, []);

    const markAsRead = async (id: string) => {
    };

    const markAllAsRead = async () => {
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: refreshNotifications
    };
}
