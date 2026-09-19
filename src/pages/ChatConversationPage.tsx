/**
 * ChatConversationPage — the real chat view, now with live updates.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '@/features/auth';
import {
  useConversation,
  conversationDisplayName,
  useMarkRead,
  useConversationRoom,
} from '@/features/conversations';
import {
  MessageList,
  MessageComposer,
  MessageEmptyState,
  TypingIndicator,
  flattenMessages,
  useMessages,
  useMessageActions,
  useMessageReactions,
  useTypingEmitter,
  useTypingSubscription,
  useAutoDeliver,
} from '@/features/messages';
import { useSocketConnection } from '@/features/socket';
import type { UserPublic } from '@/types';
import type { Attachment } from '@/types';

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const markRead = useMarkRead();
  const { isConnected } = useSocketConnection();

  // Join the socket room (also marks read)
  useConversationRoom(id);

  // Fetch conversation metadata
  const { data: conversation, isLoading: loadingConv, isError: errorConv } = useConversation(id);

  // Fetch message history
  const {
    data: pages,
    isLoading: loadingMessages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages({ conversationId: id });

  // Actions
  const { send, edit, remove } = useMessageActions(id);
  const { add: addReaction, remove: removeReaction } = useMessageReactions(id);
  // Typing
  const typing = useTypingEmitter(id);
  useTypingSubscription(id);

  const messages = useMemo(() => flattenMessages(pages?.pages), [pages]);

  useAutoDeliver(id, messages);

  const conversationName = useMemo(() => {
    if (!conversation || !user) return 'Conversation';
    return conversationDisplayName(conversation, user.id);
  }, [conversation, user]);

  // Lookup map for typing indicator names
  const userLookup = useMemo(() => {
    const map: Record<string, Pick<UserPublic, 'id' | 'name'> | undefined> = {};
    if (!conversation) return map;
    for (const p of conversation.participants) {
      const u = p.user as UserPublic;
      if (u?.id) map[u.id] = { id: u.id, name: u.name };
    }
    return map;
  }, [conversation]);

  // Mark read (guarded, fires once per latest message id)
  const lastReadRef = useRef<string | null>(null);
  useEffect(() => {
    if (!conversation || messages.length === 0) return;
    const lastId = messages[messages.length - 1]!.id;
    const key = `${conversation.id}:${lastId}`;
    if (lastReadRef.current === key) return;
    lastReadRef.current = key;
    markRead.mutate({ conversationId: conversation.id, upToMessageId: lastId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, messages.length]);

  const handleSend = useCallback(
    (content: string, attachments?: Attachment[]) => {
      if (!id) return;
      typing.stop();
      send.mutate({ conversationId: id, content, attachments });
    },
    [id, send, typing]
  );

  const handleEdit = useCallback(
    (messageId: string, content: string) => {
      edit.mutate({ messageId, content });
    },
    [edit]
  );

  const handleDeleteForMe = useCallback(
    (messageId: string) => {
      remove.mutate({ messageId, scope: 'me' });
    },
    [remove]
  );

  const handleDeleteForEveryone = useCallback(
    (messageId: string) => {
      remove.mutate({ messageId, scope: 'everyone' });
    },
    [remove]
  );

  const handleReact = useCallback(
    (messageId: string, emoji: string) => {
      if (!id) return;

      // Determine whether I already have this exact reaction.
      // If so, remove it (toggle off). Otherwise, add/replace.
      const message = messages.find((m) => m.id === messageId);
      const existing = message?.reactions?.[emoji];

      if (existing?.mine) {
        removeReaction.mutate({ messageId, conversationId: id });
      } else {
        addReaction.mutate({ messageId, conversationId: id, emoji });
      }
    },
    [id, messages, addReaction, removeReaction]
  );

  const handleTyping = useCallback(() => {
    typing.start();
  }, [typing]);

  // ---------- Render ----------

  if (loadingConv || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (errorConv || !conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Conversation not found.
      </div>
    );
  }

  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participants.length} participants`
      : 'Direct message';

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{conversationName}</h2>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {!isConnected && (
          <div className="flex items-center gap-1.5 text-xs text-warning" title="Reconnecting…">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Reconnecting…</span>
          </div>
        )}
      </header>

      {loadingMessages && messages.length === 0 ? (
        <MessageList
          messages={[]}
          conversation={conversation}
          isLoading
          isFetchingNextPage={false}
          hasNextPage={false}
          fetchNextPage={() => undefined}
          onEdit={handleEdit}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onReact={handleReact}
        />
      ) : messages.length === 0 ? (
        <MessageEmptyState conversationName={conversationName} />
      ) : (
        <MessageList
          messages={messages}
          conversation={conversation}
          isLoading={false}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
          onEdit={handleEdit}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onReact={handleReact}
        />
      )}

      <TypingIndicator conversationId={id ?? ''} userLookup={userLookup} />

      <MessageComposer
        conversationName={conversationName}
        onSend={handleSend}
        onTyping={handleTyping}
        sending={send.isPending}
      />
    </div>
  );
}
