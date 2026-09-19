/**
 * MessageReadInfo — "Read by Alice" / "Read by 3" label for group chats.
 *
 * For 1:1 DMs, we just show the tick (no text).
 * For groups, we show "Read by N" or "Read by Alice, Bob" when N ≤ 2.
 */

import { cn } from '@/lib/utils';
import type { UserPublic } from '@/types';

interface Props {
  readers: UserPublic[];
  pending: UserPublic[];
  isGroup: boolean;
  isMine: boolean;
  className?: string;
}

export function MessageReadInfo({ readers, pending, isGroup, isMine, className }: Props) {
  if (!isGroup) return null;
  if (readers.length === 0) return null;

  const baseClass = cn(
    'text-[10px]',
    isMine ? 'text-primary-foreground/70' : 'text-muted-foreground',
    className
  );

  if (readers.length === 1 && readers[0]) {
    return <span className={baseClass}>Read by {readers[0].name.split(' ')[0]}</span>;
  }

  if (readers.length === 2 && readers[0] && readers[1]) {
    return (
      <span className={baseClass}>
        Read by {readers[0].name.split(' ')[0]}, {readers[1].name.split(' ')[0]}
      </span>
    );
  }

  void pending;
  return <span className={baseClass}>Read by {readers.length}</span>;
}
