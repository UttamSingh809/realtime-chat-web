/**
 * Auth store — holds the access token in memory only.
 *
 * We deliberately do NOT persist the access token to localStorage.
 * Refresh happens via HttpOnly cookie set by the backend.
 */

import { create } from 'zustand';
import type { UserSelf } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: UserSelf | null;
  isAuthenticated: boolean;

  setAuth: (accessToken: string, user: UserSelf) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: UserSelf) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setUser: (user) => set({ user }),

  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));

/**
 * Non-React accessor for use inside axios interceptors.
 * Reads the current token without subscribing.
 */
export const getAccessToken = (): string | null =>
  useAuthStore.getState().accessToken;