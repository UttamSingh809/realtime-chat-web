/**
 * MutedUsersList — shows and manages muted users.
 */

import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/features/users';
import { useMutedUsers, useUnmuteUser } from './useMutedUsers';

export function MutedUsersList() {
  const { data: users, isLoading } = useMutedUsers();
  const unmute = useUnmuteUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Muted users</h2>
        <p className="text-sm text-muted-foreground">
          You won't get notifications from muted users.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : !users || users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/20 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No muted users</p>
            <p className="text-xs text-muted-foreground">You haven't muted anyone.</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-3">
              <UserAvatar user={u} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => unmute.mutate(u.id)}
                disabled={unmute.isPending}
              >
                {unmute.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Unmute
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
