/**
 * SocketBridge — connects socket events to React Query cache updates.
 * This is the ONLY place that listens to socket events for data changes.
 *
 * Mount it inside both QueryProvider and SocketProvider.
 */

import { usePresenceStore } from '@/features/presence/usePresence';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocketEvent } from './useSocketEvent';
import { handlers } from './socketHandlers';

export function SocketBridge() {
  const queryClient = useQueryClient();

  // Messages
  useSocketEvent('message:new', (payload) => {
    handlers.handleMessageNew(queryClient, payload);
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

  // Conversations
  useSocketEvent('conversation:new', (payload) => {
    handlers.handleConversationNew(queryClient, payload);
  });

  useSocketEvent('conversation:updated', (payload) => {
    handlers.handleConversationUpdated(queryClient, payload);
  });

  // Notifications
  useSocketEvent('notification:new', (payload) => {
    handlers.handleNotificationNew(queryClient, payload);

    // Show a toast if the tab is hidden
    if (typeof document !== 'undefined' && document.hidden) {
      toast(payload.notification.title, {
        description: payload.notification.body,
      });
    }
  });

  // Presence
  useSocketEvent('user:status', (payload) => {
    handlers.handleUserStatus(queryClient, payload);
  });

  // Errors
  useSocketEvent('error', (payload) => {
    // eslint-disable-next-line no-console
    console.error('[socket error]', payload);
    // Only toast for user-facing errors
    if (payload.code && payload.code !== 'TOKEN_EXPIRED') {
      toast.error(payload.message || 'Socket error');
    }
  });

  return null;
}
