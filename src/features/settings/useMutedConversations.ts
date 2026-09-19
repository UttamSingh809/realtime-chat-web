/**
 * useMutedConversations — list conversations the current user has muted.
 *
 * Note: "mute" here means muting a conversation (from the sidebar actions
 * menu), not muting a user globally. Muted chats appear in Settings so the
 * user can unmute them from one place.
 */

import { useMemo } from 'react';
import { useConversations, useMuteConversation } from '@/features/conversations';

export function useMutedConversations() {
  // Fetch all active conversations and filter client-side.
  // The backend doesn't expose a "muted only" filter yet.
  const { data, isLoading } = useConversations({ archived: false });

  const muted = useMemo(() => (data?.items ?? []).filter((c) => c.myFlags.muted), [data]);

  return { muted, isLoading };
}

export function useUnmuteConversation() {
  // Reuse the existing mutation — it already invalidates the conversations
  // cache and shows a toast.
  return useMuteConversation();
}
