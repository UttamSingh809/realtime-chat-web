/**
 * Theme store — light / dark / system.
 * Persists to localStorage and drives the `dark` class on <html>.
 */

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  /** The actual resolved theme (system resolves to light or dark). */
  resolvedTheme: 'light' | 'dark';

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Read the initial theme from localStorage or fall back to 'system'.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Resolve 'system' to the actual preference using matchMedia.
 */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  resolvedTheme: resolveTheme(getInitialTheme()),

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    set({ theme, resolvedTheme: resolveTheme(theme) });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));