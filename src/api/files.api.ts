/**
 * File endpoints.
 */

import { api, apiClient } from './client';
import type { ApiSuccess, UploadedFile } from '@/types';

export interface FileConfig {
  provider: 'local' | 'cloudinary';
  maxFileSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  staticPrefix: string;
}

export const filesApi = {
  getConfig: () => api.get<ApiSuccess<FileConfig>>('/files/config'),

  /**
   * Upload a single file.
   * Progress callback receives 0–100.
   */
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<ApiSuccess<{ file: UploadedFile }>>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  /**
   * Upload multiple files (max 10).
   */
  uploadMultiple: (files: File[], onProgress?: (percent: number) => void) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return apiClient
      .post<ApiSuccess<{ files: UploadedFile[] }>>('/files/upload-multiple', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  remove: (publicId: string) =>
    api.delete<ApiSuccess<{ removed: boolean }>>(
      `/files/${encodeURIComponent(publicId)}`
    ),
};