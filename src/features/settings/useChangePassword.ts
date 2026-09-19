/**
 * useChangePassword — change the current user's password.
 *
 * On success, the backend invalidates all refresh tokens, so we clear
 * the local auth state and redirect to login.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types';

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),

    onSuccess: () => {
      toast.success('Password changed. Please sign in again.');
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      navigate('/login', { replace: true });
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to change password');
    },
  });
}
