/**
 * useUserStatus — live status for a single user.
 * Reads from the presence store; falls back to whatever the caller knows.
 */

import { usePresenceStore } from './usePresence';

export function useUserStatus(userId: string | undefined): {
  isOnline: boolean;
} {
  const online = usePresenceStore((s) => (userId ? s.onlineIds.has(userId) : false));
  return { isOnline: online };
}