/**
 * PrivacySettings — last seen, online status, read receipts, allow messages.
 */

import { useAuth } from '@/features/auth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUpdateSettings } from './useUpdateSettings';

interface RowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function PrivacySettings() {
  const { user } = useAuth();
  const update = useUpdateSettings();

  if (!user) return null;
  const privacy = user.settings?.privacy;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Privacy</h2>
        <p className="text-sm text-muted-foreground">Control who sees what about you.</p>
      </div>

      <div className="divide-y rounded-lg border">
        <div className="px-4">
          <ToggleRow
            label="Show last seen"
            description="Let others see when you were last active."
            checked={privacy.showLastSeen}
            onChange={(v) => update.mutate({ privacy: { showLastSeen: v } })}
          />
        </div>

        <div className="px-4">
          <ToggleRow
            label="Show online status"
            description="Show a green dot when you're online."
            checked={privacy.showOnlineStatus}
            onChange={(v) => update.mutate({ privacy: { showOnlineStatus: v } })}
          />
        </div>

        <div className="px-4">
          <ToggleRow
            label="Send read receipts"
            description="Let others see when you've read their messages."
            checked={privacy.readReceipts}
            onChange={(v) => update.mutate({ privacy: { readReceipts: v } })}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Who can message me</Label>
        <p className="text-xs text-muted-foreground">
          Choose who is allowed to start a new conversation with you.
        </p>
        <Select
          value={privacy.allowMessagesFrom}
          onValueChange={(v) =>
            update.mutate({
              privacy: { allowMessagesFrom: v as 'everyone' | 'contacts' | 'nobody' },
            })
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">Everyone</SelectItem>
            <SelectItem value="contacts">People I've chatted with</SelectItem>
            <SelectItem value="nobody">Nobody</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
