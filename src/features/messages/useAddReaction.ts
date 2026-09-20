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

/**
 * Apply a reaction by me to a message.
 *
 * Rule: one reaction per user. So this removes any existing `mine` reaction,
 * then adds the new emoji. Idempotent — clicking the same emoji I already
 * have is a no-op.
 */
function applyAddReaction(message: Message, emoji: string): Message {
  const reactions = { ...(message.reactions || {}) };

  // If this emoji is already my reaction, do nothing.
  if (reactions[emoji]?.mine) {
    return message;
  }

  // Remove any existing reaction marked as mine
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

  // Add the new emoji
  const existing = reactions[emoji];
  if (existing) {
    reactions[emoji] = { count: existing.count + 1, mine: true };
  } else {
    reactions[emoji] = { count: 1, mine: true };
  }

  return { ...message, reactions };
}

export function useAddReaction(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: Variables) =>
      messagesApi.addReaction(messageId, emoji),

    onMutate: async ({ messageId, conversationId: cid, emoji }) => {
      void conversationId; // outer param is unused; use cid from variables
      const myUser = useAuthStore.getState().user;
      if (!myUser) return {};

      const key = QUERY_KEYS.messages.history(cid);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<InfiniteMessages>(key);

      queryClient.setQueryData<InfiniteMessages>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) =>
              m.id === messageId ? applyAddReaction(m, emoji) : m
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

    // NOTE: No onSettled invalidate. The socket echo handles cross-user
    // sync; for me, the optimistic update above is authoritative.
  });
}