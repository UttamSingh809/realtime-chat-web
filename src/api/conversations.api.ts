/**
 * Conversation endpoints.
 */

import { api } from './client';
import type {
  ApiSuccess,
  Conversation,
  CursorResponse,
  ParticipantRole,
  Avatar,
} from '@/types';

export interface CreatePrivateInput {
  type: 'private';
  recipientId: string;
}

export interface CreateGroupInput {
  type: 'group';
  name: string;
  description?: string;
  participants: string[];
  avatar?: Partial<Avatar>;
}

export type CreateConversationInput = CreatePrivateInput | CreateGroupInput;

export interface ListConversationsParams {
  archived?: boolean;
  pinned?: boolean;
  limit?: number;
  before?: string;
}

export interface UpdateConversationInput {
  name?: string;
  description?: string;
  avatar?: Partial<Avatar>;
}

export interface AddMemberInput {
  userId: string;
}

export interface UpdateRoleInput {
  role: Exclude<ParticipantRole, 'owner'>;
}

export const conversationsApi = {
  create: (input: CreateConversationInput) =>
    api.post<ApiSuccess<{ conversation: Conversation; created: boolean }>>('/conversations', input),

  list: (params: ListConversationsParams = {}) =>
    api.get<ApiSuccess<CursorResponse<Conversation>>>('/conversations', { params }),

  getById: (id: string) =>
    api.get<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}`),

  update: (id: string, input: UpdateConversationInput) =>
    api.put<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}`, input),

  leave: (id: string) => api.delete<ApiSuccess<{ left: boolean }>>(`/conversations/${id}`),

  addMember: (id: string, input: AddMemberInput) =>
    api.post<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}/members`, input),

  removeMember: (id: string, userId: string) =>
    api.delete<ApiSuccess<{ conversation: Conversation }>>(
      `/conversations/${id}/members/${userId}`
    ),

  updateMemberRole: (id: string, userId: string, input: UpdateRoleInput) =>
    api.put<ApiSuccess<{ conversation: Conversation }>>(
      `/conversations/${id}/members/${userId}/role`,
      input
    ),

  pin: (id: string, pinned: boolean) =>
    api.put<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}/pin`, { pinned }),

  archive: (id: string, archived: boolean) =>
    api.put<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}/archive`, {
      archived,
    }),

  mute: (id: string, muted: boolean, mutedUntil?: string | null) =>
    api.put<ApiSuccess<{ conversation: Conversation }>>(`/conversations/${id}/mute`, {
      muted,
      mutedUntil,
    }),

  markRead: (id: string, upToMessageId?: string) =>
    api.post<
      ApiSuccess<{
        unreadCount: number;
        lastReadAt: string;
        lastReadMessageId: string | null;
      }>
    >(`/conversations/${id}/read`, { upToMessageId }),
};