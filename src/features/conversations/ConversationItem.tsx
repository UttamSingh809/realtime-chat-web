/**
 * ConversationItem — real data version.
 * Reads from a Conversation object and renders the row.
 */

import { NavLink } from 'react-router-dom';
import { BellOff, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeShort, initialsFromName } from '@/lib/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types';
import {
  conversationAvatarUrl,
  conversationDisplayName,
  conversationOnlineStatus,
  conversationPreview,
} from './conversationUtils';
import { ConversationActionsMenu } from './ConversationActionsMenu';

interface Props {
  conversation: Conversation;
  viewerId: string;
}

export function ConversationItem({ conversation, viewerId }: Props) {
  const name = conversationDisplayName(conversation, viewerId);
  const preview = conversationPreview(conversation);
  const avatarUrl = conversationAvatarUrl(conversation, viewerId);
  const { isOnline } = conversationOnlineStatus(conversation, viewerId);
  const initials = initialsFromName(name);

  const { unreadCount, pinned, muted } = conversation.myFlags;
  const timestamp = conversation.lastMessage?.createdAt || conversation.updatedAt;

  return (
    <NavLink
      to={`/app/chat/${conversation.id}`}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 transition-colors',
          'hover:bg-accent/50',
          isActive && 'bg-accent'
        )
      }
    >
      {/* Avatar + presence dot */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {isOnline && (
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-success"
            aria-label="Online"
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{name}</span>

          {pinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
          {muted && <BellOff className="h-3 w-3 shrink-0 text-muted-foreground" />}

          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
            {formatRelativeShort(timestamp)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-xs',
              unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            {preview}
          </p>

          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            <ConversationActionsMenu conversation={conversation} />
          </div>
        </div>
      </div>
    </NavLink>
  );
}
