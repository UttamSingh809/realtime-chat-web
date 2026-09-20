import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { normalizeError } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

describe('api/client', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  describe('normalizeError', () => {
    it('extracts message and code from an axios server error', () => {
      const axiosError = new axios.AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: {},
          config: {} as never,
          data: {
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: [{ path: 'email', message: 'must be valid' }],
          },
        }
      );

      const result = normalizeError(axiosError);

      expect(result.status).toBe(422);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Validation failed');
      expect(result.details).toEqual([{ path: 'email', message: 'must be valid' }]);
    });

    it('handles network errors (no response)', () => {
      const networkError = new axios.AxiosError(
        'Network Error',
        'ERR_NETWORK',
        undefined,
        undefined,
        undefined
      );

      const result = normalizeError(networkError);

      expect(result.status).toBe(0);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Network Error');
    });

    it('handles non-axios errors', () => {
      const result = normalizeError(new Error('boom'));
      expect(result.code).toBe('CLIENT_ERROR');
      expect(result.message).toBe('boom');
      expect(result.status).toBe(0);
    });

    it('handles completely unknown errors', () => {
      const result = normalizeError('a string');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.status).toBe(0);
    });
  });

  describe('auth store integration', () => {
    it('setAuth updates token and user', () => {
      const mockUser = { id: '1', name: 'Alice' } as never;
      useAuthStore.getState().setAuth('token-abc', mockUser);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('token-abc');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clearAuth resets everything', () => {
      useAuthStore.getState().setAccessToken('x');
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});