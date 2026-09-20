/**
 * UI store — layout-only state that doesn't belong on the server
 * or in the URL.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  /** Whether the sidebar is collapsed on desktop (icon-only mode). */
  sidebarCollapsed: boolean;

  /** Whether the mobile drawer is open. */
  mobileSidebarOpen: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      openMobileSidebar: () => set({ mobileSidebarOpen: true }),

      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
    }),
    {
      name: 'rc.ui',
      // Only persist the desktop collapse preference
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
/**
 * Auto-expand the sidebar when the viewport is wide enough.
 * Runs on mount and on resize.
 */
export function installSidebarAutoExpand() {
  if (typeof window === 'undefined') return () => {};

  const check = () => {
    const width = window.innerWidth;
    // On wide screens (≥1280px), ensure the sidebar isn't stuck collapsed.
    if (width >= 1280) {
      const state = useUIStore.getState();
      // Only auto-expand if the user hasn't explicitly collapsed it very recently.
      // For simplicity: if it's collapsed and the screen is wide, expand it.
      if (state.sidebarCollapsed) {
        state.setSidebarCollapsed(false);
      }
    }
  };

  // Run once on mount
  check();

  // Re-check on resize (debounced)
  let timer: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(check, 150);
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    if (timer) clearTimeout(timer);
  };
}