/**
 * SidebarSearch — search input for conversations.
 * Wire-up to real data comes in Step 7.
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui.store';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, onChange }: Props) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  if (collapsed) return null;

  return (
    <div className="border-b p-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search conversations…"
          className="pl-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
