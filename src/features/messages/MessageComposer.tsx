/**
 * MessageComposer — the input area at the bottom.
 *
 * Features:
 *   - Auto-growing textarea
 *   - Enter to send, Shift+Enter for newline
 *   - Disabled state while sending
 *   - Placeholder shows the conversation name
 *   - Text input + attachments + drag-and-drop + paste.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2, SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AttachButton,
  AttachmentPreview,
  useUploadFile,
  type PendingUpload,
} from '@/features/files';
import { useFileConfig } from '@/features/files';
import type { Attachment } from '@/types';

interface Props {
  conversationName: string;
  onSend: (content: string, attachments?: Attachment[]) => void;
  onTyping?: () => void;
  sending: boolean;
}

const MAX_ROWS = 8;

export function MessageComposer({
  conversationName,
  onSend,
  onTyping,
  sending,
}: Props) {
  const [value, setValue] = useState('');
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [dragging, setDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);

  const { uploadOne } = useUploadFile();
  const { config } = useFileConfig();

  // Auto-grow textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  // Focus on mount / conversation change
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationName]);

  // ---------- Upload handling ----------

  const startUpload = useCallback(
    async (files: File[]) => {
      const newUploads: PendingUpload[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Upload sequentially for progress clarity
      for (const u of newUploads) {
        setUploads((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, status: 'uploading' } : x))
        );

        try {
          const attachment = await uploadOne(u.file, {
            onProgress: (tempId: string, progress: number) => {
              void tempId;
              setUploads((prev) => prev.map((x) => (x.id === u.id ? { ...x, progress } : x)));
            },
          });

          setUploads((prev) =>
            prev.map((x) =>
              x.id === u.id ? { ...x, status: 'done', progress: 100, attachment } : x
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setUploads((prev) =>
            prev.map((x) =>
              x.id === u.id ? { ...x, status: 'error', error: msg } : x
            )
          );
          toast.error(`${u.file.name}: ${msg}`);
        }
      }
    },
    [uploadOne]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      if (files.length > 10) {
        toast.error('Maximum 10 files per message');
        return;
      }
      void startUpload(files);
    },
    [startUpload]
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // ---------- Paste ----------

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData.items);
      const files = items
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((f): f is File => !!f);

      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // ---------- Drag and drop ----------

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // ---------- Send ----------

  const readyAttachments = uploads
    .filter((u) => u.status === 'done' && u.attachment)
    .map((u) => u.attachment!) as Attachment[];

  const hasPendingUploads = uploads.some(
    (u) => u.status === 'pending' || u.status === 'uploading'
  );

  const canSend =
    (value.trim().length > 0 || readyAttachments.length > 0) &&
    !sending &&
    !hasPendingUploads;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = value.trim();
    onSend(
      trimmed,
      readyAttachments.length > 0 ? readyAttachments : undefined
    );
    setValue('');
    setUploads([]);
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        'relative border-t bg-background',
        dragging && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="rounded-lg border-2 border-dashed border-primary bg-background px-6 py-4 text-sm font-medium">
            Drop files to attach
          </div>
        </div>
      )}

      {/* Pending uploads */}
      <AttachmentPreview uploads={uploads} onRemove={removeUpload} />

      {/* Input row */}
      <div className="flex items-end gap-2 p-3">
        <AttachButton
          onFiles={handleFiles}
          disabled={sending}
          accept={config.allowedExtensions.join(',')}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.length > 0) onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={`Message ${conversationName}…`}
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl border bg-muted/30 px-3.5 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'min-h-[40px]'
          )}
          style={{ lineHeight: '22px' }}
        />

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}