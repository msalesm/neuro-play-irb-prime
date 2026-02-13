import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Contrast,
  Eye,
  Volume2,
  Hand,
  Focus,
  Moon,
  Sun,
  RotateCcw,
  X,
  ChevronRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useNavigate } from 'react-router-dom';
import { announce } from './ScreenReaderAnnouncer';
import accessibilityIcon from '@/assets/accessibility-icon.jpg';

export function AccessibilityQuickPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, updateProfile, setPreset } = useAccessibility();
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'fontSize',
      label: 'Texto',
      icon: profile.fontScale > 1 ? ZoomIn : ZoomOut,
      value: `${Math.round(profile.fontScale * 100)}%`,
      action: () => {
        const newScale = profile.fontScale >= 1.5 ? 1 : profile.fontScale + 0.25;
        updateProfile({ fontScale: newScale });
        announce(`Tamanho do texto: ${Math.round(newScale * 100)}%`, 'polite');
      },
    },
    {
      id: 'highContrast',
      label: 'Alto Contraste',
      icon: Contrast,
      active: profile.highContrast,
      action: () => {
        updateProfile({ highContrast: !profile.highContrast });
        announce(profile.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado', 'polite');
      },
    },
    {
      id: 'lowStimulation',
      label: 'Modo Calmo',
      icon: Eye,
      active: profile.lowStimulation,
      action: () => {
        updateProfile({ lowStimulation: !profile.lowStimulation });
        announce(profile.lowStimulation ? 'Modo calmo desativado' : 'Modo calmo ativado', 'polite');
      },
    },
    {
      id: 'focusMode',
      label: 'Modo Foco',
      icon: Focus,
      active: profile.focusMode,
      action: () => {
        updateProfile({ focusMode: !profile.focusMode });
        announce(profile.focusMode ? 'Modo foco desativado' : 'Modo foco ativado', 'polite');
      },
    },
    {
      id: 'motorMode',
      label: 'Botões Grandes',
      icon: Hand,
      active: profile.touchTargetSizePx > 60,
      action: () => {
        const newSize = profile.touchTargetSizePx > 60 ? 44 : 72;
        updateProfile({ touchTargetSizePx: newSize });
        announce(newSize > 60 ? 'Botões grandes ativados' : 'Tamanho normal dos botões', 'polite');
      },
    },
    {
      id: 'softSounds',
      label: 'Sons Suaves',
      icon: Volume2,
      active: profile.softSounds,
      action: () => {
        updateProfile({ softSounds: !profile.softSounds });
        announce(profile.softSounds ? 'Sons normais' : 'Sons suaves ativados', 'polite');
      },
    },
  ];

  const handleReset = async () => {
    await setPreset('DEFAULT');
    announce('Configurações restauradas', 'polite');
  };

  return (
    <>
      {/* Floating Button - Top Right */}
      <Button
        variant="default"
        size="icon"
        className="fixed top-4 right-4 z-50 rounded-full shadow-lg w-10 h-10 md:w-12 md:h-12 p-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Menu de acessibilidade"
      >
        <img src={accessibilityIcon} alt="Acessibilidade" className="h-8 w-8 rounded-full" />
      </Button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src={accessibilityIcon} alt="Acessibilidade" className="h-6 w-6 rounded-full" />
                    <h2 className="text-xl font-bold">Acessibilidade</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Fechar">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        action.active 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <action.icon className={`h-6 w-6 mb-2 ${action.active ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="block text-sm font-medium">{action.label}</span>
                      {action.value && (
                        <Badge variant="outline" className="mt-1">{action.value}</Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* Text Size Slider */}
                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Tamanho do Texto</span>
                    <Badge variant="secondary">{Math.round(profile.fontScale * 100)}%</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateProfile({ fontScale: Math.max(0.8, profile.fontScale - 0.1) })}
                      disabled={profile.fontScale <= 0.8}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[profile.fontScale]}
                      min={0.8}
                      max={2}
                      step={0.1}
                      className="flex-1"
                      onValueChange={([v]) => updateProfile({ fontScale: v })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateProfile({ fontScale: Math.min(2, profile.fontScale + 0.1) })}
                      disabled={profile.fontScale >= 2}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Button Size Slider */}
                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Tamanho dos Botões</span>
                    <Badge variant="secondary">{profile.touchTargetSizePx}px</Badge>
                  </div>
                  <Slider
                    value={[profile.touchTargetSizePx]}
                    min={44}
                    max={96}
                    step={4}
                    onValueChange={([v]) => updateProfile({ touchTargetSizePx: v })}
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Normal</span>
                    <span>Extra Grande</span>
                  </div>
                </div>

                {/* More Settings Link */}
                <Button
                  variant="outline"
                  className="w-full justify-between mb-4"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/accessibility-settings');
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Todas as Configurações
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Reset Button */}
                <Button variant="ghost" className="w-full" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
