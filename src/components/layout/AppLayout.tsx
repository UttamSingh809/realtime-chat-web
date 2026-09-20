/**
 * AppLayout — the top-level authenticated layout.
 *
 * Two sidebars exist:
 *   - Desktop:  visible at ≥md. Can collapse to a 60px icon rail.
 *   - Mobile:   a Sheet drawer, only <md.
 *
 * The mobile drawer is force-closed whenever the viewport is wide enough
 * for the desktop layout. This prevents the drawer from lingering if the
 * user resizes from mobile → desktop, or if the store got out of sync.
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/stores/ui.store';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { ErrorBoundary } from '@/components/common';

const MD_BREAKPOINT = 768;

export function AppLayout() {
  const location = useLocation();
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);

  // 1. Close drawer on navigation
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  // 2. Force-close drawer if viewport becomes wide enough for desktop
  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= MD_BREAKPOINT && mobileOpen) {
        closeMobileSidebar();
      }
    };

    check(); // run once on mount
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [mobileOpen, closeMobileSidebar]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar — visible at ≥md */}
      <div className="hidden h-full shrink-0 md:flex">
        <Sidebar />
      </div>

      {/*
        Mobile drawer — conditionally mounted.
        When mobileOpen is false, this entire subtree is absent from the DOM.
        That guarantees Radix can never leave a stuck overlay.
      */}
      {mobileOpen && (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) closeMobileSidebar();
          }}
        >
          <SheetContent
            side="left"
            className="w-[320px] max-w-[85vw] border-r p-0 md:hidden [&>button]:hidden"
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar forceExpanded />
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      <MainContent>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </MainContent>
    </div>
  );
}
