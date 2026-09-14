/**
 * useMessageActions — bundled mutations for a conversation.
 * Convenience hook that returns send / edit / delete in one call.
 */

import { useSendMessage } from './useSendMessage';
import { useEditMessage } from './useEditMessage';
import { useDeleteMessage } from './useDeleteMessage';

export function useMessageActions(conversationId: string | undefined) {
  const send = useSendMessage(conversationId);
  const edit = useEditMessage(conversationId);
  const remove = useDeleteMessage(conversationId);

  return { send, edit, remove };
}