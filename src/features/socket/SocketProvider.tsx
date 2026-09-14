/**
 * SocketProvider — owns the Socket.io connection lifecycle.
 *
 * On mount (when authenticated):
 *   - Opens a connection with the current access token
 *   - Registers connection state handlers (connect, disconnect, error)
 *   - Tears down on unmount
 *
 * On token change (re-authentication):
 *   - Closes the old socket
 *   - Opens a new one with the new token
 */

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketStore, type AppSocket } from './socket.store';

interface Props {
  children: React.ReactNode;
}

export function SocketProvider({ children }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<AppSocket | null>(null);

  const { setSocket, setConnected, setConnecting, setError, clear } = useSocketStore();

  useEffect(() => {
    if (!accessToken) {
      // Logged out — close and clear
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      clear();
      return;
    }

    // Already connected with this token — no-op
    if (socketRef.current?.connected) return;

    // Close any existing socket (e.g., after token rotation)
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnecting(true);
    setError(null);

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 15000,
    }) as unknown as AppSocket;

    socketRef.current = socket;
    setSocket(socket);

    socket.on('connect', () => {
      setConnected(true);
      setConnecting(false);
      setError(null);
      // eslint-disable-next-line no-console
      console.debug('[socket] connected', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      // eslint-disable-next-line no-console
      console.debug('[socket] disconnected', reason);
    });

    socket.on('connect_error', (err) => {
      setConnecting(false);
      setConnected(false);
      setError(err.message);
      // eslint-disable-next-line no-console
      console.error('[socket] connect_error', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, setSocket, setConnected, setConnecting, setError, clear]);

  return <>{children}</>;
}

// Re-export the type for consumers
export type { AppSocket, Socket };
