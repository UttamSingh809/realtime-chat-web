/**
 * useNotifications — cursor-paginated list of notifications.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Notification, NotificationCategory } from '@/types';

interface Options {
  unreadOnly?: boolean;
  category?: NotificationCategory;
  pageSize?: number;
  enabled?: boolean;
}

export function useNotifications({
  unreadOnly = false,
  category,
  pageSize = 20,
  enabled = true,
}: Options = {}) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.notifications.list({ unreadOnly, category }),
    queryFn: async ({ pageParam }) => {
      const res = await notificationsApi.list({
        unreadOnly,
        category,
        limit: pageSize,
        before: pageParam as string | undefined,
      });
      return {
        items: res.data.items as Notification[],
        nextCursor: res.data.meta.nextCursor,
        hasMore: res.data.meta.hasMore,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Flatten pages, dedupe by id.
 */
export function flattenNotifications(
  pages: Array<{ items: Notification[] }> | undefined
): Notification[] {
  if (!pages || pages.length === 0) return [];
  const seen = new Set<string>();
  const out: Notification[] = [];
  for (const p of pages) {
    for (const n of p.items) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        out.push(n);
      }
    }
  }
  return out;
}
