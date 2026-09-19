/**
 * MessageList — the virtualized message list.
 *
 * Uses react-virtuoso in "reverse" mode (newest at bottom, grows upward)
 * with `firstItemIndex` to prepend older messages without scroll jumps.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/features/auth';
import { MessageGroup } from './MessageGroup';
import { MessageSkeleton } from './MessageSkeleton';
import { groupMessages, shouldShowDateDivider } from './messageUtils';
import type { Conversation, Message } from '@/types';

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

  // Compute the "first item index" anchor so prepending older messages
  // doesn't cause the viewport to jump. Virtuoso wants a number that
  // decreases as we prepend more items above.
  const [firstItemIndex, setFirstItemIndex] = useState(1_000_000);
  const lastCount = useRef(0);

  useEffect(() => {
    const added = messages.length - lastCount.current;
    if (added > 0 && lastCount.current > 0) {
      // We added items at the top → decrement the anchor
      setFirstItemIndex((idx) => idx - added);
    }
    lastCount.current = messages.length;
  }, [messages.length]);

  // Build render items: interleave date dividers with grouped messages
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

  const handleStartReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden">
        <MessageSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Caller renders the empty state
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={items}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={items.length - 1}
        startReached={handleStartReached}
        followOutput="smooth"
        atBottomThreshold={80}
        increaseViewportBy={{ top: 400, bottom: 400 }}
        itemContent={(_index, item) => {
          if (item.kind === 'divider') {
            return (
              <div className="my-4 flex items-center gap-3 px-4">
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
    </div>
  );
}
