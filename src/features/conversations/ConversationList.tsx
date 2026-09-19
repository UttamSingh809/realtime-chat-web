/**
 * ConversationList — the real thing.
 * Fetches conversations, handles loading/empty/error states, and search.
 */

import { useMemo, useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/features/auth';
import { useConversations } from './useConversations';
import { ConversationItem } from './ConversationItem';
import { conversationDisplayName } from './conversationUtils';

interface Props {
  /** Search filter — passed in from the sidebar. Empty string = no filter. */
  searchQuery?: string;
  /** Whether to show archived conversations. Defaults to false. */
  archived?: boolean;
}

export function ConversationList({ searchQuery = '', archived = false }: Props) {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useConversations({ archived });

  // Filter by search term locally. Server-side search comes in Step 8.
  const filtered = useMemo(() => {
    if (!data?.items) return [];

    // Filter by search query if provided
    const matches =
      !searchQuery.trim() || !user
        ? data.items
        : data.items.filter((c) => {
            const q = searchQuery.toLowerCase();
            return conversationDisplayName(c, user.id).toLowerCase().includes(q);
          });

    // Stable sort:
    //   pinned first, then by last message createdAt desc (fallback: conversation createdAt desc)
    //
    // We intentionally do NOT sort by `updatedAt` — reading a conversation
    // and toggling flags bump that field, which would reorder the sidebar
    // every time you click a row. Sorting by last message time ensures the
    // order only changes when a NEW message actually arrives.
    return [...matches].sort((a, b) => {
      if (a.myFlags.pinned !== b.myFlags.pinned) {
        return a.myFlags.pinned ? -1 : 1;
      }
      const aTime = a.lastMessage?.createdAt ?? a.createdAt;
      const bTime = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [data, searchQuery, user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {(error as unknown as Error)?.message || 'Failed to load conversations'}
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {searchQuery ? 'No matches' : archived ? 'No archived chats' : 'No conversations yet'}
          </p>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? 'Try a different search term.'
              : archived
                ? 'Archived conversations will appear here.'
                : 'Click the + button to start a new chat.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col py-1">
        {filtered.map((c) => (
          <ConversationItem key={c.id} conversation={c} viewerId={user.id} />
        ))}
      </div>
    </ScrollArea>
  );
}
