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