/**
 * MessageBubble — a single message within a group.
 *
 * Layout:
 *   - Smiley trigger button sits OUTSIDE the bubble, at the outer edge
 *   - Reaction picker pops ABOVE the bubble on click (absolute, no layout shift)
 *   - Reactions render as pills just below the bubble
 *   - Attachments render inside the bubble via AttachmentGrid
 */

import { useState, useMemo } from 'react';
import { Loader2, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatMessageTime } from '@/lib/format';
import { AttachmentGrid } from '@/features/files';
import type { Conversation, Message } from '@/types';
import { MessageActionsMenu } from './MessageActionsMenu';
import { EmojiPicker } from './EmojiPicker';
import { MessageReactions } from './MessageReactions';
import { groupReactions } from './messageUtils';
import { MessageStatusIcon } from './MessageStatusIcon';
import { MessageReadInfo } from './MessageReadInfo';
import { ReadByPopover } from './ReadByPopover';
import { getMessageStatus, getReadersList, getPendingReadersList } from './messageStatus';
import { QUICK_REACTIONS } from '@/lib/emoji';

interface Props {
  message: Message;
  conversation: Conversation;
  isMine: boolean;
  isLastInGroup: boolean;
  myUserId: string;
  onEdit: (messageId: string, newContent: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageBubble({
  message,
  conversation,
  isMine,
  isLastInGroup,
  myUserId,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReact,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [pickerOpen, setPickerOpen] = useState(false);

  const reactionGroups = groupReactions(message, myUserId);
  const isGroup = conversation.type === 'group';

  const status = useMemo(
    () => (isMine ? getMessageStatus(message, conversation) : 'unknown'),
    [isMine, message, conversation]
  );

  const readers = useMemo(
    () => (isMine && isGroup ? getReadersList(message, conversation) : []),
    [isMine, isGroup, message, conversation]
  );

  const pending = useMemo(
    () => (isMine && isGroup ? getPendingReadersList(message, conversation) : []),
    [isMine, isGroup, message, conversation]
  );

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasContent = !!message.content && message.content.trim().length > 0;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) onEdit(message.id, trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setDraft(message.content);
      setEditing(false);
    }
  };

  const handleReact = (emoji: string) => {
    onReact(message.id, emoji);
    setPickerOpen(false);
  };

  const canReact = !message.isDeleted && !editing;

  const smiley = canReact ? (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            'text-muted-foreground opacity-0 transition-opacity',
            'hover:bg-accent hover:text-foreground',
            'group-hover/message:opacity-100 focus-visible:opacity-100',
            'data-[state=open]:opacity-100'
          )}
          aria-label="React to message"
        >
          <SmilePlus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align={isMine ? 'end' : 'start'}
        sideOffset={8}
        collisionPadding={16}
        className="w-auto p-0"
      >
        <ReactionBar onSelect={handleReact} />
      </PopoverContent>
    </Popover>
  ) : null;

  return (
    <div
      className={cn(
        'group/message flex w-full flex-col gap-0.5 px-4',
        isMine ? 'items-end' : 'items-start'
      )}
    >
      <div className={cn('flex w-full items-end gap-1', isMine ? 'flex-row-reverse' : 'flex-row')}>
        <div className="flex h-full items-end pb-1.5">{smiley}</div>

        <div
          className={cn(
            'relative max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
            isMine
              ? 'bg-bubbleSent text-bubbleSent-foreground'
              : 'bg-bubbleReceived text-bubbleReceived-foreground',
            isLastInGroup ? (isMine ? 'rounded-br-sm' : 'rounded-bl-sm') : ''
          )}
        >
          {message.replyTo && (
            <div
              className={cn(
                'mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs',
                isMine
                  ? 'border-bubbleSent-foreground/60 bg-bubbleSent-foreground/10'
                  : 'border-bubbleReceived-foreground/60 bg-bubbleReceived-foreground/10'
              )}
            >
              <p className="truncate font-medium">
                {message.replyTo.sender && 'name' in message.replyTo.sender
                  ? (message.replyTo.sender as { name: string }).name
                  : 'Reply'}
              </p>
              <p className="truncate opacity-80">
                {message.replyTo.deleted ? 'Deleted message' : message.replyTo.content}
              </p>
            </div>
          )}

          {editing ? (
            <div className="space-y-1.5">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                rows={2}
                className="min-h-0 resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
              />
              <div className="flex items-center justify-end gap-1.5 text-xs">
                <button
                  onClick={() => {
                    setDraft(message.content);
                    setEditing(false);
                  }}
                  className="opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="font-medium">
                  Save
                </button>
              </div>
            </div>
          ) : message.isDeleted ? (
            <p className="italic opacity-70">This message was deleted</p>
          ) : (
            <>
              {hasAttachments && (
                <AttachmentGrid attachments={message.attachments} isMine={isMine} />
              )}
              {hasContent && (
                <p className={cn('whitespace-pre-wrap break-words', hasAttachments && 'mt-1.5')}>
                  {message.content}
                </p>
              )}
            </>
          )}

          <div
            className={cn(
              'mt-0.5 flex items-center gap-1.5 text-[10px]',
              isMine
                ? 'justify-end text-bubbleSent-foreground/70'
                : 'text-bubbleReceived-foreground/70'
            )}
          >
            {message.isEdited && <span>edited</span>}
            <span>{formatMessageTime(message.createdAt)}</span>
            {isMine && !message.isDeleted && <MessageStatusIcon status={status} isMine={isMine} />}
            {message._optimistic && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </div>

        {!message.isDeleted && !editing && (
          <div className="flex h-full items-end pb-1.5">
            <MessageActionsMenu
              message={message}
              isMine={isMine}
              onEdit={() => setEditing(true)}
              onDeleteForMe={() => onDeleteForMe(message.id)}
              onDeleteForEveryone={() => onDeleteForEveryone(message.id)}
            />
          </div>
        )}
      </div>

      {isMine && isGroup && readers.length > 0 && (
        <ReadByPopover
          readers={readers}
          pending={pending}
          className={cn('mr-1', 'text-primary-foreground/70')}
        >
          <MessageReadInfo readers={readers} pending={pending} isGroup={isGroup} isMine={isMine} />
        </ReadByPopover>
      )}

      <MessageReactions reactions={reactionGroups} onToggle={handleReact} isMine={isMine} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reaction bar
// ---------------------------------------------------------------------------

interface ReactionBarProps {
  onSelect: (emoji: string) => void;
}

function ReactionBar({ onSelect }: ReactionBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return <EmojiPicker onSelect={onSelect} />;
  }

  return (
    <div className="flex items-center gap-1 p-1">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}

      <div className="mx-1 h-6 w-px bg-border" />

      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="More emojis"
      >
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}
