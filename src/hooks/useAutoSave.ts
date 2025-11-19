import { useState } from 'react';

export interface AutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  onSave?: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useAutoSave(options: AutoSaveOptions = {}) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    save: async (data: any) => {
      try {
        setIsSaving(true);
        await options.onSave?.(data);
        setLastSaved(new Date());
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsSaving(false);
      }
    },
    lastSaved,
    isSaving,
    error,
  };
}
