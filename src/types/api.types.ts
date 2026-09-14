/**
 * Generic API response and error types.
 * Mirrors the backend's response envelope:
 *   Success: { success: true, data: T }
 *   Error:   { success: false, message, code, details? }
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code: string;
  details?: ApiErrorDetail[];
  stack?: string; // present in development
}

/**
 * The normalized error type thrown by our axios client.
 * Components and hooks should always work with this shape.
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: ApiErrorDetail[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CursorMeta {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface CursorResponse<T> {
  items: T[];
  meta: CursorMeta;
}