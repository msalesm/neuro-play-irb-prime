import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Eye, Hand, Volume2, Brain, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTelemetry } from '@/hooks/useTelemetry';
import { toast } from '@/hooks/use-toast';

export default function AccessibilitySettings() {
  const navigate = useNavigate();
  const { profile, presets, currentPresetId, loading, setPreset, updateProfile } = useAccessibility();
  const { trackScreenView, trackAccessibilityChange } = useTelemetry();

  useEffect(() => {
    trackScreenView('accessibility_settings');
  }, [trackScreenView]);

  const handlePresetChange = async (presetId: string) => {
    await setPreset(presetId);
    trackAccessibilityChange(presetId);
    toast({
      title: 'Preset aplicado',
      description: `Configurações de "${presets.find(p => p.id === presetId)?.label}" foram aplicadas.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Configurações de Acessibilidade
            </h1>
            <p className="text-muted-foreground">Personalize sua experiência</p>
          </div>
        </div>

        {/* Preset Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Presets Rápidos
            </CardTitle>
            <CardDescription>
              Escolha um perfil pré-configurado para suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={currentPresetId} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um preset" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.label}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Visual Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Configurações Visuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Scale */}
            <div className="space-y-2">
              <Label>Tamanho da Fonte: {profile.fontScale.toFixed(1)}x</Label>
              <Slider
                value={[profile.fontScale]}
                min={0.8}
                max={2.0}
                step={0.1}
                onValueChange={([value]) => updateProfile({ fontScale: value })}
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Alto Contraste</Label>
                <p className="text-sm text-muted-foreground">Aumenta o contraste das cores</p>
              </div>
              <Switch
                checked={profile.highContrast}
                onCheckedChange={(checked) => updateProfile({ highContrast: checked })}
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Reduzir Animações</Label>
                <p className="text-sm text-muted-foreground">Desativa animações e transições</p>
              </div>
              <Switch
                checked={profile.reducedMotion}
                onCheckedChange={(checked) => updateProfile({ reducedMotion: checked })}
              />
            </div>

            {/* UI Density */}
            <div className="space-y-2">
              <Label>Densidade da Interface</Label>
              <Select
                value={profile.uiDensity}
                onValueChange={(value: 'normal' | 'spacious') => updateProfile({ uiDensity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Espaçosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Motor Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hand className="h-5 w-5" />
              Configurações Motoras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Touch Target Size */}
            <div className="space-y-2">
              <Label>Tamanho dos Botões: {profile.touchTargetSizePx}px</Label>
              <Slider
                value={[profile.touchTargetSizePx]}
                min={44}
                max={96}
                step={4}
                onValueChange={([value]) => updateProfile({ touchTargetSizePx: value })}
              />
              <p className="text-xs text-muted-foreground">
                Botões maiores facilitam o toque
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Legendas e Áudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Captions */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Legendas Ativadas</Label>
                <p className="text-sm text-muted-foreground">Exibe texto para conteúdo de áudio</p>
              </div>
              <Switch
                checked={profile.captions.enabled}
                onCheckedChange={(checked) => 
                  updateProfile({ captions: { ...profile.captions, enabled: checked } })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Hints Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Dicas e Orientações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show Hints */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Dicas</Label>
                <p className="text-sm text-muted-foreground">Exibe dicas durante as atividades</p>
              </div>
              <Switch
                checked={profile.hints.showInlineHints}
                onCheckedChange={(checked) => 
                  updateProfile({ hints: { ...profile.hints, showInlineHints: checked } })
                }
              />
            </div>

            {/* Hint Mode */}
            <div className="space-y-2">
              <Label>Modo de Dicas</Label>
              <Select
                value={profile.hints.hintMode}
                onValueChange={(value: 'normal' | 'simplified' | 'timed') => 
                  updateProfile({ hints: { ...profile.hints, hintMode: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="simplified">Simplificado</SelectItem>
                  <SelectItem value="timed">Com Tempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Prévia das Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 rounded-lg bg-background border"
              style={{ 
                fontSize: `${profile.fontScale}rem`,
                filter: profile.highContrast ? 'contrast(1.6) brightness(1.1)' : 'none',
              }}
            >
              <p className="mb-4">Este é um texto de exemplo para visualizar suas configurações.</p>
              <Button 
                style={{ 
                  minHeight: `${profile.touchTargetSizePx}px`,
                  minWidth: `${profile.touchTargetSizePx}px`,
                }}
              >
                Botão de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
