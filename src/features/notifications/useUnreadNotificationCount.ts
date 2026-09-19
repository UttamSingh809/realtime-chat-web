/**
 * useUnreadNotificationCount — badge count for the bell icon.
 * Refetches on socket invalidation.
 */

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: async () => {
      const res = await notificationsApi.unreadCount();
      return res.data.unreadCount;
    },
    staleTime: 30 * 1000,
  });
}
