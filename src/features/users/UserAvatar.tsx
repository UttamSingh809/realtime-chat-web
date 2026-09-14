/**
 * UserAvatar — avatar + optional presence dot.
 */

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initialsFromName } from '@/lib/format';
import type { UserPublic, UserStatus } from '@/types';

interface Props {
  user: Pick<UserPublic, 'name' | 'avatar' | 'status'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const DOT_SIZE_CLASSES: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
};

function presenceColor(status: UserStatus | undefined): string {
  switch (status) {
    case 'online':
      return 'bg-success';
    case 'away':
      return 'bg-warning';
    case 'busy':
      return 'bg-destructive';
    default:
      return 'bg-muted-foreground/40';
  }
}

export function UserAvatar({ user, size = 'md', showPresence = false, className }: Props) {
  const initials = initialsFromName(user.name);
  const sizeClass = SIZE_CLASSES[size];
  const dotClass = DOT_SIZE_CLASSES[size];

  return (
    <div className={cn('relative shrink-0', className)}>
      <Avatar className={sizeClass}>
        {user.avatar?.url ? <AvatarImage src={user.avatar.url} alt={user.name} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {showPresence && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-card',
            dotClass,
            presenceColor(user.status)
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
