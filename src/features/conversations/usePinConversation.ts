/**
 * usePinConversation — toggle pinned flag with optimistic update.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Conversation, ApiError } from '@/types';

interface Variables {
  id: string;
  pinned: boolean;
}

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pinned }: Variables) => conversationsApi.pin(id, pinned),
    onMutate: async ({ id, pinned }) => {
      // Optimistically update all conversation lists
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations.all });

      const snapshots = queryClient.getQueriesData<{ items: Conversation[] }>({
        queryKey: QUERY_KEYS.conversations.all,
      });

      snapshots.forEach(([key, data]) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((c) =>
            c.id === id ? { ...c, myFlags: { ...c.myFlags, pinned } } : c
          ),
        });
      });

      return { snapshots };
    },
    onError: (error, _vars, context) => {
      // Rollback
      if (context?.snapshots) {
        context.snapshots.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to update pin');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },
  });
}