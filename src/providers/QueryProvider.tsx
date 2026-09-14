/**
 * QueryProvider — mounts React Query at the app root.
 * DevTools are only included in development.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

interface Props {
  children: React.ReactNode;
}

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}