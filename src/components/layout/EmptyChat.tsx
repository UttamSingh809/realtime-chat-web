/**
 * EmptyChat — placeholder for the main area when no conversation is selected.
 */

import { MessageSquare } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Welcome to RealTime Chat</h2>
        <p className="text-sm text-muted-foreground">
          Select a conversation from the sidebar or start a new one.
        </p>
      </div>
    </div>
  );
}
