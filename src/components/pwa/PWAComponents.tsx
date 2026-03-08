import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      toast.success('Conexão restabelecida');
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      toast.warning('Você está offline. Alguns recursos podem estar limitados.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] py-1.5 px-4 text-center text-xs font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-success/90 text-success-foreground'
          : 'bg-destructive/90 text-destructive-foreground'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Conectado novamente</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Modo offline — dados salvos localmente serão sincronizados</span>
          </>
        )}
      </div>
    </div>
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not dismissed recently
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border shadow-lg rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Instalar NeuroPlay</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acesse mais rápido direto da tela inicial
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="text-xs h-7" onClick={handleInstall}>
                Instalar
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={handleDismiss}>
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceWorkerStatus() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-2 right-2 z-[100]">
      <Button
        size="sm"
        variant="outline"
        className="text-xs shadow-lg bg-card"
        onClick={() => window.location.reload()}
      >
        🔄 Nova versão disponível — Atualizar
      </Button>
    </div>
  );
}
