/**
 * API client — the single axios instance for the app.
 *
 * Responsibilities:
 *   - Base URL from env
 *   - Bearer token injection
 *   - Auto-refresh on 401 TOKEN_EXPIRED (single-flight)
 *   - Request queue for concurrent 401s
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
  withCredentials: true, // send/receive HttpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Refresh-in-flight coordination (single-flight)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<AuthTokens> | null = null;

/**
 * Call the backend's refresh endpoint using the HttpOnly cookie (or fallback
 * token from localStorage if the cookie path fails).
 */
async function performRefresh(): Promise<AuthTokens> {
  // Use a fresh axios instance to avoid the interceptor recursion.
  const { data } = await axios.post<{ data: AuthTokens }>(
    `${API_URL}/auth/refresh`,
    {}, // body empty — refresh token comes from cookie
    {
      withCredentials: true,
      timeout: 15000,
    }
  );
  return data.data;
}

/**
 * Single-flight refresh. Concurrent 401s share the same promise.
 */
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
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 and normalize errors
// ---------------------------------------------------------------------------

/**
 * Extend request config with a flag so we don't infinite-loop on retried 401s.
 */
interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // -----------------------------------------------------------------
    // Handle 401 → try to refresh once
    // -----------------------------------------------------------------
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
        // Refresh failed — session is dead. Clear auth and reject.
        useAuthStore.getState().clearAuth();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(normalizeError(error));
      }
    }

    // -----------------------------------------------------------------
    // If the refresh attempt itself failed → log out hard
    // -----------------------------------------------------------------
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

/**
 * Turn any thrown error into a consistent ApiError object.
 * This is what hooks and components will catch.
 */
export function normalizeError(error: unknown): ApiError {
  // Axios error with a server response
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;

    return {
      message: body?.message || error.message || 'Something went wrong',
      code: body?.code || 'UNKNOWN_ERROR',
      status: error.response?.status ?? 0,
      details: body?.details,
    };
  }

  // Network error or something entirely unexpected
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
// Convenience methods (typed wrappers)
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