/**
 * useArchiveConversation — toggle archived flag.
 * Removes the conversation from the current list (optimistic).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Conversation, ApiError } from '@/types';

interface Variables {
  id: string;
  archived: boolean;
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archived }: Variables) => conversationsApi.archive(id, archived),
    onMutate: async ({ id, archived }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations.all });

      const snapshots = queryClient.getQueriesData<{ items: Conversation[] }>({
        queryKey: QUERY_KEYS.conversations.all,
      });

      snapshots.forEach(([key, data]) => {
        if (!data?.items) return;
        // Remove from the current list — a subsequent refetch will re-add
        // it to the right list (archived or not).
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((c) => c.id !== id),
        });
      });

      return { snapshots };
    },
    onError: (error, _vars, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to update archive');
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.archived ? 'Conversation archived' : 'Conversation unarchived');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },
  });
}