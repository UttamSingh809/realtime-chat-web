/**
 * Socket event handlers — pure cache transforms.
 *
 * Each handler receives the event payload + the query client and
 * updates one or more caches. No component logic here.
 */

import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  Message,
  Conversation,
  Notification,
  UserStatus,
} from '@/types';
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

export function handleMessageNew(
  queryClient: QueryClient,
  payload: MessageNewEvent
) {
  const { message, conversationId } = payload;

  // 1. Append to the messages cache for that conversation (if it exists)
  const messagesKey = QUERY_KEYS.messages.history(conversationId);
  const existing = queryClient.getQueryData<InfiniteMessages>(messagesKey);
  if (existing) {
    queryClient.setQueryData<InfiniteMessages>(messagesKey, (old) => {
      if (!old) return old;
      // Skip if we already have it (e.g., optimistic insert resolved)
      const hasMessage = old.pages.some((p) =>
        p.items.some((m) => m.id === message.id)
      );
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

export function handleMessageEdited(
  queryClient: QueryClient,
  payload: MessageEditedEvent
) {
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

export function handleMessageDeleted(
  queryClient: QueryClient,
  payload: MessageDeletedEvent
) {
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
              m.id === messageId
                ? { ...m, isDeleted: true, content: '', attachments: [] }
                : m
            )
          : p.items.filter((m) => m.id !== messageId),
      })),
    };
  });

  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

export function handleMessageReaction(
  queryClient: QueryClient,
  payload: MessageReactionEvent
) {
  const { conversationId, messageId, userId, emoji, added } = payload;
  const key = QUERY_KEYS.messages.history(conversationId);

  if (added && emoji) {
    // Add — we can update the cache precisely
    queryClient.setQueryData<InfiniteMessages>(key, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          items: p.items.map((m) => {
            if (m.id !== messageId) return m;

            const reactions = { ...(m.reactions || {}) };
            const current = reactions[emoji];
            reactions[emoji] = current
              ? { count: current.count + 1, mine: current.mine }
              : { count: 1, mine: false };

            return { ...m, reactions };
          }),
        })),
      };
    });
    return;
  }

  // Removal — the backend doesn't tell us which emoji was removed.
  // The local optimist already removed the caller's own reaction.
  // For any other removal, invalidate to force a refetch.
  void userId;
  queryClient.invalidateQueries({ queryKey: key });
}

export function handleMessageRead(
  queryClient: QueryClient,
  payload: MessageReadEvent
) {
  const { conversationId, userId, upToMessageId, readAt } = payload;
  const key = QUERY_KEYS.messages.history(conversationId);

  queryClient.setQueryData<InfiniteMessages>(key, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        items: p.items.map((m) => {
          // Add a read receipt if not already present
          if (m.readBy.some((r) => r.userId === userId)) return m;
          return {
            ...m,
            readBy: [...m.readBy, { userId, readAt }],
          };
        }),
      })),
    };
  });

  // Silence unused warning for upToMessageId (used in future optimization)
  void upToMessageId;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export function handleConversationNew(
  queryClient: QueryClient,
  _payload: ConversationNewEvent
) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

export function handleConversationUpdated(
  queryClient: QueryClient,
  payload: ConversationUpdatedEvent
) {
  const { conversationId, changes } = payload;
  const key = QUERY_KEYS.conversations.detail(conversationId);

  queryClient.setQueryData<Conversation>(key, (old) =>
    old ? { ...old, ...changes } : old
  );

  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function handleNotificationNew(
  queryClient: QueryClient,
  _payload: NotificationNewEvent
) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
}

// ---------------------------------------------------------------------------
// Presence (handled in the presence feature's own caches)
// ---------------------------------------------------------------------------

export function handleUserStatus(
  queryClient: QueryClient,
  payload: UserStatusEvent
) {
  const { userId, status, lastSeen, statusMessage } = payload;

  // Patch the user in every conversation's participants
  queryClient.setQueriesData<{ items: Conversation[] }>(
    { queryKey: QUERY_KEYS.conversations.all },
    (old) => {
      if (!old?.items) return old;
      return {
        ...old,
        items: old.items.map((conv) => ({
          ...conv,
          participants: conv.participants.map((p) => {
            const pUser = p.user as { id?: string; status?: UserStatus; lastSeen?: string | null };
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