/**
 * useRegister — register mutation. Populates the auth store on success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import type { RegisterInput } from './schemas';
import type { ApiError } from '@/types';

export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await authApi.register(input);
      return res.data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.accessToken, data.user);
      queryClient.clear();
      toast.success(`Account created. Welcome, ${data.user.name.split(' ')[0]}!`);
      navigate('/app', { replace: true });
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Registration failed');
    },
  });
}