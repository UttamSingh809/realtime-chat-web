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
import type { ApiError, Conversation } from '@/types';

interface MutationResult {
  conversation: Conversation;
  created: boolean;
}

export function useCreateConversation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateConversationInput): Promise<MutationResult> => {
      const res = await conversationsApi.create(input);
      return {
        conversation: res.data.conversation,
        created: res.data.created,
      };
    },
    onSuccess: ({ conversation, created }) => {
      // Refresh the sidebar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
      // Seed the detail cache so the next page renders instantly
      queryClient.setQueryData(QUERY_KEYS.conversations.detail(conversation.id), conversation);
      // Navigate to the new conversation
      navigate(`/app/chat/${conversation.id}`);

      // Toast policy (matches Slack/Discord/WhatsApp behavior):
      //   - Groups: always toast "Group created" (a group is always new)
      //   - New DM: toast "Conversation started"
      //   - Existing DM: no toast (silent — the user didn't "create" anything)
      if (conversation.type === 'group') {
        toast.success(`Group "${conversation.group?.name}" created`);
      } else if (created) {
        toast.success('Conversation started');
      }
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to create conversation');
    },
  });
}