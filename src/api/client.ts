/**
 * API client — the single axios instance for the app.
 *
 * Responsibilities:
 *   - Base URL from env
 *   - Bearer token injection on every request
 *   - Auto-refresh on 401 TOKEN_EXPIRED (single-flight)
 *   - Error normalization to ApiError
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '@/lib/constants';
import { getAccessToken, useAuthStore } from '@/stores/auth.store';
import type { ApiError, ApiErrorBody, AuthTokens } from '@/types';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Refresh coordination
// ---------------------------------------------------------------------------

let refreshPromise: Promise<AuthTokens> | null = null;

async function performRefresh(): Promise<AuthTokens> {
  const { data } = await axios.post<{ data: AuthTokens }>(
    `${API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      timeout: 15000,
    }
  );
  return data.data;
}

function getRefreshedTokens(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = performRefresh()
      .then((tokens) => {
        useAuthStore.getState().setAccessToken(tokens.accessToken);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Request interceptor — attach token
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      // Use direct header assignment; AxiosHeaders accepts both .set() and
      // direct assignment, but assignment is more portable across versions.
      if (config.headers) {
        // AxiosHeaders instances support .set()
        if (typeof (config.headers as { set?: unknown }).set === 'function') {
          (config.headers as { set: (k: string, v: string) => void }).set(
            'Authorization',
            `Bearer ${token}`
          );
        } else {
          // Fallback for plain objects
          (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers = { Authorization: `Bearer ${token}` } as never;
      }

      // Debug: log what we're attaching
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(
          `[api →] ${config.method?.toUpperCase()} ${config.url}`,
          'auth:',
          `Bearer ${token.slice(0, 12)}...`
        );
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[api →] ${config.method?.toUpperCase()} ${config.url} — NO TOKEN`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 and normalize errors
// ---------------------------------------------------------------------------

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/logout');

    const shouldTryRefresh =
      status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint &&
      (code === 'TOKEN_EXPIRED' || code === 'NO_TOKEN' || code === undefined);

    if (shouldTryRefresh && originalRequest) {
      originalRequest._retry = true;

      try {
        const tokens = await getRefreshedTokens();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        };
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(normalizeError(error));
      }
    }

    if (status === 401 && isAuthEndpoint && originalRequest?.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return Promise.reject(normalizeError(error));
  }
);

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return {
      message: body?.message || error.message || 'Something went wrong',
      code: body?.code || 'UNKNOWN_ERROR',
      status: error.response?.status ?? 0,
      details: body?.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR',
      status: 0,
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    status: 0,
  };
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data),
};
