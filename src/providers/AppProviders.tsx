/**
 * AppProviders — composes every provider in the correct order.
 *
 * Order matters:
 *   ThemeProvider first (styles apply before anything renders)
 *   QueryProvider next (data layer available to everything below)
 *   ToastProvider last (uses theme)
 */

import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}