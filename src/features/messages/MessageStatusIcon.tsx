/**
 * MessageStatusIcon — delivery/read indicator for my own messages.
 */

import { Check, CheckCheck, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageDeliveryStatus } from './messageStatus';

interface Props {
  status: MessageDeliveryStatus;
  isMine: boolean;
  className?: string;
}

export function MessageStatusIcon({ status, isMine, className }: Props) {
  if (status === 'unknown') {
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

  const baseColor = isMine ? 'text-primary-foreground' : 'text-muted-foreground';

  if (status === 'sent') {
    return (
      <Check
        // DEBUG: yellow
        className={cn('h-3.5 w-3.5', isMine ? 'text-yellow-500' : baseColor, className)}
        aria-label="Sent"
      />
    );
  }

  if (status === 'delivered') {
    return (
      <CheckCheck
        // DEBUG: orange
        className={cn('h-3.5 w-3.5', isMine ? 'text-orange-500' : baseColor, className)}
        aria-label="Delivered"
      />
    );
  }

  // read
  return (
    <CheckCheck
      // DEBUG: black
      className={cn('h-3.5 w-3.5', isMine ? 'text-black' : 'text-primary', className)}
      aria-label="Read"
    />
  );
}

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
