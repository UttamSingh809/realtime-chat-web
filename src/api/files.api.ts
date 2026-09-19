/**
 * File endpoints.
 */

import { api, apiClient } from './client';
import type { ApiSuccess, UploadedFile } from '@/types';

/**
 * Best-effort MIME inference from a filename extension.
 * Used only as a fallback when File.type is empty.
 */
function inferMimeFromExtension(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  return map[ext] ?? '';
}

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

    // If the File object has no MIME type (e.g., pasted from clipboard or
    // dragged from a browser tab), infer it from the extension. Without this,
    // FormData sends "application/octet-stream" and the backend can't
    // categorize the file.
    const mimeFallback = file.type || inferMimeFromExtension(file.name);
    const blob = mimeFallback ? new Blob([file], { type: mimeFallback }) : file;
    form.append('file', blob, file.name);
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
    api.delete<ApiSuccess<{ removed: boolean }>>(`/files/${encodeURIComponent(publicId)}`),
};