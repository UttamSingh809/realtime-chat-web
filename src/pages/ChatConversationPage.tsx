/**
 * ChatConversationPage — /app/chat/:id.
 * Placeholder for now; the real chat view arrives in Step 9.
 */

/**
 * ChatConversationPage — /app/chat/:id.
 * Shows the conversation header for real. Messages arrive in Step 9.
 */

import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useConversation, conversationDisplayName } from '@/features/conversations';
import { useAuth } from '@/features/auth';

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: conversation, isLoading, isError } = useConversation(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !conversation || !user) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Conversation not found.
      </div>
    );
  }

  const title = conversationDisplayName(conversation, user.id);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {conversation.type === 'group'
              ? `${conversation.participants.length} participants`
              : 'Direct message'}
          </p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Messages will appear here in Step 9.
      </div>
    </div>
  );
}