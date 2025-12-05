import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  Contrast, 
  Focus,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  X,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { announce } from './ScreenReaderAnnouncer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Floating accessibility toolbar (WCAG 2.2 compliant)
export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, updateProfile, setPreset } = useAccessibility();

  const increaseFontSize = () => {
    const newScale = Math.min(profile.fontScale + 0.1, 2.0);
    updateProfile({ fontScale: newScale });
    announce(`Tamanho da fonte: ${Math.round(newScale * 100)}%`, 'polite');
  };

  const decreaseFontSize = () => {
    const newScale = Math.max(profile.fontScale - 0.1, 0.8);
    updateProfile({ fontScale: newScale });
    announce(`Tamanho da fonte: ${Math.round(newScale * 100)}%`, 'polite');
  };

  const toggleHighContrast = () => {
    updateProfile({ highContrast: !profile.highContrast });
    announce(profile.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado', 'polite');
  };

  const toggleFocusMode = () => {
    updateProfile({ focusMode: !profile.focusMode });
    announce(profile.focusMode ? 'Modo foco desativado' : 'Modo foco ativado', 'polite');
  };

  const toggleSoftSounds = () => {
    updateProfile({ softSounds: !profile.softSounds });
    announce(profile.softSounds ? 'Sons normais' : 'Sons suaves ativados', 'polite');
  };

  const resetSettings = async () => {
    await setPreset('DEFAULT');
    announce('Configurações restauradas para o padrão', 'polite');
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-20 right-4 z-[9998] md:bottom-4">
        {/* Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="rounded-full shadow-lg w-12 h-12"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Menu de acessibilidade"
            >
              <Accessibility className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Acessibilidade (Shift + ?)</p>
          </TooltipContent>
        </Tooltip>

        {/* Toolbar Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-xl p-4 min-w-[280px]"
              role="toolbar"
              aria-label="Ferramentas de acessibilidade"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Acessibilidade Rápida</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Font Size Controls */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseFontSize}
                      aria-label="Diminuir fonte"
                      disabled={profile.fontScale <= 0.8}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Diminuir fonte</TooltipContent>
                </Tooltip>

                <div className="flex items-center justify-center text-sm font-medium">
                  {Math.round(profile.fontScale * 100)}%
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseFontSize}
                      aria-label="Aumentar fonte"
                      disabled={profile.fontScale >= 2.0}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Aumentar fonte</TooltipContent>
                </Tooltip>

                {/* High Contrast */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={profile.highContrast ? 'default' : 'outline'}
                      size="icon"
                      onClick={toggleHighContrast}
                      aria-pressed={profile.highContrast}
                      aria-label="Alto contraste"
                    >
                      <Contrast className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Alto contraste</TooltipContent>
                </Tooltip>

                {/* Focus Mode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={profile.focusMode ? 'default' : 'outline'}
                      size="icon"
                      onClick={toggleFocusMode}
                      aria-pressed={profile.focusMode}
                      aria-label="Modo foco"
                    >
                      <Focus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modo foco</TooltipContent>
                </Tooltip>

                {/* Soft Sounds */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={profile.softSounds ? 'default' : 'outline'}
                      size="icon"
                      onClick={toggleSoftSounds}
                      aria-pressed={profile.softSounds}
                      aria-label="Sons suaves"
                    >
                      {profile.softSounds ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sons suaves</TooltipContent>
                </Tooltip>

                {/* Reset */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={resetSettings}
                      aria-label="Restaurar padrões"
                      className="col-span-3"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      <span className="text-xs">Restaurar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Restaurar configurações padrão</TooltipContent>
                </Tooltip>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-3 w-3" />
                  <span>Shift + ? para ver atalhos</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
