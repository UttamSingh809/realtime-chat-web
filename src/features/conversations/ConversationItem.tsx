/**
 * ConversationItem — real data version.
 * Uses the shared UserAvatar which reads live presence from the store.
 */

import { NavLink } from 'react-router-dom';
import { BellOff, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { formatRelativeShort } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/features/users';
import type { Conversation, UserPublic } from '@/types';
import {
  conversationDisplayName,
  conversationAvatarUrl,
  conversationPreview,
} from './conversationUtils';
import { ConversationActionsMenu } from './ConversationActionsMenu';

interface Props {
  conversation: Conversation;
  viewerId: string;
}

export function ConversationItem({ conversation, viewerId }: Props) {
  const name = conversationDisplayName(conversation, viewerId);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const preview = conversationPreview(conversation);
  const avatarUrl = conversationAvatarUrl(conversation, viewerId);

  const { unreadCount, pinned, muted } = conversation.myFlags;
  const timestamp = conversation.lastMessage?.createdAt || conversation.updatedAt;

  // For DMs, we want the LIVE status of the other user (from the store).
  // For groups, presence isn't shown.
  // We pass a minimal user shape to UserAvatar; it will read the live
  // status itself from the presence store.
  const otherUser =
    conversation.type === 'private'
      ? conversation.participants.find((p) => {
          const u = p.user as UserPublic;
          return u?.id && u.id !== viewerId;
        })
      : undefined;

  const avatarUser = otherUser
    ? {
        ...(otherUser.user as UserPublic),
        name,
        avatar: { url: avatarUrl, publicId: null },
      }
    : {
        // Group fallback
        id: conversation.id,
        name,
        avatar: { url: avatarUrl, publicId: null },
        status: 'offline' as const,
      };

  return (
    <NavLink
      to={`/app/chat/${conversation.id}`}
      onClick={closeMobileSidebar}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 transition-colors',
          'hover:bg-accent/50',
          isActive && 'bg-accent'
        )
      }
    >
      {/* Avatar — LIVE presence for private conversations */}
      <UserAvatar user={avatarUser} size="md" showPresence={conversation.type === 'private'} />

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
