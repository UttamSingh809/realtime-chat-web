/**
 * MessageBubble — a single message within a group, with reactions.
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatMessageTime } from '@/lib/format';
import type { Message } from '@/types';
import { MessageActionsMenu } from './MessageActionsMenu';
import { ReactionPicker } from './ReactionPicker';
import { MessageReactions } from './MessageReactions';
import { groupReactions } from './messageUtils';

interface Props {
  message: Message;
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

  const reactionGroups = groupReactions(message, myUserId);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
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

  const handleToggleReaction = (emoji: string) => {
    onReact(message.id, emoji);
  };

  return (
    <div
      className={cn(
        'group/message flex flex-col gap-0.5 px-4',
        isMine ? 'items-end' : 'items-start'
      )}
    >
      {/* Row: reactions-picker + bubble + actions-menu */}
      <div
        className={cn('flex w-full items-end gap-1.5', isMine ? 'flex-row-reverse' : 'flex-row')}
      >
        {/* Reaction picker (hover only, hidden in edit mode) */}
        {!editing && !message.isDeleted && (
          <ReactionPicker onReact={handleToggleReaction} className="mb-1 shrink-0" />
        )}

        {/* Bubble */}
        <div
          className={cn(
            'relative max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
            isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
            isLastInGroup ? (isMine ? 'rounded-br-sm' : 'rounded-bl-sm') : ''
          )}
        >
          {/* Reply preview */}
          {message.replyTo && (
            <div
              className={cn(
                'mb-1.5 rounded-md border-l-2 px-2 py-1 text-xs',
                isMine
                  ? 'border-primary-foreground/60 bg-primary-foreground/10'
                  : 'border-primary bg-primary/5'
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

          {/* Content / edit mode */}
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
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Footer: edited + timestamp */}
          <div
            className={cn(
              'mt-0.5 flex items-center gap-1.5 text-[10px]',
              isMine ? 'justify-end text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {message.isEdited && <span>edited</span>}
            <span>{formatMessageTime(message.createdAt)}</span>
            {message._optimistic && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
        </div>

        {/* Actions menu (edit/delete/copy) */}
        {!message.isDeleted && !editing && (
          <MessageActionsMenu
            message={message}
            isMine={isMine}
            onEdit={() => setEditing(true)}
            onDeleteForMe={() => onDeleteForMe(message.id)}
            onDeleteForEveryone={() => onDeleteForEveryone(message.id)}
          />
        )}
      </div>

      {/* Reactions */}
      <MessageReactions
        reactions={reactionGroups}
        onToggle={handleToggleReaction}
        isMine={isMine}
      />
    </div>
  );
}
