/**
 * useUser — fetch a single user by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { UserPublic } from '@/types';

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id ?? ''),
    queryFn: async () => {
      const res = await usersApi.getById(id!);
      return res.data.user as UserPublic;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}