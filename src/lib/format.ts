/**
 * Formatting helpers for dates, initials, sizes.
 * Central place so we don't scatter date-fns calls everywhere.
 */

import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  differenceInMinutes,
} from 'date-fns';

/**
 * Format a timestamp for a conversation list preview.
 * Rules:
 *   < 1m:  "now"
 *   < 1h:  "5m"
 *   today: "14:32"
 *   yesterday: "Yesterday"
 *   this week: "Mon"
 *   this year: "Mar 12"
 *   older: "Mar 12, 2024"
 */
export function formatRelativeShort(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();

  const diffMins = differenceInMinutes(now, date);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;

  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEE');
  if (isThisYear(date)) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
}

/**
 * Format for message timestamps inside the chat view.
 * Rules:
 *   today: "14:32"
 *   yesterday: "Yesterday 14:32"
 *   older: "Mar 12, 14:32"
 */
export function formatMessageTime(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;

  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d, HH:mm');
}

/**
 * Full date for tooltips and long-form display.
 */
export function formatFullDate(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return format(date, 'PPpp');
}

/**
 * Compute initials from a name. "Alice Smith" → "AS", "Alice" → "A".
 */
export function initialsFromName(name: string | undefined | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Format bytes into a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}