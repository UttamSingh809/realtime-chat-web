/**
 * useConversationRoom — join/leave the socket room for a conversation.
 * Also marks the conversation as read on join.
 */

import { useEffect } from 'react';
import { useSocket, useSocketConnection } from '@/features/socket';
import { useMarkRead } from './useMarkRead';

export function useConversationRoom(conversationId: string | undefined) {
  const socket = useSocket();
  const { isConnected } = useSocketConnection();
  const markRead = useMarkRead();

  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    // Join
    socket.emit('conversation:join', { conversationId });

    // Mark read when entering (resets unread badge)
    markRead.mutate({ conversationId });

    return () => {
      socket.emit('conversation:leave', { conversationId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversationId, isConnected]);
}