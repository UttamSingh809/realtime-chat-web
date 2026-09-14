/**
 * Auth endpoints.
 */

import { api } from './client';
import type { ApiSuccess, AuthResponse, AuthTokens, UserSelf } from '@/types';

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (input: RegisterInput) =>
    api.post<ApiSuccess<AuthResponse>>('/auth/register', input),

  login: (input: LoginInput) =>
    api.post<ApiSuccess<AuthResponse>>('/auth/login', input),

  refresh: () =>
    api.post<ApiSuccess<AuthTokens>>('/auth/refresh', {}),

  logout: () =>
    api.post<ApiSuccess<{ revoked: boolean }>>('/auth/logout', {}),

  logoutAll: () =>
    api.post<ApiSuccess<{ revokedCount: number }>>('/auth/logout-all', {}),

  forgotPassword: (email: string) =>
    api.post<ApiSuccess<{ sent: boolean }>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiSuccess<{ success: boolean }>>('/auth/reset-password', {
      token,
      password,
    }),

  me: () => api.get<ApiSuccess<{ user: UserSelf }>>('/auth/me'),

  changePassword: (input: ChangePasswordInput) =>
    api.put<ApiSuccess<{ success: boolean }>>('/auth/change-password', input),
};