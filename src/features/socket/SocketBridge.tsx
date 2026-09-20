/**
 * SocketBridge — connects socket events to React Query cache updates.
 *
 * This is the ONLY place that listens to socket events for data changes.
 * Mount it inside both QueryProvider and SocketProvider.
 *
 * Responsibilities:
 *   - Translate raw socket events into cache mutations
 *   - Keep the presence store in sync with user:status / online:users
 *   - Toast notifications for background events
 *   - Log server-side socket errors
 */

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocketEvent } from './useSocketEvent';
import { handlers } from './socketHandlers';
import { usePresenceStore } from '@/features/presence';
import { DeliveryBridge } from '@/features/messages/DeliveryBridge';

export function SocketBridge() {
  const queryClient = useQueryClient();
  const setOnlineIds = usePresenceStore((s) => s.setOnlineIds);

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------

  useSocketEvent('message:new', (payload) => {
    handlers.handleMessageNew(queryClient, payload);
  });

  useSocketEvent('message:delivered', (payload) => {
    handlers.handleMessageDelivered(queryClient, payload);
  });

  useSocketEvent('message:edited', (payload) => {
    handlers.handleMessageEdited(queryClient, payload);
  });

  useSocketEvent('message:deleted', (payload) => {
    handlers.handleMessageDeleted(queryClient, payload);
  });

  useSocketEvent('message:reaction', (payload) => {
    handlers.handleMessageReaction(queryClient, payload);
  });

  useSocketEvent('message:read', (payload) => {
    handlers.handleMessageRead(queryClient, payload);
  });

  // -------------------------------------------------------------------------
  // Conversations
  // -------------------------------------------------------------------------

  useSocketEvent('conversation:new', (payload) => {
    handlers.handleConversationNew(queryClient, payload);
  });

  useSocketEvent('conversation:updated', (payload) => {
    handlers.handleConversationUpdated(queryClient, payload);
  });

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  useSocketEvent('notification:new', (payload) => {
    handlers.handleNotificationNew(queryClient, payload);

    // Show a toast if the tab is hidden
    if (typeof document !== 'undefined' && document.hidden) {
      toast(payload.notification.title, {
        description: payload.notification.body,
      });
    }
  });

  // -------------------------------------------------------------------------
  // Presence
  // -------------------------------------------------------------------------

  // Bulk online-user list (sent on initial connect and after reconnects)
  useSocketEvent('online:users', (payload) => {
        console.debug('[socket] online:users', payload.userIds);
    setOnlineIds(payload.userIds);
  });

  // Single-user status changes
  useSocketEvent('user:status', (payload) => {
    // Patch React Query caches (conversation list + detail)
        console.debug('[socket] user:status', payload);
    handlers.handleUserStatus(queryClient, payload);

    // Update the presence store
    const { setUserOnline, setUserOffline } = usePresenceStore.getState();
    if (payload.status === 'offline') {
      setUserOffline(payload.userId);
    } else {
      setUserOnline(payload.userId);
    }
  });

  // -------------------------------------------------------------------------
  // Errors from the server
  // -------------------------------------------------------------------------

  useSocketEvent('error', (payload) => {
    // eslint-disable-next-line no-console
    console.error('[socket error]', payload);

    // Don't toast for auth-related errors — they're handled elsewhere.
    if (payload.code && payload.code !== 'TOKEN_EXPIRED') {
      toast.error(payload.message || 'Socket error');
    }
  });

  return (
    <>
      <DeliveryBridge />
      {/* existing handlers */}
    </>
  );
}
