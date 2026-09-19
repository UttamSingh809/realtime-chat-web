/**
 * EmojiPicker — a curated emoji picker for reactions.
 *
 * Layout constraints:
 *   - Total width capped (280px) so it never overflows the viewport
 *   - Category tabs scroll horizontally if they don't fit
 *   - Emoji grid scrolls vertically within a fixed height
 *   - Uses the max-height so popover can position it above/below
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EMOJI_CATEGORIES } from '@/lib/emoji';

interface Props {
  onSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onSelect, className }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={cn('flex w-[280px] flex-col', className)}>
      {/* Category tabs — horizontally scrollable if they don't fit */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              activeTab === i
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji grid — vertical scroll, fixed height */}
      <div className="h-[220px] overflow-y-auto">
        <div className="grid grid-cols-7 gap-0.5 p-2">
          {EMOJI_CATEGORIES[activeTab]!.emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors',
                'hover:bg-accent'
              )}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
