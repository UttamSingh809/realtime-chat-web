/**
 * useEditMessage — edit a text message.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, Message } from '@/types';

interface Variables {
  messageId: string;
  content: string;
}

interface InfiniteData {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

export function useEditMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: Variables) =>
      messagesApi.edit(messageId, content).then((r) => r.data.message),

    onSuccess: (updated) => {
      if (!conversationId) return;
      const queryKey = QUERY_KEYS.messages.history(conversationId);
      queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => (m.id === updated.id ? updated : m)),
          })),
        };
      });
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to edit message');
    },
  });
}