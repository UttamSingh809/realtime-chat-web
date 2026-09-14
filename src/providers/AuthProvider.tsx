/**
 * AuthProvider — boots the app's auth state.
 *
 * On mount:
 *   1. Sets `isBooting = true`
 *   2. Calls /auth/refresh (uses HttpOnly cookie — no token needed)
 *   3. If successful, populates the store and sets `isBooting = false`
 *   4. If it fails, clears auth and sets `isBooting = false`
 *
 * The router waits for isBooting to become false before rendering routes,
 * so protected routes never flash the login page on refresh.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthTokens, UserSelf } from '@/types';

interface AuthContextValue {
  isBooting: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isBooting: true });

export function useAuthBoot() {
  return useContext(AuthContext);
}

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        // Silent refresh — backend reads the HttpOnly cookie
        const refreshRes = await axios.post<{
          data: AuthTokens & { user: UserSelf };
        }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 10000 }
        );

        if (cancelled) return;

        const { accessToken, user } = refreshRes.data.data;
        useAuthStore.getState().setAuth(accessToken, user);
      } catch {
        // No session → clear any stale state
        if (!cancelled) useAuthStore.getState().clearAuth();
      } finally {
        if (!cancelled) setIsBooting(false);
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthContext.Provider value={{ isBooting }}>{children}</AuthContext.Provider>;
}