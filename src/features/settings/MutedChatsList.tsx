/**
 * MutedChatsList — shows conversations the user has muted.
 */

import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/features/users';
import { useAuth } from '@/features/auth';
import { conversationDisplayName, conversationAvatarUrl } from '@/features/conversations';
import { useMutedConversations, useUnmuteConversation } from './useMutedConversations';

export function MutedChatsList() {
  const { user } = useAuth();
  const { muted, isLoading } = useMutedConversations();
  const unmute = useUnmuteConversation();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Muted chats</h2>
        <p className="text-sm text-muted-foreground">
          You won't get notifications from these conversations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : muted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/20 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No muted chats</p>
            <p className="text-xs text-muted-foreground">You haven't muted any conversations.</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {muted.map((c) => {
            const name = conversationDisplayName(c, user.id);
            const avatarUrl = conversationAvatarUrl(c, user.id);
            const isGroup = c.type === 'group';

            return (
              <li key={c.id} className="flex items-center gap-3 p-3">
                <UserAvatar
                  user={{
                    name,
                    avatar: { url: avatarUrl, publicId: null },
                    status: 'offline',
                  }}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isGroup ? `Group · ${c.participants.length} participants` : 'Direct message'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unmute.mutate({ id: c.id, muted: false })}
                  disabled={unmute.isPending}
                >
                  {unmute.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Unmute
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
