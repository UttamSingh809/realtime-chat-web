/**
 * React Query client with defaults tuned for a chat application.
 *
 * Reasoning:
 *   - staleTime: 30s — chats change fast but we also have sockets pushing updates
 *   - retry: skip 4xx errors (they won't succeed on retry)
 *   - refetchOnWindowFocus: false for most data (sockets handle freshness);
 *     specific queries can opt in
 *   - gcTime: 5 min — keep cache around while the user navigates
 */

import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiError;
        // Don't retry on client errors (4xx)
        if (apiError?.status && apiError.status >= 400 && apiError.status < 500) {
          return false;
        }
        // Retry up to 2 times for network / 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // never retry mutations — user should see the error
    },
  },
});