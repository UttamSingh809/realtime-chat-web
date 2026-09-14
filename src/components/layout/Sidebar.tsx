/**
 * Sidebar — the left column of the app shell.
 *
 * Desktop: fixed-width column, collapses to icon-only mode.
 * Mobile:  slides in as a drawer.
 */
/**
 * Sidebar — the left column of the app shell.
 */

import { useState } from 'react';
import { Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui.store';
import { ConversationList, NewChatDialog } from '@/features/conversations';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { SidebarFooter } from './SidebarFooter';

export function Sidebar() {
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[320px]'
      )}
    >
      <SidebarHeader onCreateConversation={() => setNewChatOpen(true)} />

      {!collapsed && (
        <>
          <SidebarSearch value={query} onChange={setQuery} />

          <div className="flex items-center justify-between border-b px-3 py-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {showArchived ? 'Archived' : 'Inbox'}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowArchived((s) => !s)}
                  aria-label={showArchived ? 'Show inbox' : 'Show archived'}
                >
                  <Archive className={cn('h-3.5 w-3.5', showArchived && 'text-primary')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {showArchived ? 'Show inbox' : 'Show archived'}
              </TooltipContent>
            </Tooltip>
          </div>
        </>
      )}

      <ConversationList searchQuery={query} archived={showArchived} />

      <SidebarFooter />

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </aside>
  );
}