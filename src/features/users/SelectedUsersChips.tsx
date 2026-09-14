/**
 * SelectedUsersChips — removable chips for group member selection.
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import type { UserPublic } from '@/types';

interface Props {
  users: UserPublic[];
  onRemove: (userId: string) => void;
}

export function SelectedUsersChips({ users, onRemove }: Props) {
  if (users.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-1.5 rounded-full bg-accent py-1 pl-1 pr-2 text-xs"
        >
          <UserAvatar user={u} size="sm" />
          <span className="max-w-[120px] truncate font-medium">{u.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-background/50"
            onClick={() => onRemove(u.id)}
            aria-label={`Remove ${u.name}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
