import { toast } from 'sonner';

/**
 * Centralized error handler for Supabase queries.
 * Provides user-friendly error messages and consistent logging.
 */
export function handleQueryError(error: unknown, context: string): void {
  const message = error instanceof Error ? error.message : String(error);
  
  console.error(`[${context}]`, error);
  
  // Map common Supabase errors to user-friendly messages
  if (message.includes('JWT expired') || message.includes('invalid claim')) {
    toast.error('Sessão expirada. Faça login novamente.');
    return;
  }
  
  if (message.includes('row-level security') || message.includes('new row violates')) {
    toast.error('Sem permissão para esta ação.');
    return;
  }
  
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    toast.error('Este registro já existe.');
    return;
  }

  if (message.includes('FetchError') || message.includes('NetworkError') || message.includes('Failed to fetch')) {
    toast.error('Erro de conexão. Verifique sua internet.');
    return;
  }

  toast.error(`Erro: ${context}`);
}

/**
 * Wraps an async operation with standardized error handling.
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleQueryError(error, context);
    return null;
  }
}
