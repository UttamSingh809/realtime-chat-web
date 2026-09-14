/**
 * useRemoveReaction — remove my reaction from a message.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, Message } from '@/types';

interface Variables {
  messageId: string;
  conversationId: string;
}

interface InfiniteMessages {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

function applyRemoveReaction(message: Message): Message {
  const reactions = { ...(message.reactions || {}) };

  for (const key of Object.keys(reactions)) {
    const entry = reactions[key]!;
    if (entry.mine) {
      if (entry.count <= 1) {
        delete reactions[key];
      } else {
        reactions[key] = { count: entry.count - 1, mine: false };
      }
    }
  }

  return { ...message, reactions };
}

export function useRemoveReaction(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }: Variables) =>
      messagesApi.removeReaction(messageId),

    onMutate: async ({ messageId, conversationId }) => {
      const key = QUERY_KEYS.messages.history(conversationId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<InfiniteMessages>(key);

      queryClient.setQueryData<InfiniteMessages>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === messageId ? applyRemoveReaction(m) : m
            ),
          })),
        };
      });

      return { previous, key };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to remove reaction');
    },

    onSettled: () => {
      if (!conversationId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.history(conversationId),
      });
    },
  });
}