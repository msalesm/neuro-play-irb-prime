import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Vibrate, VolumeX, Volume1, Volume2, Smartphone, AlertCircle } from 'lucide-react';
import { useHaptic } from '@/contexts/HapticContext';
import type { HapticIntensity } from '@/lib/haptics';

export function HapticSettings() {
  const { intensity, setIntensity, isSupported, isNative, hapticFeedback } = useHaptic();

  const handleIntensityChange = async (value: string) => {
    await setIntensity(value as HapticIntensity);
  };

  const testVibration = () => {
    hapticFeedback('tap');
  };

  if (!isSupported) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            Feedback Háptico
          </CardTitle>
          <CardDescription>
            {isIOS 
              ? 'iPhone/iPad não suporta vibração em apps web'
              : 'Vibração não suportada neste dispositivo'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIOS ? (
            <>
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                    Limitação do iPhone/iPad
                  </p>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    A Apple não permite vibração em aplicativos web abertos no Safari. 
                    Esta é uma restrição de segurança do iOS.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  💡 Quer ter vibração no iPhone?
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Para ter feedback háptico funcionando no iPhone, é necessário transformar 
                  o Neuro IRB Prime em um aplicativo nativo (disponível na App Store). 
                  Entre em contato com o suporte para saber mais.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Seu navegador ou dispositivo não suporta a API de vibração. 
                  Para usar feedback háptico, acesse a plataforma através de um dispositivo móvel Android.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vibrate className="w-5 h-5" />
          Feedback Háptico
        </CardTitle>
        <CardDescription>
          Configure a intensidade da vibração durante os jogos e interações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={intensity} onValueChange={handleIntensityChange}>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="off" id="off" />
            <Label htmlFor="off" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Desligado</p>
                  <p className="text-sm text-muted-foreground">Sem vibração</p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Volume1 className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-medium">Leve</p>
                  <p className="text-sm text-muted-foreground">Vibrações suaves e curtas</p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="font-medium">Média</p>
                  <p className="text-sm text-muted-foreground">Feedback balanceado (recomendado)</p>
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="strong" id="strong" />
            <Label htmlFor="strong" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="font-medium">Forte</p>
                  <p className="text-sm text-muted-foreground">Vibrações intensas e longas</p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="pt-4 border-t">
          <Button 
            onClick={testVibration} 
            variant="outline" 
            className="w-full"
            disabled={intensity === 'off'}
          >
            <Vibrate className="w-4 h-4 mr-2" />
            Testar Vibração
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Dica:</strong> O feedback háptico ajuda a reforçar o aprendizado através do tato, 
            especialmente útil para crianças com TDAH e TEA que se beneficiam de estímulos multissensoriais.
          </p>
        </div>

        {isNative && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
            <p className="text-sm text-green-900 dark:text-green-200">
              ✓ <strong>App Nativo Detectado:</strong> Usando feedback háptico nativo do sistema operacional 
              para melhor desempenho e precisão.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
