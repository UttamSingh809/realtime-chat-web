/**
 * useUpdateSettings — update notifications, privacy, theme, language.
 * Merges fields deep — the backend merges partials.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError, UserSelf, UserSettings } from '@/types';

export type UpdateSettingsInput = {
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  theme?: UserSettings['theme'];
  language?: string;
};

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => usersApi.updateSettings(input),

    onSuccess: (res) => {
      const updated = res.data.user;
      useAuthStore.getState().setUser(updated);
      queryClient.setQueryData<UserSelf>(QUERY_KEYS.me, updated);
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to update settings');
    },
  });
}
