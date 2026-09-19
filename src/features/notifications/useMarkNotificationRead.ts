/**
 * useMarkNotificationRead — mark one notification read (optimistic).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Notification } from '@/types';

interface InfiniteData {
  pages: Array<{ items: Notification[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });
      const snapshots = queryClient.getQueriesData<InfiniteData>({
        queryKey: ['notifications', 'list'],
      });

      snapshots.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<InfiniteData>(key, {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
          })),
        });
      });

      // Optimistically decrement the count
      queryClient.setQueryData<number>(QUERY_KEYS.notifications.unreadCount, (old) =>
        typeof old === 'number' ? Math.max(0, old - 1) : old
      );

      return { snapshots };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}
