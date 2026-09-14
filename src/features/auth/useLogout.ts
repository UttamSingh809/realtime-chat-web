/**
 * useLogout — calls the backend to revoke the session, then clears local state.
 * Idempotent: safe to call even if the backend call fails.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignore — local logout must always succeed
      }
    },
    onSettled: () => {
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      toast.success('Signed out');
      navigate('/login', { replace: true });
    },
  });
}