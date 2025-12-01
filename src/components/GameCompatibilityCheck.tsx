import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  detectBrowserCapabilities,
  isGameCompatible,
  getCapabilityErrorMessage,
  type BrowserCapabilities,
} from '@/lib/browserCompat';

interface GameCompatibilityCheckProps {
  onContinue?: () => void;
  showWarnings?: boolean;
}

export function GameCompatibilityCheck({ onContinue, showWarnings = true }: GameCompatibilityCheckProps) {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [compatibility, setCompatibility] = useState<{ compatible: boolean; missing: string[] } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const caps = detectBrowserCapabilities();
    const compat = isGameCompatible();
    setCapabilities(caps);
    setCompatibility(compat);
  }, []);

  if (!capabilities || !compatibility || dismissed) {
    return null;
  }

  // Critical errors (game won't work)
  if (!compatibility.compatible) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Navegador Não Suportado</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              Infelizmente, seu navegador não atende aos requisitos mínimos para jogar este jogo.
            </p>
            {compatibility.missing.map((cap) => (
              <p key={cap} className="text-sm">
                • {getCapabilityErrorMessage(cap as keyof BrowserCapabilities)}
              </p>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-semibold">Navegadores recomendados:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Google Chrome (versão 90+)</li>
                <li>Mozilla Firefox (versão 88+)</li>
                <li>Microsoft Edge (versão 90+)</li>
                <li>Safari (versão 14+)</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Warnings for non-critical features
  const warnings: string[] = [];
  
  if (!capabilities.webgl2) {
    warnings.push('Alguns efeitos visuais avançados podem não funcionar.');
  }
  
  if (!capabilities.audio) {
    warnings.push('Áudio não está disponível.');
  }
  
  if (!capabilities.vibration) {
    warnings.push('Feedback tátil não disponível.');
  }

  if (!showWarnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
      <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300 flex items-center justify-between">
          Recursos Limitados
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm mt-2 space-y-1">
          {warnings.map((warning, idx) => (
            <p key={idx}>• {warning}</p>
          ))}
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDismissed(true);
                onContinue?.();
              }}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-100"
            >
              Continuar Mesmo Assim
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
