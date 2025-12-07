import { useState, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

export function TTSButton({ text, className, size = 'icon', variant = 'outline' }: TTSButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { profile } = useAccessibility();

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.85; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  }, [text, isSpeaking]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSpeak}
      title={isSpeaking ? 'Parar leitura' : 'Ouvir texto'}
      className={className}
      style={{ 
        minHeight: `${profile.touchTargetSizePx}px`,
        minWidth: size === 'icon' ? `${profile.touchTargetSizePx}px` : undefined,
      }}
    >
      {isSpeaking ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
