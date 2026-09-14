/**
 * useSocket — read the socket instance from the store.
 * Components should use `useSocketEvent` to subscribe, not this directly.
 */

import { useSocketStore } from './socket.store';

export function useSocket() {
  return useSocketStore((s) => s.socket);
}

export function useSocketConnection() {
  return useSocketStore((s) => ({
    isConnected: s.isConnected,
    isConnecting: s.isConnecting,
    error: s.error,
  }));
}