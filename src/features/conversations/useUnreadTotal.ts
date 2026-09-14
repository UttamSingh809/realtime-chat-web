/**
 * useUnreadTotal — derived total unread count across all conversations.
 * Reads from the React Query cache; no network call.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useConversations } from './useConversations';

export function useUnreadTotal(): number {
  const { data } = useConversations();
  if (!data?.items) return 0;
  return data.items.reduce((sum, c) => sum + (c.myFlags.unreadCount || 0), 0);
}

/**
 * Non-hook variant for use inside event handlers.
 */
export function getUnreadTotalFromCache(queryClient: ReturnType<typeof useQueryClient>): number {
  const all = queryClient.getQueriesData<{ items: Array<{ myFlags: { unreadCount: number } }> }>({
    queryKey: ['conversations'],
  });
  let total = 0;
  for (const [, data] of all) {
    if (!data?.items) continue;
    total += data.items.reduce((sum, c) => sum + (c.myFlags.unreadCount || 0), 0);
  }
  return total;
}