/**
 * useSocketEvent — subscribe to a server event.
 * The handler is kept fresh via a ref, so identity changes don't
 * cause re-subscribes.
 */

import { useEffect, useRef } from 'react';
import type { ServerToClientEvents } from '@/types';
import { useSocket } from './useSocket';

export function useSocketEvent<E extends keyof ServerToClientEvents>(
  event: E,
  handler: ServerToClientEvents[E]
) {
  const socket = useSocket();
  const handlerRef = useRef(handler);

  // Keep the ref updated
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    // Wrap the handler so we always call the latest ref
    const wrapper = ((...args: Parameters<ServerToClientEvents[E]>) => {
      (handlerRef.current as (...a: Parameters<ServerToClientEvents[E]>) => void)(...args);
    }) as ServerToClientEvents[E];

    socket.on(event, wrapper as never);
    return () => {
      socket.off(event, wrapper as never);
    };
  }, [socket, event]);
}