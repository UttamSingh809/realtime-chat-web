/**
 * MessageSkeleton — loading placeholder while history fetches.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn('flex items-end gap-2', i % 2 === 0 ? 'flex-row' : 'flex-row-reverse')}
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton
            className={cn('h-12 rounded-2xl', i % 3 === 0 ? 'w-64' : i % 3 === 1 ? 'w-48' : 'w-72')}
          />
        </div>
      ))}
    </div>
  );
}
