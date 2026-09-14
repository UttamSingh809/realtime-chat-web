/**
 * EmojiPicker — a curated emoji picker for reactions.
 * Not a full keyboard; keeps the reaction set small and relevant.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EMOJI_CATEGORIES } from '@/lib/emoji';

interface Props {
  onSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onSelect, className }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={cn('w-[280px]', className)}>
      {/* Tabs */}
      <div className="flex gap-1 border-b px-2 py-1.5">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              activeTab === i
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <ScrollArea className="h-[220px]">
        <div className="grid grid-cols-8 gap-1 p-2">
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
      </ScrollArea>
    </div>
  );
}
