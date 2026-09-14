/**
 * MessageReactions — pills showing emoji reactions under a message.
 * Clicking a pill toggles my reaction.
 */

import { cn } from '@/lib/utils';
import type { ReactionGroup } from './messageUtils';

interface Props {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
  isMine: boolean;
}

export function MessageReactions({ reactions, onToggle, isMine }: Props) {
  if (reactions.length === 0) return null;

  return (
    <div
      className={cn(
        'mt-1 flex flex-wrap items-center gap-1',
        isMine ? 'justify-end' : 'justify-start'
      )}
    >
      {reactions.map(({ emoji, count, mine }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onToggle(emoji)}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
            mine
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-border bg-muted/40 text-muted-foreground hover:bg-accent'
          )}
          aria-label={`${mine ? 'Remove' : 'Add'} reaction ${emoji}`}
        >
          <span className="text-sm leading-none">{emoji}</span>
          <span className="font-medium tabular-nums">{count}</span>
        </button>
      ))}
    </div>
  );
}
