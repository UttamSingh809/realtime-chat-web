/**
 * AppProviders — composes every provider in the correct order.
 *
 * Order:
 *   1. ThemeProvider        — styles apply before anything renders
 *   2. QueryProvider        — data layer available below
 *   3. AuthProvider         — runs silent refresh on mount
 *   4. TooltipProvider      — required by every <Tooltip> in the app
 *   5. children + Toaster
 */

import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={300} skipDelayDuration={100}>
            {children}
            <ToastProvider />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
