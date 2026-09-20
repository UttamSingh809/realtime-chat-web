/**
 * useAutoDeliver — mark messages as delivered when they enter the user's
 * client, whether or not the user is viewing the conversation.
 *
 * Fires in two cases:
 *   1. The user's client fetches history for a conversation
 *   2. A new message arrives via socket while the user is online
 *
 * Either way, the user's client sends a POST /messages/:id/deliver for
 * any message they haven't already delivered. The backend then broadcasts
 * message:delivered, which updates the sender's tick in real time.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Message } from '@/types';

/**
 * Delivered-tracking set — persists across component remounts within a
 * session. Keyed by message ID so we never fire a duplicate request for
 * the same message.
 *
 * If the tab is refreshed, the set is empty, but the backend check
 * (`alreadyDelivered`) makes the operation idempotent — worst case we
 * send one extra request per message that's already been delivered.
 */
const deliveredGlobal = new Set<string>();

export function useAutoDeliver(messages: Message[]) {
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const myId = useAuthStore.getState().user?.id;
    if (!myId) return;
    if (messages.length === 0) return;

    // Find messages that:
    //   1. Are not mine
    //   2. Haven't been delivered by me yet
    //   3. We haven't already fired the API call for
    const toDeliver = messages.filter((m) => {
      if (deliveredGlobal.has(m.id)) return false;
      if (m._optimistic) return false;

      const senderId = m.sender && 'id' in m.sender ? (m.sender as { id: string | null }).id : null;
      if (senderId === myId) return false;

      const alreadyDelivered = m.deliveredTo.some((d) => d.userId === myId);
      return !alreadyDelivered;
    });

    if (toDeliver.length === 0) return;

    // Optimistically update the local cache so the message shows as
    // delivered instantly (belt-and-suspenders; the server broadcast
    // will confirm it).
    const convId = toDeliver[0]!.conversationId;
    const key = ['messages', 'history', convId];

    queryClient.setQueryData<{
      pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
      pageParams: unknown[];
    }>(key, (old) => {
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

    // Fire the API calls. Add to the tracking set BEFORE the call so
    // concurrent renders don't double-fire.
    for (const m of toDeliver) {
      deliveredGlobal.add(m.id);
      messagesApi.markDelivered(m.id).catch(() => {
        // If it failed, allow a retry on the next render
        deliveredGlobal.delete(m.id);
      });
    }
  }, [messages, queryClient]);
}
