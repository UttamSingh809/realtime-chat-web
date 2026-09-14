/**
 * MessageGroup — several consecutive messages from one sender.
 */

import { cn } from '@/lib/utils';
import { UserAvatar } from '@/features/users';
import { useAuth } from '@/features/auth';
import type { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import type { MessageGroupData } from './messageUtils';
import { formatRelativeShort } from '@/lib/format';

interface Props {
  group: MessageGroupData;
  onEdit: (messageId: string, content: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageGroup({
  group,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReact,
}: Props) {
  const { user } = useAuth();
  if (!user) return null;

  const { isMine, messages, sender } = group;

  return (
    <div className={cn('flex gap-3 px-4 py-1', isMine && 'flex-row-reverse')}>
      {/* Sender avatar (only shown for other people's messages) */}
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
        {/* Sender name + time (only for other people's groups) */}
        {!isMine && sender && (
          <div className="flex items-baseline gap-2 px-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sender.name}</span>
            <span>{formatRelativeShort(messages[0]!.createdAt)}</span>
          </div>
        )}

        {/* Bubbles */}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
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
