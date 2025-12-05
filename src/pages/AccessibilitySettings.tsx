import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Eye, Hand, Volume2, Brain, Timer, Palette, Focus, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-24">
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

        {/* Color Blindness Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Daltonismo
            </CardTitle>
            <CardDescription>
              Adapta as cores para diferentes tipos de daltonismo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modo de Cor</Label>
              <Select
                value={profile.colorBlindMode || 'none'}
                onValueChange={(value: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia') => 
                  updateProfile({ colorBlindMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Normal</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (vermelho-verde)</SelectItem>
                  <SelectItem value="protanopia">Protanopia (vermelho)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (azul-amarelo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sensory Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Focus className="h-5 w-5" />
              Sensorial e Foco
            </CardTitle>
            <CardDescription>
              Configurações para sensibilidade sensorial e concentração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Low Stimulation */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Baixa Estimulação</Label>
                <p className="text-sm text-muted-foreground">Cores suaves e interface calma</p>
              </div>
              <Switch
                checked={profile.lowStimulation || false}
                onCheckedChange={(checked) => updateProfile({ lowStimulation: checked })}
              />
            </div>

            {/* Focus Mode */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Foco</Label>
                <p className="text-sm text-muted-foreground">Remove decorações e distrações</p>
              </div>
              <Switch
                checked={profile.focusMode || false}
                onCheckedChange={(checked) => updateProfile({ focusMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reading Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Leitura (Dislexia)
            </CardTitle>
            <CardDescription>
              Configurações otimizadas para facilitar a leitura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reading Mode */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Leitura</Label>
                <p className="text-sm text-muted-foreground">Fonte e espaçamento otimizados</p>
              </div>
              <Switch
                checked={profile.readingMode || false}
                onCheckedChange={(checked) => updateProfile({ readingMode: checked })}
              />
            </div>

            {/* Line Spacing */}
            <div className="space-y-2">
              <Label>Espaçamento entre Linhas: {(profile.lineSpacing || 1.5).toFixed(1)}</Label>
              <Slider
                value={[profile.lineSpacing || 1.5]}
                min={1.0}
                max={2.5}
                step={0.1}
                onValueChange={([value]) => updateProfile({ lineSpacing: value })}
              />
            </div>

            {/* Letter Spacing */}
            <div className="space-y-2">
              <Label>Espaçamento entre Letras: {((profile.letterSpacing || 0) * 100).toFixed(0)}%</Label>
              <Slider
                value={[(profile.letterSpacing || 0) * 100]}
                min={0}
                max={20}
                step={1}
                onValueChange={([value]) => updateProfile({ letterSpacing: value / 100 })}
              />
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

            {/* Soft Sounds */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Sons Suaves</Label>
                <p className="text-sm text-muted-foreground">Reduz volume e intensidade dos sons</p>
              </div>
              <Switch
                checked={profile.softSounds || false}
                onCheckedChange={(checked) => updateProfile({ softSounds: checked })}
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
                lineHeight: profile.lineSpacing || 1.5,
                letterSpacing: `${profile.letterSpacing || 0}em`,
              }}
            >
              <p className="mb-4">Este é um texto de exemplo para visualizar suas configurações de acessibilidade.</p>
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
