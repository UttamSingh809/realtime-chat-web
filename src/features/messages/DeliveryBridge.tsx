/**
 * DeliveryBridge — marks messages as delivered when they enter the user's
 * client, regardless of which conversation (if any) they're viewing.
 *
 * On mount (and whenever the conversation list changes), it fetches the
 * latest page of history for every conversation and delivers any new
 * messages. This makes the sender's tick flip from yellow to orange even
 * if the receiver never opens the conversation.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useConversations } from '@/features/conversations';
import { messagesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { Message } from '@/types';

const deliveredGlobal = new Set<string>();

export function DeliveryBridge() {
  const queryClient = useQueryClient();
  const myId = useAuthStore((s) => s.user?.id);
  const { data: convs } = useConversations();
  const deliveredConversationsRef = useRef(new Set<string>());

  // For each conversation the user belongs to, ensure we have fetched
  // its latest message history at least once. That way we can scan for
  // undelivered messages and mark them delivered.
  useEffect(() => {
    if (!myId) return;
    if (!convs?.items?.length) return;

    const conversationIds = convs.items.map((c) => c.id);

    for (const convId of conversationIds) {
      if (deliveredConversationsRef.current.has(convId)) continue;
      deliveredConversationsRef.current.add(convId);

      const key = QUERY_KEYS.messages.history(convId);

      // Fetch the latest page of history if we don't already have it,
      // or refetch if we do (to catch any messages that arrived while
      // we weren't connected).
      queryClient
        .fetchInfiniteQuery({
          queryKey: key,
          queryFn: async ({ pageParam }) => {
            const res = await messagesApi.getHistory(convId, {
              limit: 30,
              before: pageParam as string | undefined,
            });
            return {
              items: [...res.data.items].reverse() as Message[],
              nextCursor: res.data.meta.nextCursor,
              hasMore: res.data.meta.hasMore,
            };
          },
          initialPageParam: undefined as string | undefined,
          getNextPageParam: (last: {
            items: Message[];
            nextCursor: string | null;
            hasMore: boolean;
          }) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
        })
        .then(() => {
          // After fetch completes, scan and deliver
          scanAndDeliver(convId, queryClient, myId);
        })
        .catch(() => {
          // Allow retry on next mount
          deliveredConversationsRef.current.delete(convId);
        });
    }
  }, [myId, convs?.items, queryClient]);

  // Also watch for messages added to the cache (socket-delivered ones)
  useEffect(() => {
    if (!myId) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const queryKey = event.query.queryKey;
      if (!Array.isArray(queryKey) || queryKey[0] !== 'messages' || queryKey[1] !== 'history') {
        return;
      }

      const convId = queryKey[2] as string;
      if (!convId) return;

      scanAndDeliver(convId, queryClient, myId);
    });

    return () => unsubscribe();
  }, [myId, queryClient]);

  return null;
}

/**
 * Scan the cached messages for a conversation, deliver any that need it.
 */
function scanAndDeliver(
  conversationId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  myId: string
) {
  const data = queryClient.getQueryData<{
    pages: Array<{ items: Message[] }>;
  }>(QUERY_KEYS.messages.history(conversationId));

  if (!data?.pages) return;

  const allMessages = data.pages.flatMap((p) => p.items);

  const toDeliver = allMessages.filter((m) => {
    if (deliveredGlobal.has(m.id)) return false;
    if (m._optimistic) return false;
    const senderId = m.sender && 'id' in m.sender ? (m.sender as { id: string | null }).id : null;
    if (senderId === myId) return false;
    return !m.deliveredTo.some((d) => d.userId === myId);
  });

  if (toDeliver.length === 0) return;

  // Optimistically update the local cache
  queryClient.setQueryData<{
    pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
    pageParams: unknown[];
  }>(QUERY_KEYS.messages.history(conversationId), (old) => {
    if (!old) return old;
    const ids = new Set(toDeliver.map((m) => m.id));
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((m) => {
          if (!ids.has(m.id)) return m;
          if (m.deliveredTo.some((d) => d.userId === myId)) return m;
          return {
            ...m,
            deliveredTo: [
              ...m.deliveredTo,
              { userId: myId, deliveredAt: new Date().toISOString() },
            ],
          };
        }),
      })),
    };
  });

  // Fire the API calls
  for (const m of toDeliver) {
    deliveredGlobal.add(m.id);
    messagesApi.markDelivered(m.id).catch(() => {
      deliveredGlobal.delete(m.id);
    });
  }
}
