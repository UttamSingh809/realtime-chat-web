/**
 * useAddReaction — add (or replace) my reaction on a message.
 *
 * Rules:
 *   - One reaction per user per message. Adding a different emoji replaces
 *     my previous reaction.
 *   - Optimistic: update cache immediately, roll back on error.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError, Message } from '@/types';

interface Variables {
  messageId: string;
  conversationId: string;
  emoji: string;
}

interface InfiniteMessages {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

function applyAddReaction(
  message: Message,
  emoji: string,
  myUserId: string
): Message {
  const reactions = { ...(message.reactions || {}) };

  // 1. Remove any existing reaction by me (one-per-user rule)
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

  // 2. Add the new emoji
  const existing = reactions[emoji];
  if (existing) {
    reactions[emoji] = { count: existing.count + 1, mine: true };
  } else {
    reactions[emoji] = { count: 1, mine: true };
  }

  void myUserId; // reserved for future per-user tracking
  return { ...message, reactions };
}

export function useAddReaction(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: Variables) =>
      messagesApi.addReaction(messageId, emoji),

    onMutate: async ({ messageId, conversationId, emoji }) => {
      const myUser = useAuthStore.getState().user;
      if (!myUser) return {};

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
              m.id === messageId ? applyAddReaction(m, emoji, myUser.id) : m
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
      toast.error(apiError.message || 'Failed to add reaction');
    },

    onSettled: () => {
      if (!conversationId) return;
      // The socket broadcast will also update the cache — the invalidate
      // here just ensures consistency in case we missed it.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.history(conversationId),
      });
    },
  });
}