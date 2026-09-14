/**
 * useLogin — login mutation. Populates the auth store on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginInput } from './schemas';
import type { ApiError } from '@/types';

interface Options {
  onSuccessRedirect?: string;
}

export function useLogin(options: Options = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await authApi.login(input);
      return res.data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.accessToken, data.user);
      queryClient.clear(); // fresh slate for the new user
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(options.onSuccessRedirect ?? '/app', { replace: true });
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Login failed');
    },
  });
}
