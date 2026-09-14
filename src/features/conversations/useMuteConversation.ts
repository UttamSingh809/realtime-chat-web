/**
 * useMuteConversation — toggle muted flag.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { conversationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Conversation, ApiError } from '@/types';

interface Variables {
  id: string;
  muted: boolean;
}

export function useMuteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, muted }: Variables) => conversationsApi.mute(id, muted),
    onMutate: async ({ id, muted }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.conversations.all });
      const snapshots = queryClient.getQueriesData<{ items: Conversation[] }>({
        queryKey: QUERY_KEYS.conversations.all,
      });

      snapshots.forEach(([key, data]) => {
        if (!data?.items) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((c) =>
            c.id === id ? { ...c, myFlags: { ...c.myFlags, muted } } : c
          ),
        });
      });

      return { snapshots };
    },
    onError: (error, _vars, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to update mute');
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.muted ? 'Conversation muted' : 'Conversation unmuted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },
  });
}