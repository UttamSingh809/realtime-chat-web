/**
 * ReactionPicker — the smiley button + popover for reactions.
 * Rendered in the message bubble's hover action strip.
 */

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { QUICK_REACTIONS } from '@/lib/emoji';

interface Props {
  onReact: (emoji: string) => void;
  className?: string;
}

export function ReactionPicker({ onReact, className }: Props) {
  const [open, setOpen] = useState(false);

  const handleQuick = (emoji: string) => {
    onReact(emoji);
  };

  const handleFull = (emoji: string) => {
    onReact(emoji);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border bg-popover px-1 py-0.5 shadow-sm',
        'opacity-0 transition-opacity group-hover/message:opacity-100',
        'data-[state=open]:opacity-100',
        className
      )}
    >
      {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleQuick(emoji)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-base hover:bg-accent"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            aria-label="More reactions"
          >
            <SmilePlus className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-auto p-0">
          <EmojiPicker onSelect={handleFull} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
