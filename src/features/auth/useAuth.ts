/**
 * useAuth — read the current auth state.
 * Components should always use this instead of poking the store directly.
 */

import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return {
    accessToken,
    user,
    isAuthenticated,
  };
}