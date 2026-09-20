/**
 * Helpers for rendering messages: grouping, sender extraction, previews.
 */

import type { Message, UserPublic } from '@/types';

/**
 * Extract the sender ID whether the `sender` field is populated or not.
 */
export function messageSenderId(message: Message): string | null {
  const s = message.sender;
  if (!s) return null;
  if ('id' in s && s.id) return s.id;
  return null;
}

/**
 * Extract the sender object if populated.
 */
export function messageSender(message: Message): UserPublic | null {
  const s = message.sender;
  if (!s) return null;
  if ('username' in s) return s as UserPublic;
  return null;
}

/**
 * Group consecutive messages from the same sender within a time window.
 *
 * @param messages Sorted oldest → newest
 * @param windowMs Max gap between messages to be grouped (default 5 min)
 */
export interface MessageGroupData {
  senderId: string;
  sender: UserPublic | null;
  messages: Message[];
  isMine: boolean;
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function groupMessages(
  messages: Message[],
  myUserId: string
): MessageGroupData[] {
  const groups: MessageGroupData[] = [];

  for (const msg of messages) {
    const senderId = messageSenderId(msg) || 'unknown';
    const last = groups[groups.length - 1];

    const withinWindow =
      last &&
      last.senderId === senderId &&
      new Date(msg.createdAt).getTime() -
        new Date(last.messages[last.messages.length - 1]!.createdAt).getTime() <
        GROUP_WINDOW_MS;

    if (withinWindow) {
      last.messages.push(msg);
    } else {
      groups.push({
        senderId,
        sender: messageSender(msg),
        messages: [msg],
        isMine: senderId === myUserId,
      });
    }
  }

  return groups;
}

/**
 * Human-friendly preview text for a message. Used in reply previews.
 */
export function messagePreview(message: Message): string {
  if (message.isDeleted) return 'This message was deleted';
  if (message.content && message.content.trim()) {
    return message.content.length > 100
      ? `${message.content.slice(0, 100)}…`
      : message.content;
  }
  if (message.attachments?.length) {
    const first = message.attachments[0]!;
    switch (first.type) {
      case 'image':
        return '📷 Photo';
      case 'file':
        return '📎 File';
      case 'audio':
        return '🎤 Audio';
      case 'video':
        return '🎬 Video';
      default:
        return 'Attachment';
    }
  }
  return '';
}

/**
 * Group reactions by emoji, returning counts and whether the current user reacted.
 */
export interface ReactionGroup {
  emoji: string;
  count: number;
  mine: boolean;
}

export function groupReactions(
  message: Message,
  _myUserId: string
): ReactionGroup[] {
  // The backend returns a summary: { [emoji]: { count, mine } }
  // where "mine" is computed for the caller.
  return Object.entries(message.reactions || {})
    .map(([emoji, info]) => ({
      emoji,
      count: info.count,
      mine: info.mine,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * True if the given message and timestamp should render a date divider above it.
 * Dates are compared in the user's local timezone.
 */
export function shouldShowDateDivider(
  current: Message,
  previous: Message | undefined
): boolean {
  if (!previous) return true;
  const a = new Date(current.createdAt);
  const b = new Date(previous.createdAt);
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}