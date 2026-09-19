/**
 * useFileConfig — fetch the backend's upload constraints.
 * Cached for 1 hour; the config rarely changes.
 */

import { useQuery } from '@tanstack/react-query';
import { filesApi } from '@/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { FileConfig } from '@/api/files.api';

const FALLBACK_CONFIG: FileConfig = {
  provider: 'local',
  maxFileSize: 10 * 1024 * 1024,
  allowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.mp3',
    '.wav',
    '.ogg',
    '.mp4',
    '.webm',
    '.mov',
  ],
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
  staticPrefix: '/static/uploads',
};

export function useFileConfig() {
  const query = useQuery({
    queryKey: QUERY_KEYS.files.config,
    queryFn: async () => {
      const res = await filesApi.getConfig();
      return res.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    placeholderData: FALLBACK_CONFIG,
  });

  return {
    config: query.data ?? FALLBACK_CONFIG,
    isLoading: query.isLoading,
  };
}
