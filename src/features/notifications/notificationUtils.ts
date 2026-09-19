/**
 * Helpers for rendering notifications: icons, target URLs, previews.
 */

import { MessageSquare, AtSign, Heart, Info, type LucideIcon } from 'lucide-react';
import type { Notification } from '@/types';

/**
 * Icon + color per notification type.
 */
export function notificationVisual(type: Notification['type']): {
  Icon: LucideIcon;
  className: string;
} {
  switch (type) {
    case 'message':
      return { Icon: MessageSquare, className: 'text-primary' };
    case 'mention':
      return { Icon: AtSign, className: 'text-warning' };
    case 'reaction':
      return { Icon: Heart, className: 'text-destructive' };
    case 'system':
      return { Icon: Info, className: 'text-muted-foreground' };
    default:
      return { Icon: Info, className: 'text-muted-foreground' };
  }
}

/**
 * Where should a click on this notification navigate?
 * Returns null if there's no sensible target.
 */
export function notificationTarget(n: Notification): string | null {
  const conversationId = n.data.conversationId;
  if (!conversationId) return null;
  return `/app/chat/${conversationId}`;
}

/**
 * Human-friendly preview. Truncates long bodies.
 */
export function notificationPreview(body: string, max = 80): string {
  if (!body) return '';
  return body.length > max ? `${body.slice(0, max)}…` : body;
}
