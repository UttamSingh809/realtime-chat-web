/**
 * AppLayout — the top-level authenticated layout.
 *
 * Renders a two-column shell (sidebar + main content) with a mobile
 * drawer for the sidebar.
 */

import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUIStore } from '@/stores/ui.store';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

interface Props {
  onCreateConversation?: () => void;
}

export function AppLayout({ onCreateConversation }: Props) {
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onCreateConversation={onCreateConversation} />
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" className="w-[320px] p-0" aria-describedby={undefined}>
          <Sidebar onCreateConversation={onCreateConversation} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <MainContent>
        <Outlet />
      </MainContent>
    </div>
  );
}
