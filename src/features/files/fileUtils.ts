/**
 * File helpers — validation, categorization, size math.
 */

import type { AttachmentType } from '@/types';

/**
 * Determine whether a File is an image/file/audio/video based on MIME type.
 */
export function categorizeMime(mime: string): AttachmentType {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
}

/**
 * Check that a File is compatible with the backend's allowlists.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
export interface FileValidation {
  ok: boolean;
  reason?: string;
}

export function validateFile(
  file: File,
  allowedMimeTypes: string[],
  allowedExtensions: string[],
  maxFileSize: number
): FileValidation {
  if (file.size > maxFileSize) {
    return {
      ok: false,
      reason: `File exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      ok: false,
      reason: `File type "${file.type || 'unknown'}" is not allowed`,
    };
  }

  const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      ok: false,
      reason: `File extension "${ext}" is not allowed`,
    };
  }

  return { ok: true };
}

/**
 * Generate a short, unique client id for tracking an in-flight upload.
 */
export function makeTempId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
