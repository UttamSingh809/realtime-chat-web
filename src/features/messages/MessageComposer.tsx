/**
 * MessageComposer — the input area at the bottom.
 *
 * Features:
 *   - Auto-growing textarea
 *   - Enter to send, Shift+Enter for newline
 *   - Disabled state while sending
 *   - Placeholder shows the conversation name
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  conversationName: string;
  onSend: (content: string) => void;
  onTyping?: () => void;
  sending: boolean;
}

const MAX_ROWS = 8;

export function MessageComposer({ conversationName, onSend, onTyping, sending }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to MAX_ROWS
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  // Focus the composer when the conversation changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationName]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setValue('');
    // Reset height after clearing
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !sending;

  return (
    <div className="border-t bg-background">
      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.length > 0) {
              onTyping?.();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${conversationName}…`}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl border bg-muted/30 px-3.5 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'min-h-[40px]'
          )}
          style={{ lineHeight: '22px' }}
        />

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
