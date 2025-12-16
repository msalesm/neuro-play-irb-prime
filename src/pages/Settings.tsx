import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, Accessibility, Bell, 
  Palette, Volume2, Eye, Brain, Monitor,
  Smartphone, Sun, Moon, Contrast, HelpCircle, Play, Sliders
} from 'lucide-react';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { HapticProvider } from '@/contexts/HapticContext';
import { HapticSettings } from '@/components/HapticSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdvancedAccessibilitySettings } from '@/components/accessibility/AdvancedAccessibilitySettings';
import { toast } from 'sonner';

export default function Settings() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState({
    // Accessibility
    dyslexicFont: false,
    highContrast: false,
    reduceMotion: false,
    largeText: false,
    
    // Audio & Visual
    soundEffects: true,
    backgroundMusic: false,
    visualEffects: true,
    
    // Notifications
    gameReminders: true,
    progressUpdates: true,
    achievementAlerts: true,
    
    // Privacy & Data
    dataCollection: true,
    shareProgress: false,
    analyticsOptIn: true,
    
    // Theme
    theme: 'auto',
    colorScheme: 'default'
  });

  const childProfileId = localStorage.getItem('selectedChildProfile');

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.preferences && typeof data.preferences === 'object') {
          setSettings(prev => ({ ...prev, ...(data.preferences as Record<string, any>) }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRestartMobileTour = () => {
    localStorage.removeItem('neuro-irb-prime-mobile-tour-completed');
    toast.success('Tour reiniciado! Recarregue a página para ver o tour novamente.');
  };

  const handleSaveSettings = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: currentUser.id,
          preferences: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleResetSettings = () => {
    setSettings({
      dyslexicFont: false,
      highContrast: false,
      reduceMotion: false,
      largeText: false,
      soundEffects: true,
      backgroundMusic: false,
      visualEffects: true,
      gameReminders: true,
      progressUpdates: true,
      achievementAlerts: true,
      dataCollection: true,
      shareProgress: false,
      analyticsOptIn: true,
      theme: 'auto',
      colorScheme: 'default'
    });
    toast.success('Configurações restauradas para o padrão');
  };

  return (
    <HapticProvider childProfileId={childProfileId}>
      <ModernPageLayout background="minimal">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Personalize sua experiência na plataforma</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Accessibility Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Accessibility className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Acessibilidade</CardTitle>
                  <CardDescription>Configurações para melhorar a usabilidade</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dyslexic-font">Fonte para Dislexia</Label>
                  <p className="text-sm text-muted-foreground">
                    Usa fonte especial para melhor legibilidade
                  </p>
                </div>
                <Switch
                  id="dyslexic-font"
                  checked={settings.dyslexicFont}
                  onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o contraste para melhor visibilidade
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-motion">Reduzir Movimento</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimiza animações e transições
                  </p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="large-text">Texto Grande</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o tamanho do texto em toda a interface
                  </p>
                </div>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting('largeText', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Accessibility Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Acessibilidade Avançada</CardTitle>
                  <CardDescription>Perfis clínicos e configurações detalhadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AdvancedAccessibilitySettings />
            </CardContent>
          </Card>

          {/* Audio & Visual */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Áudio e Visual</CardTitle>
                  <CardDescription>Configure efeitos sonoros e visuais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-effects">Efeitos Sonoros</Label>
                  <p className="text-sm text-muted-foreground">
                    Sons de interação e feedback durante os jogos
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="background-music">Música de Fundo</Label>
                  <p className="text-sm text-muted-foreground">
                    Música ambiente durante a navegação
                  </p>
                </div>
                <Switch
                  id="background-music"
                  checked={settings.backgroundMusic}
                  onCheckedChange={(checked) => updateSetting('backgroundMusic', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visual-effects">Efeitos Visuais</Label>
                  <p className="text-sm text-muted-foreground">
                    Animações e partículas nos jogos
                  </p>
                </div>
                <Switch
                  id="visual-effects"
                  checked={settings.visualEffects}
                  onCheckedChange={(checked) => updateSetting('visualEffects', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>Configure temas e esquemas de cores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Tema</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: 'light', label: 'Claro', icon: Sun },
                    { id: 'dark', label: 'Escuro', icon: Moon },
                    { id: 'auto', label: 'Automático', icon: Monitor }
                  ].map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={settings.theme === id ? 'default' : 'outline'}
                      className="flex flex-col gap-2 h-auto py-4"
                      onClick={() => updateSetting('theme', id)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Esquema de Cores Neurodiverso</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    { id: 'default', label: 'Padrão', color: 'bg-primary' },
                    { id: 'tdah', label: 'TDAH', color: 'bg-gradient-tdah' },
                    { id: 'tea', label: 'TEA', color: 'bg-gradient-tea' },
                    { id: 'dyslexia', label: 'Dislexia', color: 'bg-gradient-dyslexia' }
                  ].map(({ id, label, color }) => (
                    <Button
                      key={id}
                      variant={settings.colorScheme === id ? 'default' : 'outline'}
                      className="flex items-center gap-2 justify-start"
                      onClick={() => updateSetting('colorScheme', id)}
                    >
                      <div className={`w-4 h-4 rounded-full ${color}`} />
                      <span className="text-sm">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Configure alertas e lembretes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="game-reminders">Lembretes de Jogos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes para jogar regularmente
                  </p>
                </div>
                <Switch
                  id="game-reminders"
                  checked={settings.gameReminders}
                  onCheckedChange={(checked) => updateSetting('gameReminders', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="progress-updates">Atualizações de Progresso</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre seu desenvolvimento
                  </p>
                </div>
                <Switch
                  id="progress-updates"
                  checked={settings.progressUpdates}
                  onCheckedChange={(checked) => updateSetting('progressUpdates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="achievement-alerts">Alertas de Conquistas</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando conquistar novos marcos
                  </p>
                </div>
                <Switch
                  id="achievement-alerts"
                  checked={settings.achievementAlerts}
                  onCheckedChange={(checked) => updateSetting('achievementAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Haptic Feedback Settings */}
          <HapticSettings />

          {/* Tutorials and Help */}
          {isMobile && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Tutoriais e Ajuda</CardTitle>
                    <CardDescription>Aprenda a usar a plataforma</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tour Guiado Mobile</Label>
                    <p className="text-sm text-muted-foreground">
                      Reveja o tutorial interativo da interface mobile
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestartMobileTour}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Reiniciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleResetSettings}>
              Resetar Padrões
            </Button>
            <Button onClick={handleSaveSettings}>
              Salvar Configurações
            </Button>
          </div>
        </div>
        </div>
      </ModernPageLayout>
    </HapticProvider>
  );
}