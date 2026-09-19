/**
 * AttachButton — paperclip that opens the file picker.
 */

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
}

export function AttachButton({ onFiles, disabled, accept }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFiles(files);
    // Reset so the same file can be picked again
    e.target.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" multiple hidden accept={accept} onChange={handleChange} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="h-10 w-10 shrink-0"
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  );
}
