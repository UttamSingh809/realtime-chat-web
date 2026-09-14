/**
 * Sidebar — the left column of the app shell.
 *
 * Desktop: fixed-width column, collapses to icon-only mode.
 * Mobile:  slides in as a drawer.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { ConversationList } from './ConversationList';
import { SidebarFooter } from './SidebarFooter';

interface Props {
  onCreateConversation?: () => void;
}

export function Sidebar({ onCreateConversation }: Props) {
  const [query, setQuery] = useState('');
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[320px]'
      )}
    >
      <SidebarHeader onCreateConversation={onCreateConversation} />
      <SidebarSearch value={query} onChange={setQuery} />
      <ConversationList />
      <SidebarFooter />
    </aside>
  );
}
