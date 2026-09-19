/**
 * NotificationItem — one row in the notifications panel.
 */

import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatRelativeShort } from '@/lib/format';
import type { Notification } from '@/types';
import { notificationVisual, notificationTarget } from './notificationUtils';
import { useMarkNotificationRead } from './useMarkNotificationRead';
import { useDeleteNotification } from './useDeleteNotification';

interface Props {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: Props) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const remove = useDeleteNotification();

  const { Icon, className: iconClass } = notificationVisual(notification.type);
  const target = notificationTarget(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (target) {
      navigate(target);
      onClose?.();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    remove.mutate(notification.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
        'hover:bg-accent/60',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted',
          iconClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm',
              notification.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatRelativeShort(notification.createdAt)}
          </span>
        </div>

        {notification.body && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{notification.body}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
        aria-label="Delete notification"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </button>
  );
}
