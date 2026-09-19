/**
 * useMarkAllNotificationsRead — bulk mark-read.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Notification } from '@/types';

interface InfiniteData {
  pages: Array<{ items: Notification[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.all });
      const snapshots = queryClient.getQueriesData<InfiniteData>({
        queryKey: ['notifications', 'list'],
      });

      const now = new Date().toISOString();
      snapshots.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<InfiniteData>(key, {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: now })),
          })),
        });
      });

      queryClient.setQueryData(QUERY_KEYS.notifications.unreadCount, 0);

      return { snapshots };
    },

    onError: (_err, _v, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },

    onSuccess: () => {
      toast.success('All notifications marked as read');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}
