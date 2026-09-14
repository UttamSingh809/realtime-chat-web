/**
 * Helpers for rendering conversations.
 */

import type { Conversation, UserPublic, Participant } from '@/types';

/**
 * Extract the "other" participant from a private conversation.
 * Returns null if the conversation is a group or if the viewer isn't in it.
 */
export function otherParticipant(
  conv: Conversation,
  viewerId: string
): UserPublic | null {
  if (conv.type !== 'private') return null;
  const other = conv.participants.find((p) => {
    const user = p.user as UserPublic;
    return user?.id && user.id !== viewerId;
  });
  if (!other) return null;
  const user = other.user as UserPublic;
  return user?.id ? user : null;
}

/**
 * Compute the display name for a conversation:
 *   - Private: the other participant's name
 *   - Group: the group's name
 */
export function conversationDisplayName(
  conv: Conversation,
  viewerId: string
): string {
  if (conv.type === 'group') {
    return conv.group?.name || 'Unnamed group';
  }
  const other = otherParticipant(conv, viewerId);
  return other?.name || 'Unknown user';
}

/**
 * Compute the avatar URL for a conversation.
 */
export function conversationAvatarUrl(
  conv: Conversation,
  viewerId: string
): string | null {
  if (conv.type === 'group') {
    return conv.group?.avatar?.url || null;
  }
  const other = otherParticipant(conv, viewerId);
  return other?.avatar?.url || null;
}

/**
 * Compute the online status for a private conversation.
 * Groups are always considered "offline" for status-dot purposes.
 */
export function conversationOnlineStatus(
  conv: Conversation,
  viewerId: string
): { isOnline: boolean; status: UserPublic['status'] | null } {
  if (conv.type === 'group') {
    return { isOnline: false, status: null };
  }
  const other = otherParticipant(conv, viewerId);
  if (!other) return { isOnline: false, status: null };
  return {
    isOnline: other.status === 'online' || other.status === 'away' || other.status === 'busy',
    status: other.status,
  };
}

/**
 * Get the preview text for a conversation's last message.
 * Truncates and handles attachments gracefully.
 */
export function conversationPreview(conv: Conversation): string {
  if (!conv.lastMessage) return 'No messages yet';

  const { content, type } = conv.lastMessage;

  if (!content || content.length === 0) {
    switch (type) {
      case 'image':
        return '📷 Photo';
      case 'file':
        return '📎 File';
      case 'audio':
        return '🎤 Audio';
      case 'video':
        return '🎬 Video';
      default:
        return 'New message';
    }
  }

  return content.length > 80 ? `${content.slice(0, 80)}…` : content;
}

/**
 * Sort conversations: pinned first, then by most recent activity.
 * Used as a fallback when the backend doesn't already sort this way.
 */
export function sortConversations(convs: Conversation[]): Conversation[] {
  return [...convs].sort((a, b) => {
    if (a.myFlags.pinned !== b.myFlags.pinned) {
      return a.myFlags.pinned ? -1 : 1;
    }
    const aTime = a.lastMessage?.createdAt || a.updatedAt;
    const bTime = b.lastMessage?.createdAt || b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}