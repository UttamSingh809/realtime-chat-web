/**
 * useTypingIndicator — emit and observe typing state for a conversation.
 */

import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { useSocket } from '@/features/socket';
import type { TypingEvent } from '@/types';

const AUTO_STOP_MS = 2500;
const TYPING_TIMEOUT_MS = 5000;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TypingState {
  typing: Record<string, Set<string>>;
  setTyping: (conversationId: string, userId: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  clearConversation: (conversationId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typing: {},
  setTyping: (conversationId, userId) =>
    set((state) => {
      const next = new Set(state.typing[conversationId] ?? []);
      next.add(userId);
      return { typing: { ...state.typing, [conversationId]: next } };
    }),
  clearTyping: (conversationId, userId) =>
    set((state) => {
      const next = new Set(state.typing[conversationId] ?? []);
      next.delete(userId);
      return { typing: { ...state.typing, [conversationId]: next } };
    }),
  clearConversation: (conversationId) =>
    set((state) => {
      const next = { ...state.typing };
      delete next[conversationId];
      return { typing: next };
    }),
}));

// ---------------------------------------------------------------------------
// Emitter
// ---------------------------------------------------------------------------

export function useTypingEmitter(conversationId: string | undefined) {
  const socket = useSocket();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stop = useCallback(() => {
    if (!conversationId || !socket) return;
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit('typing:stop', { conversationId });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [conversationId, socket]);

  const start = useCallback(() => {
    if (!conversationId || !socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { conversationId });
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(stop, AUTO_STOP_MS);
  }, [conversationId, socket, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}

// ---------------------------------------------------------------------------
// Subscriber
// ---------------------------------------------------------------------------

export function useTypingSubscription(conversationId: string | undefined) {
  const socket = useSocket();
  const setTyping = useTypingStore((s) => s.setTyping);
  const clearTyping = useTypingStore((s) => s.clearTyping);
  const clearConversation = useTypingStore((s) => s.clearConversation);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket || !conversationId) return;

    const startHandler = (payload: TypingEvent) => {
      if (payload.conversationId !== conversationId) return;

      setTyping(payload.conversationId, payload.userId);

      const key = `${payload.conversationId}:${payload.userId}`;
      const existing = timeoutsRef.current.get(key);
      if (existing) clearTimeout(existing);

      const t = setTimeout(() => {
        clearTyping(payload.conversationId, payload.userId);
        timeoutsRef.current.delete(key);
      }, TYPING_TIMEOUT_MS);
      timeoutsRef.current.set(key, t);
    };

    const stopHandler = (payload: TypingEvent) => {
      if (payload.conversationId !== conversationId) return;
      clearTyping(payload.conversationId, payload.userId);
      const key = `${payload.conversationId}:${payload.userId}`;
      const existing = timeoutsRef.current.get(key);
      if (existing) {
        clearTimeout(existing);
        timeoutsRef.current.delete(key);
      }
    };

    socket.on('typing:start', startHandler);
    socket.on('typing:stop', stopHandler);

    return () => {
      socket.off('typing:start', startHandler);
      socket.off('typing:stop', stopHandler);

      const conversationTimeouts = Array.from(timeoutsRef.current.entries()).filter(
        ([key]) => key.startsWith(`${conversationId}:`)
      );
      conversationTimeouts.forEach(([, t]) => clearTimeout(t));
      conversationTimeouts.forEach(([key]) => timeoutsRef.current.delete(key));

      clearConversation(conversationId);
    };
  }, [socket, conversationId, setTyping, clearTyping, clearConversation]);
}