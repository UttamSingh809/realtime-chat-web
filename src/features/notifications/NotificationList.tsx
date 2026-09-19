/**
 * NotificationList — the scrollable list inside the panel.
 */

import { useMemo } from 'react';
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useNotifications, flattenNotifications } from './useNotifications';
import { useUnreadNotificationCount } from './useUnreadNotificationCount';
import { useMarkAllNotificationsRead } from './useMarkAllNotificationsRead';
import { useClearNotifications } from './useClearNotifications';
import { NotificationItem } from './NotificationItem';

interface Props {
  onClose?: () => void;
}

export function NotificationList({ onClose }: Props) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications({
    unreadOnly: filter === 'unread',
  });

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAll = useMarkAllNotificationsRead();
  const clearAll = useClearNotifications();

  const items = useMemo(() => flattenNotifications(data?.pages), [data]);

  return (
    <div className="flex h-full flex-col">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'unread')}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => clearAll.mutate()}
              disabled={clearAll.isPending}
              aria-label="Clear all"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-xs text-muted-foreground">
              {filter === 'unread'
                ? "You don't have any unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-0.5 p-2">
            {items.map((n) => (
              <NotificationItem key={n.id} notification={n} onClose={onClose} />
            ))}

            {hasNextPage && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
