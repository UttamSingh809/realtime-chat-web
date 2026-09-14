/**
 * App-wide constants. Endpoints, storage keys, query keys.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'RealTime Chat';

// ---------------------------------------------------------------------------
// Local storage keys
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  THEME: 'rc.theme',
  REFRESH_TOKEN: 'rc.refreshToken', // fallback if cookies unavailable
} as const;

// ---------------------------------------------------------------------------
// React Query keys — centralized so invalidations are type-safe
// ---------------------------------------------------------------------------

export const QUERY_KEYS = {
  me: ['me'] as const,
  users: {
    all: ['users'] as const,
    search: (q: string) => ['users', 'search', q] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    online: ['users', 'online'] as const,
    blocked: ['users', 'blocked'] as const,
    muted: ['users', 'muted'] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: (opts?: { archived?: boolean }) => ['conversations', 'list', opts] as const,
    detail: (id: string) => ['conversations', 'detail', id] as const,
  },
  messages: {
    history: (conversationId: string) => ['messages', 'history', conversationId] as const,
    detail: (id: string) => ['messages', 'detail', id] as const,
    search: (params: Record<string, unknown>) => ['messages', 'search', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (opts?: Record<string, unknown>) => ['notifications', 'list', opts] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  files: {
    config: ['files', 'config'] as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 30;
export const DEFAULT_MESSAGE_PAGE_SIZE = 30;
export const DEFAULT_SEARCH_LIMIT = 20;