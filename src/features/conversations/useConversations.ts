/**
 * useConversations — fetch the current user's conversations.
 *
 * Paginated with cursor-based pagination. For now we fetch the first page
 * (30 items). Infinite scroll comes later if needed.
 */

import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Conversation } from '@/types';

interface Options {
  archived?: boolean;
  limit?: number;
  enabled?: boolean;
}

export function useConversations(options: Options = {}) {
  const { archived = false, limit = 50, enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.conversations.list({ archived }),
    queryFn: async () => {
      const res = await conversationsApi.list({ archived, limit });
      return res.data;
    },
    enabled,
    staleTime: 30 * 1000,
    select: (data) => ({
      items: data.items as Conversation[],
      meta: data.meta,
    }),
  });
}