/**
 * ReadByPopover — click to see who's read a message.
 * Only rendered for messages I sent in a group.
 */

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserAvatar } from '@/features/users';
import { cn } from '@/lib/utils';
import type { UserPublic } from '@/types';

interface Props {
  readers: UserPublic[];
  pending: UserPublic[];
  children: React.ReactNode;
  className?: string;
}

export function ReadByPopover({ readers, pending, children, className }: Props) {
  const [open, setOpen] = useState(false);

  const hasAnything = readers.length > 0 || pending.length > 0;
  if (!hasAnything) return <>{children}</>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn('cursor-pointer text-[10px] underline-offset-2 hover:underline', className)}
        >
          {children}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" side="top" className="w-64 p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {readers.length > 0 && (
            <div className="border-b p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Read by {readers.length}
              </p>
              <ul className="space-y-2">
                {readers.map((u) => (
                  <li key={u.id} className="flex items-center gap-2">
                    <UserAvatar user={u} size="sm" />
                    <span className="truncate text-sm">{u.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pending.length > 0 && (
            <div className="p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Not yet read</p>
              <ul className="space-y-2 opacity-60">
                {pending.map((u) => (
                  <li key={u.id} className="flex items-center gap-2">
                    <UserAvatar user={u} size="sm" />
                    <span className="truncate text-sm">{u.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
