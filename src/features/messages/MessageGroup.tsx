/**
 * MessageGroup — several consecutive messages from one sender.
 */

import { cn } from '@/lib/utils';
import { UserAvatar } from '@/features/users';
import { useAuth } from '@/features/auth';
import { formatRelativeShort } from '@/lib/format';
import type { Conversation } from '@/types';
import { MessageBubble } from './MessageBubble';
import type { MessageGroupData } from './messageUtils';

interface Props {
  group: MessageGroupData;
  conversation: Conversation;
  onEdit: (messageId: string, content: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageGroup({
  group,
  conversation,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReact,
}: Props) {
  const { user } = useAuth();
  if (!user) return null;

  const { isMine, messages, sender } = group;

  return (
    <div className={cn('flex w-full gap-3 px-4 py-1', isMine && 'flex-row-reverse')}>
      {!isMine && (
        <div className="w-8 shrink-0">
          {sender ? (
            <UserAvatar user={sender} size="sm" showPresence={false} />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
        </div>
      )}

      <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', isMine && 'items-end')}>
        {!isMine && sender && (
          <div className="flex items-baseline gap-2 px-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sender.name}</span>
            <span>{formatRelativeShort(messages[0]!.createdAt)}</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            conversation={conversation}
            isMine={isMine}
            isLastInGroup={i === messages.length - 1}
            myUserId={user.id}
            onEdit={onEdit}
            onDeleteForMe={onDeleteForMe}
            onDeleteForEveryone={onDeleteForEveryone}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  );
}
