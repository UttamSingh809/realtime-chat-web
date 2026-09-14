/**
 * ToastProvider — mounts the sonner Toaster with theme awareness.
 */

import { Toaster } from '@/components/ui/sonner';
import { useThemeStore } from '@/stores/theme.store';

export function ToastProvider() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  return <Toaster theme={resolvedTheme} position="top-right" richColors closeButton />;
}