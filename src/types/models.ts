/**
 * Domain models. Hand-written to mirror the backend response shapes
 * and extended with frontend-only fields (optimistic state, etc.).
 */

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type UserRole = 'user' | 'admin';
export type UserStatus = 'online' | 'offline' | 'away' | 'busy';
export type ThemePreference = 'light' | 'dark' | 'system';
export type AllowMessagesFrom = 'everyone' | 'contacts' | 'nobody';

export interface Avatar {
  url: string | null;
  publicId: string | null;
}

export interface NotificationSettings {
  messages: boolean;
  mentions: boolean;
  reactions: boolean;
  sound: boolean;
  email: boolean;
  push: boolean;
}

export interface PrivacySettings {
  showLastSeen: boolean;
  showOnlineStatus: boolean;
  readReceipts: boolean;
  allowMessagesFrom: AllowMessagesFrom;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  theme: ThemePreference;
  language: string;
}

/** Full self view — includes email, role, settings */
export interface UserSelf {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: Avatar;
  bio: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  statusMessage: string;
  lastSeen: string | null;
  isEmailVerified: boolean;
  settings: UserSettings;
  blockedCount: number;
  mutedCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Public view — what other users see */
export interface UserPublic {
  id: string;
  name: string;
  username: string;
  avatar: Avatar;
  bio: string;
  status: UserStatus;
  statusMessage: string;
  lastSeen: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------

export type ConversationType = 'private' | 'group';
export type ParticipantRole = 'owner' | 'admin' | 'member';

export interface GroupInfo {
  name: string;
  description: string;
  avatar: Avatar;
}

export interface Participant {
  user: UserPublic | { id: string };
  role: ParticipantRole;
  joinedAt: string;
}

export interface LastMessage {
  messageId: string;
  content: string;
  senderId: string | null;
  type: MessageType;
  createdAt: string | null;
}

export interface ConversationMyFlags {
  pinned: boolean;
  archived: boolean;
  muted: boolean;
  mutedUntil: string | null;
  unreadCount: number;
  lastReadAt: string | null;
  deleted: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  group: GroupInfo | null;
  participants: Participant[];
  lastMessage: LastMessage | null;
  myFlags: ConversationMyFlags;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
export type AttachmentType = 'image' | 'file' | 'audio' | 'video';

export interface Attachment {
  url: string;
  publicId: string | null;
  type: AttachmentType;
  mimeType: string | null;
  size: number;
  name: string | null;
  thumbnail: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface ReactionSummary {
  [emoji: string]: { count: number; mine: boolean };
}

export interface ReadReceipt {
  userId: string;
  readAt: string;
}

export interface DeliveredReceipt {
  userId: string;
  deliveredAt: string;
}

export interface ReplyPreview {
  id: string;
  content?: string;
  type?: MessageType;
  sender?: UserPublic | { id: string | null };
  deleted?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: UserPublic | { id: string | null };
  content: string;
  type: MessageType;
  attachments: Attachment[];
  replyTo: ReplyPreview | null;
  forwardedFrom: string | null;
  reactions: ReactionSummary;
  readBy: ReadReceipt[];
  deliveredTo: DeliveredReceipt[];
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  isStarred: boolean;
  isPinned: boolean;
  isSystemMessage: boolean;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  // ---------------------------------------------------------------------
  // Frontend-only fields for optimistic UI
  // ---------------------------------------------------------------------
  _optimistic?: boolean;
  _failed?: boolean;
  _tempId?: string;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export type NotificationType = 'message' | 'mention' | 'reaction' | 'system' | 'friend_request';
export type NotificationCategory = 'chat' | 'social' | 'system' | 'security';

export interface NotificationData {
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  emoji?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data: NotificationData;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserSelf;
}

// ---------------------------------------------------------------------------
// File upload
// ---------------------------------------------------------------------------

export interface UploadedFile extends Attachment {}