/**
 * usePresence — tracks the set of online user IDs.
 * Backed by a Zustand store; updated by the SocketBridge.
 */

import { create } from 'zustand';

interface PresenceState {
  onlineIds: Set<string>;
  setOnlineIds: (ids: string[]) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineIds: new Set<string>(),
  setOnlineIds: (ids) => set({ onlineIds: new Set(ids) }),
  setUserOnline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineIds);
      next.add(userId);
      return { onlineIds: next };
    }),
  setUserOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineIds);
      next.delete(userId);
      return { onlineIds: next };
    }),
  isOnline: (userId) => get().onlineIds.has(userId),
}));

export function useIsOnline(userId: string | undefined): boolean {
  return usePresenceStore((s) => (userId ? s.onlineIds.has(userId) : false));
}