/**
 * AppProviders — composes every provider in the correct order.
 *
 * Order:
 *   1. ThemeProvider        — styles apply before anything renders
 *   2. QueryProvider        — data layer available below
 *   3. AuthProvider         — runs silent refresh on mount
 *   4. SocketProvider       — connects when authenticated
 *   5. TooltipProvider      — required by every <Tooltip>
 *   6. SocketBridge         — no-op render; subscribes to events
 *   7. children + Toaster
 */

import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { SocketProvider, SocketBridge } from '@/features/socket';

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider delayDuration={300} skipDelayDuration={100}>
              <SocketBridge />
              {children}
              <ToastProvider />
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
