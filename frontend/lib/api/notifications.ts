import { apiClient } from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  delivered: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  delivered: number;
  by_type: Record<string, number>;
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadNotificationCount(
  userId: string,
  accessToken: string
): Promise<number> {
  try {
    const response = await apiClient.get<{ unreadCount?: unknown }>(
      `/api/notifications/user/${userId}/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return typeof response?.unreadCount === 'number' && Number.isFinite(response.unreadCount)
      ? response.unreadCount
      : 0;
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    return 0;
  }
}

/**
 * Get user notification statistics
 */
export async function getNotificationStats(
  userId: string,
  accessToken: string
): Promise<NotificationStats | null> {
  try {
    const response = await apiClient.get(
      `/api/notifications/user/${userId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch notification stats:', error);
    return null;
  }
}

/**
 * Get notifications with pagination
 */
export async function getNotifications(
  params: {
    userId: string;
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  },
  accessToken: string
): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
  try {
    const queryParams = new URLSearchParams({
      user_id: params.userId,
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      ...(params.type && { type: params.type }),
      ...(params.read !== undefined && { read: String(params.read) }),
    });

    const response = await apiClient.get(`/api/notifications?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  accessToken: string
): Promise<boolean> {
  try {
    await apiClient.patch(
      `/api/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string,
  accessToken: string
): Promise<boolean> {
  try {
    await apiClient.post(
      `/api/notifications/user/${userId}/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return false;
  }
}
