/**
 * useMutedUsers — list + unmute.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, UserPublic } from '@/types';

export function useMutedUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.muted,
    queryFn: async () => {
      const res = await usersApi.listMuted();
      return res.data.users as UserPublic[];
    },
    staleTime: 60 * 1000,
  });
}

export function useUnmuteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.unmute(userId),
    onSuccess: (_res, userId) => {
      queryClient.setQueryData<UserPublic[]>(QUERY_KEYS.users.muted, (old) =>
        old ? old.filter((u) => u.id !== userId) : old
      );
      toast.success('User unmuted');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to unmute');
    },
  });
}
