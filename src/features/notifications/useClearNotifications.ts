/**
 * useClearNotifications — delete all notifications.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationsApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';

export function useClearNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      toast.success('Notifications cleared');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      queryClient.setQueryData(QUERY_KEYS.notifications.unreadCount, 0);
    },
    onError: () => {
      toast.error('Failed to clear notifications');
    },
  });
}
