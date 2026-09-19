/**
 * useUpdateProfile — update name, bio, phone, avatar.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError, UserSelf } from '@/types';

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  phone?: string | null;
  statusMessage?: string;
  avatar?: { url: string | null; publicId: string | null };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateProfile(input),

    onSuccess: (res) => {
      const updated = res.data.user;
      useAuthStore.getState().setUser(updated);
      queryClient.setQueryData<UserSelf>(QUERY_KEYS.me, updated);
      toast.success('Profile updated');
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to update profile');
    },
  });
}
