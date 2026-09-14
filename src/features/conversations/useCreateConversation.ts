/**
 * useCreateConversation — create a DM or group. Handles idempotency:
 * the backend returns the existing DM if one already exists.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { conversationsApi } from '@/api';
import type { CreateConversationInput } from '@/api/conversations.api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError } from '@/types';

export function useCreateConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConversationInput) => {
      const res = await conversationsApi.create(input);
      return res.data.conversation;
    },
    onSuccess: (conversation) => {
      // Refresh the sidebar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
      // Seed the detail cache so the next page renders instantly
      queryClient.setQueryData(
        QUERY_KEYS.conversations.detail(conversation.id),
        conversation
      );
      // Navigate to the new conversation
      navigate(`/app/chat/${conversation.id}`);
      toast.success(
        conversation.type === 'group'
          ? `Group "${conversation.group?.name}" created`
          : 'Conversation started'
      );
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to create conversation');
    },
  });
}