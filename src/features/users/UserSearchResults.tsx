/**
 * UserSearchResults — renders search results with a loading/empty state.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import type { UserPublic } from '@/types';

interface Props {
  users: UserPublic[];
  isLoading: boolean;
  emptyMessage?: string;
  onSelect: (user: UserPublic) => void;
  selectedIds?: string[];
  disabled?: boolean;
}

export function UserSearchResults({
  users,
  isLoading,
  emptyMessage = 'No users found',
  onSelect,
  selectedIds = [],
  disabled = false,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[340px]">
      <div className="flex flex-col">
        {users.map((u) => {
          const selected = selectedIds.includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => !disabled && onSelect(u)}
              disabled={disabled || selected}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
                'hover:bg-accent',
                selected && 'bg-accent/50 opacity-60',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <UserAvatar user={u} size="md" showPresence />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
              </div>
              {selected && <span className="text-xs font-medium text-primary">Selected</span>}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
