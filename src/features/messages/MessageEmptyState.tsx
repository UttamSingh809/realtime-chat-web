/**
 * MessageEmptyState — shown when a conversation has no messages.
 */

import { MessageSquare } from 'lucide-react';

interface Props {
  conversationName: string;
}

export function MessageEmptyState({ conversationName }: Props) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs text-muted-foreground">
          Start the conversation with {conversationName}.
        </p>
      </div>
    </div>
  );
}
