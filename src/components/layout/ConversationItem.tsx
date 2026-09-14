/**
 * ConversationItem — a single row in the sidebar.
 * Placeholder for now; will render real Conversation data in Step 7.
 */

import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export interface ConversationItemProps {
  id: string;
  name: string;
  preview: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  isOnline?: boolean;
  timestamp?: string;
}

export function ConversationItem({
  id,
  name,
  preview,
  avatarUrl,
  unreadCount = 0,
  isOnline = false,
}: ConversationItemProps) {
  const initials = name
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <NavLink
      to={`/app/chat/${id}`}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 transition-colors',
          'hover:bg-accent/50',
          isActive && 'bg-accent'
        )
      }
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{name}</span>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{preview}</p>
      </div>
    </NavLink>
  );
}
