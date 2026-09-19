/**
 * AttachmentGrid — displays the attachments of a message.
 *
 * Behavior:
 *   - 1 image → single large preview
 *   - 2+ images → grid (2 cols, up to 4 shown + overflow count)
 *   - non-image → download card
 */

import { useState } from 'react';
import { Download, FileText, Music, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/format';
import { ImageLightbox } from './ImageLightbox';
import type { Attachment } from '@/types';

interface Props {
  attachments: Attachment[];
  isMine: boolean;
}

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Local files: prefix with the socket/server origin
  const base = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Best-effort check: is this attachment an image?
 * Trusts `type` first, then falls back to extension sniffing.
 */
function isImageAttachment(a: Attachment): boolean {
  if (a.type === 'image') return true;
  // Fallback: check mimeType or extension
  if (a.mimeType?.startsWith('image/')) return true;
  const name = a.name ?? a.url ?? '';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

function NonImageCard({ attachment, isMine }: { attachment: Attachment; isMine: boolean }) {
  const icon =
    attachment.type === 'audio' ? (
      <Music className="h-5 w-5" />
    ) : attachment.type === 'video' ? (
      <Video className="h-5 w-5" />
    ) : (
      <FileText className="h-5 w-5" />
    );

  const href = resolveUrl(attachment.url);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.name ?? undefined}
      className={cn(
        'flex w-64 max-w-full items-center gap-3 rounded-md border p-2 text-left transition-colors',
        isMine
          ? 'border-primary-foreground/30 bg-primary-foreground/10 hover:bg-primary-foreground/20'
          : 'border-border bg-background/50 hover:bg-accent/50'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded',
          isMine ? 'bg-primary-foreground/20' : 'bg-muted'
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{attachment.name || 'File'}</p>
        <p
          className={cn(
            'text-[10px]',
            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatBytes(attachment.size)}
        </p>
      </div>
      <Download
        className={cn(
          'h-4 w-4 shrink-0',
          isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}
      />
    </a>
  );
}

export function AttachmentGrid({ attachments, isMine }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

   const images = attachments.filter(isImageAttachment);
   const others = attachments.filter((a) => !isImageAttachment(a));

  return (
    <>
      {images.length > 0 && (
        <div
          className={cn('mt-1.5 grid gap-1', images.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}
        >
          {images.slice(0, 4).map((img, i) => {
            const url = resolveUrl(img.thumbnail || img.url);
            const fullUrl = resolveUrl(img.url);

            return (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxSrc(fullUrl)}
                className={cn(
                  'relative overflow-hidden rounded-lg',
                  images.length === 1
                    ? 'max-h-[320px] max-w-[320px]'
                    : 'aspect-square max-h-[160px]'
                )}
              >
                <img
                  src={url}
                  alt={img.name || ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform hover:scale-[1.02]"
                />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                    +{images.length - 4}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {others.map((a, i) => (
            <NonImageCard key={i} attachment={a} isMine={isMine} />
          ))}
        </div>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
