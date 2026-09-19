/**
 * useBlockedUsers — list + unblock.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, UserPublic } from '@/types';

export function useBlockedUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.blocked,
    queryFn: async () => {
      const res = await usersApi.listBlocked();
      return res.data.users as UserPublic[];
    },
    staleTime: 60 * 1000,
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.unblock(userId),
    onSuccess: (_res, userId) => {
      queryClient.setQueryData<UserPublic[]>(QUERY_KEYS.users.blocked, (old) =>
        old ? old.filter((u) => u.id !== userId) : old
      );
      toast.success('User unblocked');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to unblock');
    },
  });
}
