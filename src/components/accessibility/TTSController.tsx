import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Settings2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TTSControllerProps {
  text?: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  compact?: boolean;
}

export function TTSController({ 
  text, 
  autoPlay = false, 
  onStart, 
  onEnd,
  compact = false 
}: TTSControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('tts_speech_rate');
    return saved ? parseFloat(saved) : 1;
  });
  const [pitch, setPitch] = useState(() => {
    const saved = localStorage.getItem('tts_pitch');
    return saved ? parseFloat(saved) : 1;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('tts_volume');
    return saved ? parseFloat(saved) : 1;
  });
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for Portuguese voices first, then other languages
      const ptVoices = availableVoices.filter(v => v.lang.startsWith('pt'));
      const otherVoices = availableVoices.filter(v => !v.lang.startsWith('pt'));
      setVoices([...ptVoices, ...otherVoices]);
      
      // Set default voice
      const savedVoice = localStorage.getItem('tts_voice');
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      } else if (ptVoices.length > 0) {
        setSelectedVoice(ptVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((textToSpeak: string) => {
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, selectedVoice, voices, onStart, onEnd]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else if (text) {
      speak(text);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRateChange = (value: number[]) => {
    setRate(value[0]);
    localStorage.setItem('tts_speech_rate', value[0].toString());
  };

  const handlePitchChange = (value: number[]) => {
    setPitch(value[0]);
    localStorage.setItem('tts_pitch', value[0].toString());
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    localStorage.setItem('tts_volume', value[0].toString());
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    localStorage.setItem('tts_voice', voiceName);
  };

  useEffect(() => {
    if (autoPlay && text) {
      speak(text);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [autoPlay, text, speak]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <>
            <Button variant="ghost" size="icon" onClick={handlePause} aria-label="Pausar">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleStop} aria-label="Parar">
              <Square className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={handlePlay} aria-label="Ouvir">
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <>
            <Button variant="outline" size="sm" onClick={handlePause} aria-label="Pausar leitura">
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
            <Button variant="outline" size="sm" onClick={handleStop} aria-label="Parar leitura">
              <Square className="h-4 w-4 mr-2" />
              Parar
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={handlePlay} aria-label="Iniciar leitura">
            <Play className="h-4 w-4 mr-2" />
            {isPaused ? 'Continuar' : 'Ouvir'}
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Configurações de leitura"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <Card className="w-72 shadow-lg">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Configurações de Leitura</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <Label className="text-xs">Voz</Label>
                  <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecionar voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name} className="text-xs">
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Velocidade</Label>
                    <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[rate]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={handleRateChange}
                  />
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Tom</Label>
                    <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[pitch]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={handlePitchChange}
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Volume</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for TTS
export function useTTS() {
  const rate = parseFloat(localStorage.getItem('tts_speech_rate') || '1');
  const pitch = parseFloat(localStorage.getItem('tts_pitch') || '1');
  const volume = parseFloat(localStorage.getItem('tts_volume') || '1');
  const voiceName = localStorage.getItem('tts_voice');

  const speak = useCallback((text: string) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }

    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, voiceName]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop, rate, pitch, volume };
}
