/**
 * Message delivery status — computed client-side from the message's
 * deliveredTo and readBy arrays.
 */

import type { Message, Conversation, UserPublic } from '@/types';

export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read' | 'unknown';

/**
 * Extract the sender ID from a message (populated or not).
 */
function senderIdOf(message: Message): string | null {
  const s = message.sender;
  if (!s) return null;
  if ('id' in s && s.id) return s.id;
  return null;
}

/**
 * Get the list of participant IDs in a conversation, excluding a specific user
 * (usually the sender).
 */
function recipientIdsOf(conversation: Conversation, excludeId: string): string[] {
  return conversation.participants
    .map((p) => {
      const u = p.user as UserPublic;
      return u?.id;
    })
    .filter((id): id is string => !!id && id !== excludeId);
}

/**
 * Compute the delivery status of a message from the sender's perspective.
 *
 * Rules:
 *   - No message → 'unknown'
 *   - Message is optimistic (not yet persisted) → 'unknown'
 *   - Message is deleted → use whatever we had (usually 'sent')
 *   - All recipients in readBy → 'read'
 *   - All recipients in deliveredTo → 'delivered'
 *   - Otherwise → 'sent'
 */
export function getMessageStatus(
  message: Message,
  conversation: Conversation | undefined
): MessageDeliveryStatus {
  if (!message || message._optimistic) return 'unknown';
  if (!conversation) return 'unknown';

  const senderId = senderIdOf(message);
  if (!senderId) return 'unknown';

  const recipients = recipientIdsOf(conversation, senderId);
  if (recipients.length === 0) return 'sent';

  const readSet = new Set(message.readBy.map((r) => r.userId));
  const deliveredSet = new Set(message.deliveredTo.map((d) => d.userId));

  const allRead = recipients.every((id) => readSet.has(id));
  if (allRead) return 'read';

  const allDelivered = recipients.every((id) => deliveredSet.has(id));
  if (allDelivered) return 'delivered';

  return 'sent';
}

/**
 * For group chats: how many recipients have read the message?
 * Returns { read, total }.
 */
export function getReadCounts(
  message: Message,
  conversation: Conversation | undefined
): { read: number; total: number } {
  if (!message || !conversation) return { read: 0, total: 0 };

  const senderId = senderIdOf(message);
  if (!senderId) return { read: 0, total: 0 };

  const recipients = recipientIdsOf(conversation, senderId);
  const readSet = new Set(message.readBy.map((r) => r.userId));
  const read = recipients.filter((id) => readSet.has(id)).length;

  return { read, total: recipients.length };
}

/**
 * Get the list of UserPublic objects for users who have read the message.
 */
export function getReadersList(
  message: Message,
  conversation: Conversation | undefined
): UserPublic[] {
  if (!message || !conversation) return [];

  const senderId = senderIdOf(message);
  const readers = new Set(message.readBy.map((r) => r.userId));

  return conversation.participants
    .map((p) => p.user as UserPublic)
    .filter((u): u is UserPublic => !!u?.id && u.id !== senderId && readers.has(u.id));
}

/**
 * Get the list of users who have NOT yet read the message.
 * Used for "waiting on" info in groups.
 */
export function getPendingReadersList(
  message: Message,
  conversation: Conversation | undefined
): UserPublic[] {
  if (!message || !conversation) return [];

  const senderId = senderIdOf(message);
  const readers = new Set(message.readBy.map((r) => r.userId));

  return conversation.participants
    .map((p) => p.user as UserPublic)
    .filter((u): u is UserPublic => !!u?.id && u.id !== senderId && !readers.has(u.id));
}