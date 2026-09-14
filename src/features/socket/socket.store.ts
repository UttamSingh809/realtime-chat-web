/**
 * Socket store — holds the live socket instance.
 * Never subscribe to this directly from components (except through hooks).
 */

import { create } from 'zustand';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketState {
  socket: AppSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  setSocket: (socket: AppSocket | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),
  clear: () => set({ socket: null, isConnected: false, isConnecting: false, error: null }),
}));