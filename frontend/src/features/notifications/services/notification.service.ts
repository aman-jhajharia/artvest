import { ApiResponse } from '@/types';
import {
  NotificationItem,
  NotificationPagination,
  UnreadCountResponse,
} from '../types/notification.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GetNotificationsApiResponse extends ApiResponse<NotificationItem[]> {
  pagination?: NotificationPagination;
}

export class NotificationApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      return {
        success: false,
        message: 'Network error or service unreachable',
        error: {
          code: 'NETWORK_ERROR',
          details: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date().toISOString(),
      } as unknown as T;
    }
  }

  /**
   * Retrieves paginated notifications for the authenticated user.
   */
  public static async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<GetNotificationsApiResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.unreadOnly) query.append('unreadOnly', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<GetNotificationsApiResponse>(`/notifications${qs}`, {
      method: 'GET',
    });
  }

  /**
   * Fetches real-time unread notifications count.
   */
  public static async getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
    return this.request<ApiResponse<UnreadCountResponse>>('/notifications/unread-count', {
      method: 'GET',
    });
  }

  /**
   * Marks a specific notification as read.
   */
  public static async markAsRead(notificationId: string): Promise<ApiResponse<NotificationItem>> {
    return this.request<ApiResponse<NotificationItem>>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Marks all unread notifications as read.
   */
  public static async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/notifications/read-all', {
      method: 'PATCH',
    });
  }
}
