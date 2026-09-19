/**
 * Message endpoints.
 */

import { api } from './client';
import type {
  ApiSuccess,
  Attachment,
  CursorResponse,
  Message,
  MessageType,
} from '@/types';

export interface SendMessageInput {
  conversationId: string;
  content?: string;
  type?: MessageType;
  attachments?: Attachment[];
  replyTo?: string | null;
  mentions?: string[];
}

export interface GetHistoryParams {
  limit?: number;
  before?: string;
  after?: string;
}

export interface SearchMessagesParams {
  q: string;
  conversationId?: string;
  senderId?: string;
  from?: string;
  to?: string;
  hasAttachment?: boolean;
  limit?: number;
  before?: string;
}

export interface ForwardMessageInput {
  messageId: string;
  conversationId: string;
}

export type DeleteScope = 'me' | 'everyone';

export const messagesApi = {
  send: (input: SendMessageInput) =>
    api.post<ApiSuccess<{ message: Message }>>('/messages', input),

  getHistory: (conversationId: string, params: GetHistoryParams = {}) =>
    api.get<ApiSuccess<CursorResponse<Message>>>(`/messages/${conversationId}`, {
      params,
    }),

  getById: (id: string) =>
    api.get<ApiSuccess<{ message: Message }>>(`/messages/message/${id}`),

  edit: (id: string, content: string) =>
    api.put<ApiSuccess<{ message: Message }>>(`/messages/${id}`, { content }),

  remove: (id: string, scope: DeleteScope = 'me') =>
    api.delete<ApiSuccess<{ deleted: DeleteScope; alreadyDeleted?: boolean }>>(
      `/messages/${id}`,
      { params: { for: scope } }
    ),

  addReaction: (id: string, emoji: string) =>
    api.post<ApiSuccess<{ added: boolean; emoji: string; replaced: boolean }>>(
      `/messages/${id}/reaction`,
      { emoji }
    ),

  removeReaction: (id: string) =>
    api.delete<ApiSuccess<{ removed: boolean }>>(`/messages/${id}/reaction`),

  star: (id: string) =>
    api.post<ApiSuccess<{ starred: boolean; alreadyStarred: boolean }>>(
      `/messages/${id}/star`
    ),

  unstar: (id: string) =>
    api.delete<ApiSuccess<{ unstarred: boolean }>>(`/messages/${id}/star`),

  pin: (id: string) =>
    api.post<ApiSuccess<{ pinned: boolean }>>(`/messages/${id}/pin`),

  unpin: (id: string) =>
    api.delete<ApiSuccess<{ unpinned: boolean }>>(`/messages/${id}/pin`),

  markRead: (id: string) =>
    api.post<ApiSuccess<{ read: boolean; alreadyRead: boolean }>>(
      `/messages/${id}/read`
    ),

    markDelivered: (id: string) =>
      api.post<ApiSuccess<{ delivered: boolean; alreadyDelivered: boolean }>>(
        `/messages/${id}/deliver`
    ),

  forward: (input: ForwardMessageInput) =>
    api.post<ApiSuccess<{ message: Message }>>('/messages/forward', input),

  search: (params: SearchMessagesParams) =>
    api.get<ApiSuccess<CursorResponse<Message>>>('/messages/search', { params }),
};