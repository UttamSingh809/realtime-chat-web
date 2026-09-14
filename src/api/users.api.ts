/**
 * User endpoints.
 */

import { api } from './client';
import type {
  ApiSuccess,
  PaginatedResponse,
  UserPublic,
  UserSelf,
  UserStatus,
  UserSettings,
  Avatar,
} from '@/types';

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  phone?: string | null;
  statusMessage?: string;
  avatar?: Partial<Avatar>;
}

export interface UpdateSettingsInput {
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  theme?: UserSettings['theme'];
  language?: string;
}

export interface SearchUsersParams {
  q?: string;
  limit?: number;
  page?: number;
}

export const usersApi = {
  getMe: () => api.get<ApiSuccess<{ user: UserSelf }>>('/users/me'),

  updateProfile: (input: UpdateProfileInput) =>
    api.put<ApiSuccess<{ user: UserSelf }>>('/users/me', input),

  updateSettings: (input: UpdateSettingsInput) =>
    api.put<ApiSuccess<{ user: UserSelf }>>('/users/me/settings', input),

  updateStatus: (status: UserStatus, statusMessage?: string) =>
    api.put<
      ApiSuccess<{ status: UserStatus; statusMessage: string; lastSeen: string }>
    >('/users/me/status', { status, statusMessage }),

  search: (params: SearchUsersParams) =>
    api.get<ApiSuccess<PaginatedResponse<UserPublic>>>('/users', { params }),

  listOnline: (limit = 50) =>
    api.get<ApiSuccess<{ users: UserPublic[] }>>('/users/online', {
      params: { limit },
    }),

  getById: (id: string) =>
    api.get<ApiSuccess<{ user: UserPublic }>>(`/users/${id}`),

  block: (id: string) =>
    api.post<ApiSuccess<{ blocked: boolean; alreadyBlocked: boolean }>>(
      `/users/${id}/block`
    ),

  unblock: (id: string) =>
    api.delete<ApiSuccess<{ unblocked: boolean }>>(`/users/${id}/block`),

  listBlocked: () =>
    api.get<ApiSuccess<{ users: UserPublic[] }>>('/users/blocked'),

  mute: (id: string) =>
    api.post<ApiSuccess<{ muted: boolean; alreadyMuted: boolean }>>(
      `/users/${id}/mute`
    ),

  unmute: (id: string) =>
    api.delete<ApiSuccess<{ unmuted: boolean }>>(`/users/${id}/mute`),

  listMuted: () =>
    api.get<ApiSuccess<{ users: UserPublic[] }>>('/users/muted'),
};