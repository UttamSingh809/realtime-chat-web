/**
 * ConversationList — scrollable list of conversations.
 * Placeholder with sample data for layout verification.
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';

// Placeholder — will be replaced with real data in Step 7
const SAMPLE = [
  {
    id: 'sample-1',
    name: 'Bob Jones',
    preview: 'See you tomorrow!',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'sample-2',
    name: 'Project X',
    preview: 'Alice: ship it 🚀',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'sample-3',
    name: 'Carol Lee',
    preview: 'Thanks for the update.',
    unreadCount: 0,
    isOnline: true,
  },
];

export function ConversationList() {
  if (SAMPLE.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col">
        {SAMPLE.map((c) => (
          <ConversationItem key={c.id} {...c} />
        ))}
      </div>
    </ScrollArea>
  );
}
