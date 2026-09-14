/**
 * ThemeProvider — syncs the resolved theme to the <html class="dark"> element
 * and listens for OS preference changes when theme === 'system'.
 */

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme.store';

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Apply class to <html> whenever resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Update the meta theme-color for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', resolvedTheme === 'dark' ? '#09090b' : '#ffffff');
    }
  }, [resolvedTheme]);

  // When theme is 'system', listen for OS preference changes
  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Re-resolve by re-setting the same theme
      setTheme('system');
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, setTheme]);

  return <>{children}</>;
}