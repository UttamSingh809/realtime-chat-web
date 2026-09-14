/**
 * NewDmTab — start a direct message with one user.
 * Selecting a user immediately creates (or opens) the DM.
 */

import { useState } from 'react';
import { useUserSearch, UserSearchInput, UserSearchResults } from '@/features/users';
import { useCreateConversation } from './useCreateConversation';

interface Props {
  onDone: () => void;
}

export function NewDmTab({ onDone }: Props) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useUserSearch(query);
  const create = useCreateConversation();

  const handleSelect = (user: { id: string }) => {
    create.mutate({ type: 'private', recipientId: user.id }, { onSuccess: () => onDone() });
  };

  return (
    <div className="flex flex-col gap-3">
      <UserSearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name or username…"
        autoFocus
      />

      <UserSearchResults
        users={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={query ? 'No users found' : 'Type to find someone'}
        onSelect={handleSelect}
        disabled={create.isPending}
      />
    </div>
  );
}
