/**
 * NewGroupTab — pick members, name the group, create it.
 * Creator is added automatically by the backend.
 */

import { useMemo, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SelectedUsersChips,
  UserSearchInput,
  UserSearchResults,
  useUserSearch,
} from '@/features/users';
import type { UserPublic } from '@/types';
import { useCreateConversation } from './useCreateConversation';

interface Props {
  onDone: () => void;
}

export function NewGroupTab({ onDone }: Props) {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<UserPublic[]>([]);

  const { data, isLoading } = useUserSearch(query);
  const create = useCreateConversation();

  // Filter out already-selected users from the search results
  const selectedIds = useMemo(() => selected.map((u) => u.id), [selected]);
  const availableUsers = useMemo(
    () => (data?.items ?? []).filter((u) => !selectedIds.includes(u.id)),
    [data, selectedIds]
  );

  const canCreate = name.trim().length >= 1 && selected.length >= 1 && !create.isPending;

  const handleAdd = (user: UserPublic) => {
    setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev : [...prev, user]));
    setQuery('');
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    create.mutate(
      {
        type: 'group',
        name: name.trim(),
        participants: selected.map((u) => u.id),
      },
      { onSuccess: () => onDone() }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Group name */}
      <div className="space-y-2">
        <Label htmlFor="group-name">Group name</Label>
        <Input
          id="group-name"
          placeholder="e.g. Project X"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoFocus
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            {selected.length} member{selected.length === 1 ? '' : 's'} selected
          </p>
          <SelectedUsersChips users={selected} onRemove={handleRemove} />
        </div>
      )}

      {/* Search + results */}
      <div className="space-y-2">
        <UserSearchInput value={query} onChange={setQuery} placeholder="Add members…" />
        <UserSearchResults
          users={availableUsers}
          isLoading={isLoading}
          emptyMessage={query ? 'No users found' : 'Type to add members to the group'}
          onSelect={handleAdd}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {selected.length === 0
            ? 'Add at least 1 member'
            : `${selected.length} member${selected.length === 1 ? '' : 's'}`}
        </div>
        <Button onClick={handleCreate} disabled={!canCreate}>
          {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create group
        </Button>
      </div>
    </div>
  );
}
