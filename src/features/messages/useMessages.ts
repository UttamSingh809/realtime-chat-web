/**
 * useMessages — infinite message history for a conversation.
 *
 * The backend returns messages newest-first, cursor-paginated. We reverse
 * each page to render oldest → newest in the UI.
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { messagesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import { DEFAULT_MESSAGE_PAGE_SIZE } from '@/lib/constants';
import type { Message } from '@/types';

interface Options {
  conversationId: string | undefined;
  pageSize?: number;
  enabled?: boolean;
}

export function useMessages({
  conversationId,
  pageSize = DEFAULT_MESSAGE_PAGE_SIZE,
  enabled = true,
}: Options) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.messages.history(conversationId ?? ''),
    queryFn: async ({ pageParam }) => {
      const res = await messagesApi.getHistory(conversationId!, {
        limit: pageSize,
        before: pageParam as string | undefined,
      });
      return {
        items: [...res.data.items].reverse() as Message[], // oldest → newest
        nextCursor: res.data.meta.nextCursor,
        hasMore: res.data.meta.hasMore,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
    enabled: !!conversationId && enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Flatten the infinite pages into a single oldest-first array.
 * Also deduplicates by id in case of overlapping fetches.
 */
export function flattenMessages(
  pages: Array<{ items: Message[] }> | undefined
): Message[] {
  if (!pages || pages.length === 0) return [];
  // Pages arrive newest-batch first; we want oldest → newest overall.
  // Each page is already oldest → newest internally, so reverse page order.
  const all: Message[] = [];
  const seen = new Set<string>();
  for (let i = pages.length - 1; i >= 0; i--) {
    for (const m of pages[i]!.items) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        all.push(m);
      }
    }
  }
  return all;
}