/**
 * ConversationActionsMenu — the "..." menu on each conversation row.
 */

import { Pin, PinOff, Archive, ArchiveRestore, BellOff, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types';
import { usePinConversation } from './usePinConversation';
import { useArchiveConversation } from './useArchiveConversation';
import { useMuteConversation } from './useMuteConversation';

interface Props {
  conversation: Conversation;
}

export function ConversationActionsMenu({ conversation }: Props) {
  const pin = usePinConversation();
  const archive = useArchiveConversation();
  const mute = useMuteConversation();

  const { pinned, archived, muted } = conversation.myFlags;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Conversation actions"
        >
          <span className="sr-only">Actions</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            pin.mutate({ id: conversation.id, pinned: !pinned });
          }}
          disabled={pin.isPending}
        >
          {pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
          {pinned ? 'Unpin' : 'Pin'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            mute.mutate({ id: conversation.id, muted: !muted });
          }}
          disabled={mute.isPending}
        >
          {muted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
          {muted ? 'Unmute' : 'Mute'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            archive.mutate({ id: conversation.id, archived: !archived });
          }}
          disabled={archive.isPending}
        >
          {archived ? (
            <ArchiveRestore className="mr-2 h-4 w-4" />
          ) : (
            <Archive className="mr-2 h-4 w-4" />
          )}
          {archived ? 'Unarchive' : 'Archive'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
