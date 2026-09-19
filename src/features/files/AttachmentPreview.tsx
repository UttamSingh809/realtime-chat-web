/**
 * AttachmentPreview — pending uploads shown above the composer.
 * Each chip shows filename, progress, and a remove button.
 */

import { X, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format';
import type { PendingUpload } from './useUploadFile';

interface Props {
  uploads: PendingUpload[];
  onRemove: (id: string) => void;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-primary transition-[width] duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function AttachmentPreview({ uploads, onRemove }: Props) {
  if (uploads.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b p-2">
      {uploads.map((u) => {
        const isImage = u.file.type.startsWith('image/');
        return (
          <div
            key={u.id}
            className={cn(
              'group relative flex w-full max-w-xs items-center gap-2 rounded-lg border p-2',
              u.status === 'error' && 'border-destructive/40 bg-destructive/5'
            )}
          >
            {isImage ? (
              <img
                src={URL.createObjectURL(u.file)}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{u.file.name}</p>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                {u.status === 'uploading' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{u.progress}%</span>
                  </>
                )}
                {u.status === 'pending' && <span>Waiting…</span>}
                {u.status === 'done' && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span>{formatBytes(u.file.size)}</span>
                  </>
                )}
                {u.status === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">{u.error}</span>
                  </>
                )}
              </div>
              {u.status === 'uploading' && (
                <div className="mt-1">
                  <ProgressBar value={u.progress} />
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => onRemove(u.id)}
              aria-label={`Remove ${u.file.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
