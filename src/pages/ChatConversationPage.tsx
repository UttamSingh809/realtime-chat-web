/**
 * ChatConversationPage — /app/chat/:id.
 * Placeholder for now; the real chat view arrives in Step 9.
 */

import { useParams } from 'react-router-dom';

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b p-3">
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Conversation</h2>
          <p className="text-xs text-muted-foreground">ID: {id}</p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Messages will appear here in Step 9.
      </div>
    </div>
  );
}
