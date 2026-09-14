/**
 * useConversation — fetch a single conversation by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.conversations.detail(id ?? ''),
    queryFn: async () => {
      const res = await conversationsApi.getById(id!);
      return res.data.conversation;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}