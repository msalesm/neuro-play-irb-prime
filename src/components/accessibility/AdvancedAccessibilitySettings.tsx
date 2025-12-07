import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { toast } from 'sonner';
import {
  Eye,
  Type,
  Zap,
  Hand,
  Volume2,
  Palette,
  RotateCcw,
  Check,
  Settings2
} from 'lucide-react';

const presets = [
  {
    id: 'default',
    name: 'Padrão',
    description: 'Configuração padrão',
    icon: Settings2,
  },
  {
    id: 'tea_low_sensory',
    name: 'TEA - Baixo Sensorial',
    description: 'Menos estímulos visuais',
    icon: Eye,
  },
  {
    id: 'tdah_focus',
    name: 'TDAH - Foco',
    description: 'Alto contraste, menos distrações',
    icon: Zap,
  },
  {
    id: 'low_vision',
    name: 'Baixa Visão',
    description: 'Texto grande, alto contraste',
    icon: Type,
  },
  {
    id: 'motor',
    name: 'Motor',
    description: 'Botões grandes, mais espaço',
    icon: Hand,
  },
];

export function AdvancedAccessibilitySettings() {
  const { 
    profile, 
    presets: contextPresets,
    currentPresetId,
    updateProfile, 
    setPreset, 
  } = useAccessibility();

  const [speechRate, setSpeechRate] = useState(1);

  useEffect(() => {
    // Load speech rate from localStorage
    const savedRate = localStorage.getItem('tts_speech_rate');
    if (savedRate) {
      setSpeechRate(parseFloat(savedRate));
    }
  }, []);

  const handlePresetSelect = async (presetId: string) => {
    await setPreset(presetId);
    toast.success(`Perfil "${presets.find(p => p.id === presetId)?.name}" aplicado`);
  };

  const handleSpeechRateChange = (value: number[]) => {
    const rate = value[0];
    setSpeechRate(rate);
    localStorage.setItem('tts_speech_rate', rate.toString());
  };

  const handleReset = async () => {
    await setPreset('DEFAULT');
    setSpeechRate(1);
    localStorage.setItem('tts_speech_rate', '1');
    toast.success('Configurações restauradas');
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Perfis de Acessibilidade
          </CardTitle>
          <CardDescription>
            Escolha um perfil pré-configurado ou personalize
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentPresetId?.toLowerCase() === preset.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <preset.icon className={`h-6 w-6 ${
                    currentPresetId?.toLowerCase() === preset.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{preset.name}</span>
                      {currentPresetId?.toLowerCase() === preset.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Tamanho do Texto
              </Label>
              <Badge variant="outline">{(profile.fontScale * 100).toFixed(0)}%</Badge>
            </div>
            <Slider
              value={[profile.fontScale]}
              min={0.8}
              max={2}
              step={0.1}
              onValueChange={(v) => updateProfile({ fontScale: v[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Menor</span>
              <span>Maior</span>
            </div>
          </div>

          <Separator />

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Alto Contraste
              </Label>
              <p className="text-sm text-muted-foreground">
                Aumenta contraste de cores
              </p>
            </div>
            <Switch
              checked={profile.highContrast}
              onCheckedChange={(v) => updateProfile({ highContrast: v })}
            />
          </div>

          <Separator />

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Reduzir Animações
              </Label>
              <p className="text-sm text-muted-foreground">
                Menos movimento na tela
              </p>
            </div>
            <Switch
              checked={profile.reducedMotion}
              onCheckedChange={(v) => updateProfile({ reducedMotion: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Touch & Motor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Toque e Motor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Touch Target Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tamanho dos Botões</Label>
              <Badge variant="outline">{profile.touchTargetSizePx}px</Badge>
            </div>
            <Slider
              value={[profile.touchTargetSizePx]}
              min={44}
              max={100}
              step={4}
              onValueChange={(v) => updateProfile({ touchTargetSizePx: v[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Normal</span>
              <span>Extra Grande</span>
            </div>
          </div>

          <Separator />

          {/* UI Density */}
          <div className="space-y-3">
            <Label>Espaçamento da Interface</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['normal', 'spacious'] as const).map((density) => (
                <Button
                  key={density}
                  variant={profile.uiDensity === density ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateProfile({ uiDensity: density })}
                >
                  {density === 'normal' && 'Normal'}
                  {density === 'spacious' && 'Espaçoso'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Áudio e Leitura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speech Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Velocidade da Leitura</Label>
              <Badge variant="outline">{speechRate.toFixed(1)}x</Badge>
            </div>
            <Slider
              value={[speechRate]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleSpeechRateChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mais Lento</span>
              <span>Mais Rápido</span>
            </div>
          </div>

          <Separator />

          {/* Captions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Legendas</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar texto junto com áudio
              </p>
            </div>
            <Switch
              checked={profile.captions.enabled}
              onCheckedChange={(v) => updateProfile({ captions: { ...profile.captions, enabled: v } })}
            />
          </div>

          <Separator />

          {/* Hints */}
          <div className="space-y-3">
            <Label>Dicas e Instruções</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'simplified', 'timed'] as const).map((hint) => (
                <Button
                  key={hint}
                  variant={profile.hints.hintMode === hint ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateProfile({ hints: { ...profile.hints, hintMode: hint } })}
                >
                  {hint === 'normal' && 'Normal'}
                  {hint === 'simplified' && 'Simples'}
                  {hint === 'timed' && 'Temporizadas'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>
    </div>
  );
}
