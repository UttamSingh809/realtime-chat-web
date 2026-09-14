/**
 * Notification endpoints.
 */

import { api } from './client';
import type {
  ApiSuccess,
  CursorResponse,
  Notification,
  NotificationCategory,
} from '@/types';

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  category?: NotificationCategory;
  limit?: number;
  before?: string;
}

export const notificationsApi = {
  list: (params: ListNotificationsParams = {}) =>
    api.get<ApiSuccess<CursorResponse<Notification>>>('/notifications', { params }),

  unreadCount: () =>
    api.get<ApiSuccess<{ unreadCount: number }>>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.put<ApiSuccess<{ notification: Notification }>>(
      `/notifications/${id}/read`
    ),

  markAllRead: () =>
    api.put<ApiSuccess<{ modifiedCount: number }>>('/notifications/read-all'),

  remove: (id: string) =>
    api.delete<ApiSuccess<{ deleted: boolean }>>(`/notifications/${id}`),

  clearAll: () =>
    api.delete<ApiSuccess<{ deletedCount: number }>>('/notifications'),
};