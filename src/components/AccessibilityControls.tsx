import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings, Volume, Eye, Type } from "lucide-react";

interface AccessibilitySettings {
  reducedMotion: boolean;
  reducedSounds: boolean;
  highContrast: boolean;
  dyslexicFont: boolean;
}

export const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      reducedMotion: false,
      reducedSounds: false,
      highContrast: false,
      dyslexicFont: true, // Default to OpenDyslexic
    };
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings();
  }, [settings]);

  const applySettings = () => {
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.dyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }

    if (settings.reducedSounds) {
      root.classList.add('reduced-sounds');
    } else {
      root.classList.remove('reduced-sounds');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Accessibility Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
        aria-label="Configurações de Acessibilidade"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed top-16 right-4 z-50 w-80 bg-background/95 backdrop-blur-sm shadow-glow">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Acessibilidade</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Reduzir Animações</span>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(value) => updateSetting('reducedMotion', value)}
              />
            </div>

            {/* Reduced Sounds */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume className="w-4 h-4" />
                <span className="text-sm">Reduzir Sons</span>
              </div>
              <Switch
                checked={settings.reducedSounds}
                onCheckedChange={(value) => updateSetting('reducedSounds', value)}
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Alto Contraste</span>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(value) => updateSetting('highContrast', value)}
              />
            </div>

            {/* Dyslexic Font */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="text-sm">Fonte para Dislexia</span>
              </div>
              <Switch
                checked={settings.dyslexicFont}
                onCheckedChange={(value) => updateSetting('dyslexicFont', value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};