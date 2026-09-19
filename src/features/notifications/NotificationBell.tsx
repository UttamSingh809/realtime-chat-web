/**
 * NotificationBell — bell icon with unread badge + sheet panel.
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUnreadNotificationCount } from './useUnreadNotificationCount';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: count = 0 } = useUnreadNotificationCount();

  const displayCount = count > 99 ? '99+' : count;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span
              className={cn(
                'absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground',
                'translate-x-1/3 -translate-y-1/3'
              )}
            >
              {displayCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:w-[400px]"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <NotificationList onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
