/**
 * TypingIndicator — shows who's typing in the current conversation.
 *
 * Formats:
 *   1 user:   "Alice is typing…"
 *   2 users:  "Alice and Bob are typing…"
 *   3+ users: "Several people are typing…"
 */

import { useAuth } from '@/features/auth';
import { useTypingStore } from './useTypingIndicator';
import type { UserPublic } from '@/types';

interface Props {
  conversationId: string;
  /** Lookup map from userId → display name. Usually participants. */
  userLookup: Record<string, Pick<UserPublic, 'id' | 'name'> | undefined>;
}

export function TypingIndicator({ conversationId, userLookup }: Props) {
  const { user } = useAuth();
  const typingSet = useTypingStore((s) => s.typing[conversationId]);

  if (!typingSet || typingSet.size === 0 || !user) return null;

  // Filter out self (shouldn't happen, but defensive)
  const others = Array.from(typingSet).filter((id) => id !== user.id);
  if (others.length === 0) return null;

  const names = others.map((id) => userLookup[id]?.name).filter((name): name is string => !!name);

  let text: string;
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = 'Several people are typing';
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      </span>
      <span>{text}…</span>
    </div>
  );
}
