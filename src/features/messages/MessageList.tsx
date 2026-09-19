/**
 * MessageList — the virtualized message list with robust auto-scroll.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { format, isToday, isYesterday } from 'date-fns';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import type { Conversation, Message } from '@/types';
import { MessageGroup } from './MessageGroup';
import { MessageSkeleton } from './MessageSkeleton';
import { groupMessages, shouldShowDateDivider } from './messageUtils';

interface Props {
  messages: Message[];
  conversation: Conversation;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onEdit: (messageId: string, content: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

function formatDateDivider(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'PPP');
}

export function MessageList({
  messages,
  conversation,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReact,
}: Props) {
  const { user } = useAuth();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const isAtBottomRef = useRef(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const lastScrolledMessageIdRef = useRef<string | null>(null);

  const [firstItemIndex, setFirstItemIndex] = useState(1_000_000);
  const lastCount = useRef(0);

  useEffect(() => {
    const added = messages.length - lastCount.current;
    if (added > 0 && lastCount.current > 0) {
      setFirstItemIndex((idx) => idx - added);
    }
    lastCount.current = messages.length;
  }, [messages.length]);

  const items = useMemo(() => {
    if (!user) return [];

    const out: Array<
      | { kind: 'divider'; date: string; key: string }
      | { kind: 'group'; group: ReturnType<typeof groupMessages>[number]; key: string }
    > = [];

    const groups = groupMessages(messages, user.id);

    groups.forEach((group, idx) => {
      const firstMsg = group.messages[0]!;
      const prevGroup = idx > 0 ? groups[idx - 1] : undefined;
      const prevMsg = prevGroup?.messages[prevGroup.messages.length - 1];

      if (shouldShowDateDivider(firstMsg, prevMsg)) {
        out.push({
          kind: 'divider',
          date: formatDateDivider(firstMsg.createdAt),
          key: `divider-${firstMsg.id}`,
        });
      }
      out.push({ kind: 'group', group, key: `group-${firstMsg.id}` });
    });

    return out;
  }, [messages, user]);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;

  useEffect(() => {
    if (!lastMessageId || items.length === 0) return;
    if (lastScrolledMessageIdRef.current === lastMessageId) return;

    const senderId =
      lastMessage?.sender && 'id' in lastMessage.sender
        ? (lastMessage.sender as { id: string | null }).id
        : null;

    const isMine = senderId === user?.id;
    const shouldScroll = isMine || isAtBottomRef.current;

    if (shouldScroll) {
      requestAnimationFrame(() => {
        virtuosoRef.current?.scrollToIndex({
          index: 'LAST',
          behavior: 'smooth',
          align: 'end',
        });
      });
      lastScrolledMessageIdRef.current = lastMessageId;
      setShowJumpButton(false);
    } else {
      setShowJumpButton(true);
      lastScrolledMessageIdRef.current = lastMessageId;
    }
  }, [lastMessageId, lastMessage, user?.id, items.length]);

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom;
    if (atBottom) setShowJumpButton(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'smooth',
      align: 'end',
    });
    setShowJumpButton(false);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <MessageSkeleton />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="relative h-full w-full">
      <Virtuoso
        ref={virtuosoRef}
        data={items}
        style={{ height: '100%', width: '100%' }}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={items.length - 1}
        startReached={handleStartReached}
        atBottomStateChange={handleAtBottomStateChange}
        atBottomThreshold={100}
        increaseViewportBy={{ top: 400, bottom: 200 }}
        itemContent={(_index, item) => {
          if (item.kind === 'divider') {
            return (
              <div className="my-4 flex w-full items-center gap-3 px-4">
                <div className="h-px flex-1 bg-border" />
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {item.date}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            );
          }
          return (
            <MessageGroup
              group={item.group}
              conversation={conversation}
              onEdit={onEdit}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
              onReact={onReact}
            />
          );
        }}
      />

      {showJumpButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-4 left-1/2 z-10 -translate-x-1/2',
            'flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg',
            'transition-all hover:bg-primary/90'
          )}
          aria-label="Jump to newest message"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          New messages
        </button>
      )}
    </div>
  );
}
