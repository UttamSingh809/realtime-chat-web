/**
 * NotificationsSettings — what notifications to receive.
 * Defensive: falls back to defaults if the backend hasn't returned settings yet.
 */

import { useAuth } from '@/features/auth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUpdateSettings } from './useUpdateSettings';
import type { NotificationSettings } from '@/types';

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  messages: true,
  mentions: true,
  reactions: true,
  sound: true,
  email: false,
  push: false,
};

interface RowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function NotificationsSettings() {
  const { user } = useAuth();
  const update = useUpdateSettings();

  if (!user) return null;

  // Merge with defaults so a missing/partial settings object never crashes.
  const n: NotificationSettings = {
    ...DEFAULT_NOTIFICATIONS,
    ...(user.settings?.notifications ?? {}),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
      </div>

      <div className="divide-y rounded-lg border">
        <ToggleRow
          label="New messages"
          description="Notify me when someone sends a message."
          checked={n.messages}
          onChange={(v) => update.mutate({ notifications: { messages: v } })}
        />
        <ToggleRow
          label="Mentions"
          description="Notify me when someone @mentions me in a group."
          checked={n.mentions}
          onChange={(v) => update.mutate({ notifications: { mentions: v } })}
        />
        <ToggleRow
          label="Reactions"
          description="Notify me when someone reacts to my messages."
          checked={n.reactions}
          onChange={(v) => update.mutate({ notifications: { reactions: v } })}
        />
        <ToggleRow
          label="Sound"
          description="Play a sound when a notification arrives."
          checked={n.sound}
          onChange={(v) => update.mutate({ notifications: { sound: v } })}
        />
        <ToggleRow
          label="Email notifications"
          description="Send a daily digest to my inbox."
          checked={n.email}
          onChange={(v) => update.mutate({ notifications: { email: v } })}
        />
        <ToggleRow
          label="Push notifications"
          description="Send push notifications to this device."
          checked={n.push}
          onChange={(v) => update.mutate({ notifications: { push: v } })}
        />
      </div>
    </div>
  );
}
