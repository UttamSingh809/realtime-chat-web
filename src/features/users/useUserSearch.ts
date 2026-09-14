/**
 * useUserSearch — debounced user search.
 *
 * Debounce is done here rather than in the component so multiple consumers
 * share the same debounce window.
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { UserPublic } from '@/types';

const DEBOUNCE_MS = 250;

export function useUserSearch(query: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  return useQuery({
    queryKey: QUERY_KEYS.users.search(debounced),
    queryFn: async () => {
      const res = await usersApi.search({ q: debounced, limit: 30 });
      return res.data;
    },
    // Enable when: we have a debounced term OR query is empty (to show defaults)
    enabled,
    staleTime: 30 * 1000,
    select: (data) => ({
      items: data.items as UserPublic[],
      meta: data.meta,
    }),
  });
}