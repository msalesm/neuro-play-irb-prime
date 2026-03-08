import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { 
  Volume2, 
  VolumeX, 
  Star, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Award,
  Lightbulb,
  Clock,
  MessageSquare
} from 'lucide-react';

/**
 * Demo component showcasing the Unified Audio Engine capabilities
 */
export const AudioEngineDemo: React.FC = () => {
  const audio = useAudioEngine();
  const [volume, setVolume] = useState(50);
  const [isEnabled, setIsEnabled] = useState(true);
  const [ttsText, setTtsText] = useState('Bem-vindo ao NeuroPlay! Este é um teste do sistema de áudio.');

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audio.setVolume(newVolume / 100);
  };

  const handleEnabledChange = (checked: boolean) => {
    setIsEnabled(checked);
    audio.setEnabled(checked);
  };

  const handleSpeak = async () => {
    await audio.speak(ttsText, {
      rate: 1.0,
      pitch: 1.0,
      lang: 'pt-BR'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Volume2 className="w-8 h-8 text-purple-600" />
            Audio Engine Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Sistema unificado de áudio profissional para todos os jogos do NeuroPlay
          </p>

          {/* Controls */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-enabled" className="text-base">
                Áudio Habilitado
              </Label>
              <Switch
                id="audio-enabled"
                checked={isEnabled}
                onCheckedChange={handleEnabledChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume" className="text-base flex items-center gap-2">
                {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Volume: {volume}%
              </Label>
              <Slider
                id="volume"
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                disabled={!isEnabled}
                className="w-full"
              />
            </div>
          </div>

          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feedback">Feedback Sounds</TabsTrigger>
              <TabsTrigger value="game">Game Sounds</TabsTrigger>
              <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
            </TabsList>

            {/* Feedback Sounds Tab */}
            <TabsContent value="feedback" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => audio.playSuccess('low')}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Success (Low)
                </Button>
                <Button
                  onClick={() => audio.playSuccess('medium')}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Success (Medium)
                </Button>
                <Button
                  onClick={() => audio.playSuccess('high')}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-700" />
                  Success (High)
                </Button>
                <Button
                  onClick={() => audio.playError('soft')}
                  variant="outline"
                  className="gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Error (Soft)
                </Button>
                <Button
                  onClick={() => audio.playError('harsh')}
                  variant="outline"
                  className="gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Error (Harsh)
                </Button>
                <Button
                  onClick={() => audio.playWarning()}
                  variant="outline"
                  className="gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Warning
                </Button>
              </div>
            </TabsContent>

            {/* Game Sounds Tab */}
            <TabsContent value="game" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => audio.playLevelUp()}
                  variant="outline"
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Level Up
                </Button>
                <Button
                  onClick={() => audio.playAchievement()}
                  variant="outline"
                  className="gap-2"
                >
                  <Award className="w-4 h-4 text-purple-600" />
                  Achievement
                </Button>
                <Button
                  onClick={() => audio.playHint()}
                  variant="outline"
                  className="gap-2"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Hint
                </Button>
                <Button
                  onClick={() => audio.playTick()}
                  variant="outline"
                  className="gap-2"
                >
                  <Clock className="w-4 h-4 text-gray-600" />
                  Tick
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Audio Effects</h3>
                <div className="flex gap-3">
                  <Button
                    onClick={() => audio.fadeOut(2000)}
                    variant="secondary"
                    size="sm"
                  >
                    Fade Out (2s)
                  </Button>
                  <Button
                    onClick={() => audio.fadeIn(2000)}
                    variant="secondary"
                    size="sm"
                  >
                    Fade In (2s)
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TTS Tab */}
            <TabsContent value="tts" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label htmlFor="tts-text">Texto para Falar</Label>
                <textarea
                  id="tts-text"
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-[100px] resize-y"
                  placeholder="Digite o texto aqui..."
                />
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleSpeak}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Falar
                  </Button>
                  <Button
                    onClick={() => audio.stopSpeaking()}
                    variant="outline"
                  >
                    Parar
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Exemplos de Uso</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <button
                      onClick={() => setTtsText('Parabéns! Você completou o nível!')}
                      className="block hover:underline text-left"
                    >
                      • "Parabéns! Você completou o nível!"
                    </button>
                    <button
                      onClick={() => setTtsText('Atenção! Foco nas instruções.')}
                      className="block hover:underline text-left"
                    >
                      • "Atenção! Foco nas instruções."
                    </button>
                    <button
                      onClick={() => setTtsText('Tente novamente. Você consegue!')}
                      className="block hover:underline text-left"
                    >
                      • "Tente novamente. Você consegue!"
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-100 to-blue-100">
          <h2 className="text-xl font-bold mb-3">🎮 Como Usar nos Jogos</h2>
          <div className="space-y-2 text-sm">
            <code className="block bg-white p-2 rounded">
              const audio = useAudioEngine();
            </code>
            <code className="block bg-white p-2 rounded">
              await audio.playSuccess('high'); // Acerto
            </code>
            <code className="block bg-white p-2 rounded">
              await audio.playError('soft'); // Erro leve
            </code>
            <code className="block bg-white p-2 rounded">
              await audio.playLevelUp(); // Subir de nível
            </code>
            <code className="block bg-white p-2 rounded">
              await audio.speak('Parabéns!'); // Falar texto
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
};
