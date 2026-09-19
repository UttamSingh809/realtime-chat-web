/**
 * MainContent — the right column of the app shell.
 */

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui.store';

interface Props {
  children: React.ReactNode;
}

export function MainContent({ children }: Props) {
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar);

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Mobile-only header with hamburger */}
      <div className="flex shrink-0 items-center gap-2 border-b p-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={openMobileSidebar} aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* The actual content area — bounded, scrollable by children. */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </main>
  );
}
