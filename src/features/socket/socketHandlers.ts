/**
 * Socket event handlers — pure cache transforms.
 *
 * Each handler receives the event payload + the query client and
 * updates one or more caches. No component logic here.
 */

import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { Message, Conversation, Notification, UserStatus } from '@/types';
import type {
  MessageNewEvent,
  MessageEditedEvent,
  MessageDeletedEvent,
  MessageReactionEvent,
  MessageReadEvent,
  ConversationNewEvent,
  ConversationUpdatedEvent,
  NotificationNewEvent,
  UserStatusEvent,
} from '@/types';

interface InfiniteMessages {
  pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  pageParams: unknown[];
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function handleMessageNew(queryClient: QueryClient, payload: MessageNewEvent) {
  const { message, conversationId } = payload;

  // 1. Append to the messages cache for that conversation (if it exists)
  const messagesKey = QUERY_KEYS.messages.history(conversationId);
  const existing = queryClient.getQueryData<InfiniteMessages>(messagesKey);
  if (existing) {
    queryClient.setQueryData<InfiniteMessages>(messagesKey, (old) => {
      if (!old) return old;
      // Skip if we already have it (e.g., optimistic insert resolved)
      const hasMessage = old.pages.some((p) => p.items.some((m) => m.id === message.id));
      if (hasMessage) return old;

      const pages = [...old.pages];
      const lastIndex = pages.length - 1;
      if (lastIndex < 0) return old;
      const last = pages[lastIndex]!;
      pages[lastIndex] = { ...last, items: [...last.items, message] };
      return { ...old, pages };
    });
  }

  // 2. Update conversation list (last message, unread, sort order)
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

export function handleMessageEdited(queryClient: QueryClient, payload: MessageEditedEvent) {
  const { message } = payload;
  const key = QUERY_KEYS.messages.history(message.conversationId);
  queryClient.setQueryData<InfiniteMessages>(key, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: p.items.map((m) => (m.id === message.id ? message : m)),
      })),
    };
  });

  // Detail cache (single message query)
  queryClient.setQueryData(QUERY_KEYS.messages.detail(message.id), message);
}

export function handleMessageDeleted(queryClient: QueryClient, payload: MessageDeletedEvent) {
  const { conversationId, messageId, deletedForEveryone } = payload;
  const key = QUERY_KEYS.messages.history(conversationId);

  queryClient.setQueryData<InfiniteMessages>(key, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: deletedForEveryone
          ? p.items.map((m) =>
              m.id === messageId ? { ...m, isDeleted: true, content: '', attachments: [] } : m
            )
          : p.items.filter((m) => m.id !== messageId),
      })),
    };
  });

  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}
/***
 * Strategy: invalidate the conversation's message history so it refetches
 * from the server. This is intentionally simple — the alternative (patching
 * the cache in place) required perfect symmetry between client and server
 * for every replacement, removal, and multi-user race, which is easy to
 * get wrong and hard to debug.
 *
 * React Query refetches in the background while continuing to display the
 * previous data, so there's no visible flicker. The final state always
 * matches the server.
 */
export function handleMessageReaction(queryClient: QueryClient, payload: MessageReactionEvent) {
  const { conversationId } = payload;
  if (!conversationId) return;

  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.messages.history(conversationId),
  });
}

export function handleMessageRead(queryClient: QueryClient, payload: MessageReadEvent) {
  const { conversationId, userId, upToMessageId, readAt } = payload;
  const key = QUERY_KEYS.messages.history(conversationId);

  queryClient.setQueryData<InfiniteMessages>(key, (old) => {
    if (!old) return old;

    // Find the index of upToMessageId in the flattened list
    // (or if null, apply to all messages)
    const allIds = old.pages.flatMap((p) => p.items.map((m) => m.id));
    const cutoffIndex = upToMessageId ? allIds.indexOf(upToMessageId) : allIds.length - 1;
    const relevantIds = new Set(allIds.slice(0, cutoffIndex + 1));

    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: p.items.map((m) => {
          if (!relevantIds.has(m.id)) return m;
          if (m.readBy.some((r) => r.userId === userId)) return m;
          return {
            ...m,
            readBy: [...m.readBy, { userId, readAt }],
          };
        }),
      })),
    };
  });
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export function handleConversationNew(queryClient: QueryClient, _payload: ConversationNewEvent) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

export function handleConversationUpdated(
  queryClient: QueryClient,
  payload: ConversationUpdatedEvent
) {
  const { conversationId, changes } = payload;
  const key = QUERY_KEYS.conversations.detail(conversationId);

  queryClient.setQueryData<Conversation>(key, (old) => (old ? { ...old, ...changes } : old));

  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function handleNotificationNew(queryClient: QueryClient, _payload: NotificationNewEvent) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
}

// ---------------------------------------------------------------------------
// Presence (handled in the presence feature's own caches)
// ---------------------------------------------------------------------------

export function handleUserStatus(queryClient: QueryClient, payload: UserStatusEvent) {
  const { userId, status, lastSeen, statusMessage } = payload;

  // 1. Patch participants in the conversation list
  queryClient.setQueriesData<{ items: Conversation[] }>(
    { queryKey: QUERY_KEYS.conversations.all },
    (old) => {
      if (!old?.items) return old;
      return {
        ...old,
        items: old.items.map((conv) => ({
          ...conv,
          participants: conv.participants.map((p) => {
            const pUser = p.user as {
              id?: string;
              status?: UserStatus;
              lastSeen?: string | null;
            };
            if (pUser?.id !== userId) return p;
            return {
              ...p,
              user: {
                ...p.user,
                status,
                lastSeen,
                ...(statusMessage !== undefined ? { statusMessage } : {}),
              },
            };
          }),
        })),
      };
    }
  );

  // 2. Patch single conversation detail caches
  queryClient.setQueriesData<Conversation>({ queryKey: ['conversations', 'detail'] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      participants: old.participants.map((p) => {
        const pUser = p.user as {
          id?: string;
          status?: UserStatus;
          lastSeen?: string | null;
        };
        if (pUser?.id !== userId) return p;
        return {
          ...p,
          user: {
            ...p.user,
            status,
            lastSeen,
            ...(statusMessage !== undefined ? { statusMessage } : {}),
          },
        };
      }),
    };
  });
}

// ---------------------------------------------------------------------------
// Re-export for the bridge
// ---------------------------------------------------------------------------

export const handlers = {
  handleMessageNew,
  handleMessageEdited,
  handleMessageDeleted,
  handleMessageReaction,
  handleMessageRead,
  handleConversationNew,
  handleConversationUpdated,
  handleNotificationNew,
  handleUserStatus,
};

// Keep TS happy about unused imports in some builds
void (null as unknown as Message | Notification);
