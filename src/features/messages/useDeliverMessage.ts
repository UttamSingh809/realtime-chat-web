/**
 * useDeliverMessage — auto-marks incoming messages as delivered.
 *
 * Fire-and-forget. We optimistically update the cache to show the double
 * tick to the sender (via socket), then call the API.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/api';
import { useAuthStore } from '@/stores/auth.store';
import { QUERY_KEYS } from '@/lib/constants';
import type { Message } from '@/types';

/**
 * For a batch of messages, mark any that we haven't delivered yet.
 * Debounced and idempotent.
 */
export function useAutoDeliver(conversationId: string | undefined, messages: Message[]) {
  const queryClient = useQueryClient();
  const deliveredRef = useRef(new Set<string>());

  useEffect(() => {
    if (!conversationId) return;

    const myId = useAuthStore.getState().user?.id;
    if (!myId) return;

    // Find messages that:
    //   1. Are not mine
    //   2. Haven't been delivered by me yet
    //   3. We haven't already fired the API for
    const toDeliver = messages.filter((m) => {
      if (deliveredRef.current.has(m.id)) return false;
      const senderId = m.sender && 'id' in m.sender ? (m.sender as { id: string }).id : null;
      if (senderId === myId) return false;
      if (m._optimistic) return false;
      const alreadyDelivered = m.deliveredTo.some((d) => d.userId === myId);
      return !alreadyDelivered;
    });

    if (toDeliver.length === 0) return;

    // Optimistically update local cache — the sender will see the ticks
    // via their own socket once we hit the API.
    const key = QUERY_KEYS.messages.history(conversationId);
    queryClient.setQueryData<{
      pages: Array<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
      pageParams: unknown[];
    }>(key, (old) => {
      if (!old) return old;
      const deliverIds = new Set(toDeliver.map((m) => m.id));
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((m) => {
            if (!deliverIds.has(m.id)) return m;
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

    // Fire API calls in the background (batched by the backend anyway)
    for (const m of toDeliver) {
      deliveredRef.current.add(m.id);
      messagesApi.markDelivered(m.id).catch(() => {
        // If it fails, allow retry on next render
        deliveredRef.current.delete(m.id);
      });
    }
  }, [conversationId, messages, queryClient]);
}
