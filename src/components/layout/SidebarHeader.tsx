/**
 * SidebarHeader — brand + new-chat + notifications + collapse toggle.
 */

import { MessageSquarePlus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui.store';
import { NotificationBell } from '@/features/notifications';
import { APP_NAME } from '@/lib/constants';

interface Props {
  onCreateConversation?: () => void;
}

export function SidebarHeader({ onCreateConversation }: Props) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 border-b p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Expand sidebar">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateConversation}
              aria-label="New chat"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New chat</TooltipContent>
        </Tooltip>

        <NotificationBell />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <h1 className="truncate text-sm font-semibold tracking-tight">{APP_NAME}</h1>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateConversation}
              aria-label="New chat"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New chat</TooltipContent>
        </Tooltip>

        <NotificationBell />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Collapse</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
