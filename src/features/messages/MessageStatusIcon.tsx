/**
 * MessageStatusIcon — a small tick icon showing delivery state.
 */

import { Check, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageDeliveryStatus } from './messageStatus';

interface Props {
  status: MessageDeliveryStatus;
  /** Whether the parent bubble is on the "mine" (primary) side. */
  isMine: boolean;
  className?: string;
}

export function MessageStatusIcon({ status, isMine, className }: Props) {
  if (status === 'unknown') {
    // Optimistic message still sending — show a tiny spinner
    return (
      <Loader2
        className={cn(
          'h-3 w-3 animate-spin',
          isMine ? 'text-primary-foreground/60' : 'text-muted-foreground',
          className
        )}
        aria-label="Sending"
      />
    );
  }

  // Single tick for sent, double tick for delivered / read
  const tickClass = cn(
    'h-3.5 w-3.5',
    isMine ? 'text-primary-foreground/70' : 'text-muted-foreground',
    // Blue when read
    status === 'read' && isMine && 'text-sky-300',
    className
  );

  if (status === 'sent') {
    return <Check className={tickClass} aria-label="Sent" />;
  }

  // Delivered or read — double tick
  return (
    <span className="relative inline-flex" aria-label={status === 'read' ? 'Read' : 'Delivered'}>
      <Check className={cn(tickClass, 'relative z-10')} />
      <Check className={cn(tickClass, '-ml-1.5')} />
    </span>
  );
}

/**
 * Compact version used inside the bubble footer.
 * Falls back to a clock icon for very old "sent" messages.
 */
export function MessageStatusCompact({
  status,
  isMine,
}: {
  status: MessageDeliveryStatus;
  isMine: boolean;
}) {
  if (status === 'unknown') {
    return (
      <Clock
        className={cn('h-3 w-3', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}
      />
    );
  }
  return <MessageStatusIcon status={status} isMine={isMine} />;
}
