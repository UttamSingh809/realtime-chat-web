/**
 * Socket.io event payloads. Mirrors the backend contract.
 */

import type { Message, Conversation, Notification, UserStatus } from './models';

// ---------------------------------------------------------------------------
// Client → Server
// ---------------------------------------------------------------------------

export interface UserStatusPayload {
  status: UserStatus;
  statusMessage?: string;
}

export interface ConversationJoinPayload {
  conversationId: string;
}

export interface ConversationLeavePayload {
  conversationId: string;
}

export interface TypingPayload {
  conversationId: string;
}

export interface MessageReadPayload {
  conversationId: string;
  upToMessageId?: string;
}

export interface SocketAck<T = unknown> {
  data?: T;
  error?: { code: string; message: string };
}

// ---------------------------------------------------------------------------
// Server → Client
// ---------------------------------------------------------------------------

export interface ConnectedEvent {
  userId: string;
  socketId: string;
}

export interface MessageNewEvent {
  message: Message;
  conversationId: string;
}

export interface MessageEditedEvent {
  message: Message;
}

export interface MessageDeletedEvent {
  conversationId: string;
  messageId: string;
  deletedForEveryone: boolean;
  actorId: string;
}

export interface MessageReactionEvent {
  conversationId: string;
  messageId: string;
  userId: string;
  emoji: string | null;
  added: boolean;
}

export interface MessageReadEvent {
  conversationId: string;
  userId: string;
  upToMessageId: string | null;
  readAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
}

export interface UserStatusEvent {
  userId: string;
  status: UserStatus;
  lastSeen: string;
  statusMessage?: string;
}

export interface ConversationNewEvent {
  conversation: Conversation;
}

export interface ConversationUpdatedEvent {
  conversationId: string;
  changes: Partial<Conversation>;
}

export interface NotificationNewEvent {
  notification: Notification;
}

export interface OnlineUsersEvent {
  userIds: string[];
}

export interface SocketErrorEvent {
  code: string;
  message: string;
}

/**
 * Type-safe map of server events.
 */
export interface ServerToClientEvents {
  connected: (payload: ConnectedEvent) => void;
  'message:new': (payload: MessageNewEvent) => void;
  'message:edited': (payload: MessageEditedEvent) => void;
  'message:deleted': (payload: MessageDeletedEvent) => void;
  'message:reaction': (payload: MessageReactionEvent) => void;
  'message:read': (payload: MessageReadEvent) => void;
  'typing:start': (payload: TypingEvent) => void;
  'typing:stop': (payload: TypingEvent) => void;
  'user:status': (payload: UserStatusEvent) => void;
  'conversation:new': (payload: ConversationNewEvent) => void;
  'conversation:updated': (payload: ConversationUpdatedEvent) => void;
  'notification:new': (payload: NotificationNewEvent) => void;
  'online:users': (payload: OnlineUsersEvent) => void;
  error: (payload: SocketErrorEvent) => void;
}

/**
 * Type-safe map of client events.
 */
export interface ClientToServerEvents {
  ping: (cb?: (data: { pong: boolean; ts: number }) => void) => void;
  'user:status': (payload: UserStatusPayload, ack?: (res: SocketAck) => void) => void;
  'conversation:join': (payload: ConversationJoinPayload, ack?: (res: SocketAck) => void) => void;
  'conversation:leave': (payload: ConversationLeavePayload, ack?: (res: SocketAck) => void) => void;
  'typing:start': (payload: TypingPayload, ack?: (res: SocketAck) => void) => void;
  'typing:stop': (payload: TypingPayload, ack?: (res: SocketAck) => void) => void;
  'message:read': (payload: MessageReadPayload, ack?: (res: SocketAck) => void) => void;
}