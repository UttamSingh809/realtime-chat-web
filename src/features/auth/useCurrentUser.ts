/**
 * useCurrentUser — fetch /auth/me when the user is authenticated.
 * Keeps the auth store's `user` field in sync with the server.
 */

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import { QUERY_KEYS } from '@/lib/constants';
import type { UserSelf } from '@/types';

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => {
      const res = await authApi.me();
      setUser(res.data.user);
      return res.data.user;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    select: (data): UserSelf => data,
  });
}