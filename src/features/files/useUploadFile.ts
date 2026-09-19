/**
 * useUploadFile — upload files with progress callbacks.
 *
 * Returns two functions:
 *   - uploadOne(file) → Promise<Attachment>
 *   - uploadMany(files) → Promise<Attachment[]>
 *
 * Progress is per-file and reported via a callback.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { filesApi } from '@/api';
import { useFileConfig } from './useFileConfig';
import { validateFile, makeTempId } from './fileUtils';
import type { ApiError, Attachment } from '@/types';

export interface PendingUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  attachment?: Attachment;
}

export interface UploadOptions {
  onProgress?: (tempId: string, progress: number) => void;
  skipValidation?: boolean;
}

export function useUploadFile() {
  const { config } = useFileConfig();
  const queryClient = useQueryClient();

  const single = useMutation({
    mutationFn: async ({ file, tempId }: { file: File; tempId: string }) => {
      const res = await filesApi.upload(file, (percent) => {
        // Progress callback from axios — bubbles up to the caller
        // via the closure in uploadOne below.
        if (typeof percent === 'number') {
          // Store on the file object for the caller to read
          (file as File & { _progress?: number })._progress = percent;
        }
      });
      void tempId;
      return res.data.file;
    },

    onSuccess: () => {
      // Invalidate the file config (in case provider rotated something)
      queryClient.invalidateQueries({ queryKey: ['files', 'config'] });
    },

    onError: (error) => {
      const apiError = error as unknown as ApiError;
      toast.error(apiError.message || 'Upload failed');
    },
  });

  /**
   * Upload a single file with progress callback.
   */
  const uploadOne = async (file: File, options: UploadOptions = {}): Promise<Attachment> => {
    const tempId = makeTempId();

    // Validate
    if (!options.skipValidation) {
      const v = validateFile(
        file,
        config.allowedMimeTypes,
        config.allowedExtensions,
        config.maxFileSize
      );
      if (!v.ok) {
        const err = new Error(v.reason || 'Invalid file');
        (err as Error & { code?: string }).code = 'VALIDATION_ERROR';
        throw err;
      }
    }

    try {
      const res = await filesApi.upload(file, (percent) => {
        options.onProgress?.(tempId, percent);
      });
      return res.data.file;
    } catch (error) {
      const apiError = error as unknown as ApiError;
      throw new Error(apiError.message || 'Upload failed');
    }
  };

  /**
   * Upload multiple files sequentially.
   * Calls onProgress per file.
   */
  const uploadMany = async (files: File[], options: UploadOptions = {}): Promise<Attachment[]> => {
    const results: Attachment[] = [];
    for (const file of files) {
      results.push(await uploadOne(file, options));
    }
    return results;
  };

  return {
    uploadOne,
    uploadMany,
    isPending: single.isPending,
    tempId: makeTempId(),
  };
}
