/**
 * useMarkRead — mark a conversation as read (reset unread count).
 * Fired when a user opens a conversation.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Conversation } from '@/types';

interface Variables {
  conversationId: string;
  upToMessageId?: string;
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, upToMessageId }: Variables) =>
      conversationsApi.markRead(conversationId, upToMessageId),
    onMutate: async ({ conversationId }) => {
      // Optimistically zero out the unread count
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations.all });
      const snapshots = queryClient.getQueriesData<{ items: Conversation[] }>({
        queryKey: QUERY_KEYS.conversations.all,
      });

      snapshots.forEach(([key, data]) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((c) =>
            c.id === conversationId
              ? { ...c, myFlags: { ...c.myFlags, unreadCount: 0 } }
              : c
          ),
        });
      });

      return { snapshots };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },
  });
}