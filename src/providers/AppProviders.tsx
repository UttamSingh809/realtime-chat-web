/**
 * AppProviders — composes every provider in the correct order.
 *
 * Order:
 *   1. ThemeProvider        — styles apply before anything renders
 *   2. QueryProvider        — data layer available below
 *   3. AuthProvider         — runs silent refresh on mount
 *   4. children             — the app
 *   5. ToastProvider        — themes with the current theme
 */

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
          {children}
          <ToastProvider />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}