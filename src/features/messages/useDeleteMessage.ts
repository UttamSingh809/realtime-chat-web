/**
 * useDeleteMessage — delete a message for me or for everyone.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi, type DeleteScope } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, Message } from '@/types';

interface Variables {
  messageId: string;
  scope: DeleteScope;
}

interface InfiniteData {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

export function useDeleteMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, scope }: Variables) =>
      messagesApi.remove(messageId, scope),

    onSuccess: (_res, { messageId, scope }) => {
      if (!conversationId) return;
      const queryKey = QUERY_KEYS.messages.history(conversationId);

      if (scope === 'me') {
        // Remove from the local cache entirely
        queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((m) => m.id !== messageId),
            })),
          };
        });
      } else {
        // Mark as deleted in place (tombstone)
        queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === messageId
                  ? { ...m, isDeleted: true, content: '', attachments: [] }
                  : m
              ),
            })),
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to delete message');
    },
  });
}