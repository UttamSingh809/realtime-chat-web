/**
 * useSendMessage — send a text message with optimistic insert.
 *
 * Optimistic strategy:
 *   1. Generate a temp id + a fake Message
 *   2. Append it to the last page of the infinite query
 *   3. Call the API
 *   4. On success: replace the temp with the real message
 *   5. On error:   remove the temp and surface an error
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi, type SendMessageInput } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { ApiError, Message, UserSelf } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

interface Variables {
  conversationId: string;
  content: string;
}

interface InfiniteData {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: Variables) => {
      const input: SendMessageInput = { conversationId, content };
      const res = await messagesApi.send(input);
      return res.data.message;
    },

    onMutate: async ({ conversationId, content }) => {
      if (!conversationId) throw new Error('No conversation');

      const queryKey = QUERY_KEYS.messages.history(conversationId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<InfiniteData>(queryKey);
      const myUser = useAuthStore.getState().user as UserSelf | null;

      // Build a temporary message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();

      const optimistic: Message = {
        id: tempId,
        conversationId,
        sender: myUser
          ? {
              id: myUser.id,
              name: myUser.name,
              username: myUser.username,
              avatar: myUser.avatar,
              bio: myUser.bio,
              status: myUser.status,
              statusMessage: myUser.statusMessage,
              lastSeen: myUser.lastSeen,
              createdAt: myUser.createdAt,
            }
          : { id: null },
        content,
        type: 'text',
        attachments: [],
        replyTo: null,
        forwardedFrom: null,
        reactions: {},
        readBy: [],
        deliveredTo: [],
        isEdited: false,
        editedAt: null,
        isDeleted: false,
        deletedAt: null,
        isStarred: false,
        isPinned: false,
        isSystemMessage: false,
        mentions: [],
        createdAt: now,
        updatedAt: now,
        _optimistic: true,
        _tempId: tempId,
      };

      // Append to the last page
      queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
        if (!old) {
          return {
            pages: [{ items: [optimistic], nextCursor: null, hasMore: false }],
            pageParams: [undefined],
          };
        }
        const pages = [...old.pages];
        const lastIndex = pages.length - 1;
        const last = pages[lastIndex]!;
        pages[lastIndex] = { ...last, items: [...last.items, optimistic] };
        return { ...old, pages };
      });

      return { previous, queryKey, tempId };
    },

    onError: (error, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Failed to send message');
    },

    onSuccess: (real, _vars, context) => {
      if (!context) return;
      const queryKey = context.queryKey;
      queryClient.setQueryData<InfiniteData>(queryKey, (old) => {
        if (!old) return old;
        const pages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((m) =>
            m.id === context.tempId ? real : m
          ),
        }));
        return { ...old, pages };
      });

      // Refresh conversation list so last message + unread counts update
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
    },
  });
}