/**
 * useMessageReactions — bundle add + remove for a conversation.
 */

import { useAddReaction } from './useAddReaction';
import { useRemoveReaction } from './useRemoveReaction';

export function useMessageReactions(conversationId: string | undefined) {
  const add = useAddReaction(conversationId);
  const remove = useRemoveReaction(conversationId);

  return { add, remove };
}