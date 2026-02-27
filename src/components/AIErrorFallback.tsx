import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface AIErrorFallbackProps {
  error?: Error | string;
  onRetry?: () => void;
  featureName?: string;
  compact?: boolean;
}

export function AIErrorFallback({ error, onRetry, featureName = 'IA', compact = false }: AIErrorFallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed');
  const isRateLimit = errorMessage.includes('429') || errorMessage.includes('rate limit');

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
        {isNetworkError ? <WifiOff className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
        <span className="flex-1">
          {isRateLimit
            ? 'Limite de requisições atingido. Aguarde alguns minutos.'
            : `Serviço de ${featureName} temporariamente indisponível.`}
        </span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="shrink-0">
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert className="border-warning/50">
      {isNetworkError ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle>Serviço de {featureName} indisponível</AlertTitle>
      <AlertDescription className="text-muted-foreground mt-1">
        {isRateLimit ? (
          'Você atingiu o limite de requisições. Aguarde alguns minutos antes de tentar novamente.'
        ) : isNetworkError ? (
          'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.'
        ) : (
          'O serviço está temporariamente indisponível. As demais funcionalidades da plataforma continuam operando normalmente.'
        )}
      </AlertDescription>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </Alert>
  );
}
