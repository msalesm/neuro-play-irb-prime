import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Frown, Meh, Zap, Moon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EmotionalCheckInWidgetProps {
  childProfileId?: string;
  onCheckInComplete?: (mood: string) => void;
}

const moods = [
  { key: 'very_happy', label: 'Muito Feliz', icon: Smile, color: 'text-success', emoji: '😄', value: 5 },
  { key: 'happy', label: 'Feliz', icon: Smile, color: 'text-success/70', emoji: '😊', value: 4 },
  { key: 'neutral', label: 'Neutro', icon: Meh, color: 'text-muted-foreground', emoji: '😐', value: 3 },
  { key: 'sad', label: 'Triste', icon: Frown, color: 'text-warning', emoji: '😢', value: 2 },
  { key: 'anxious', label: 'Ansioso', icon: Zap, color: 'text-destructive', emoji: '😰', value: 1 },
  { key: 'tired', label: 'Cansado', icon: Moon, color: 'text-info', emoji: '😴', value: 2 },
];

export function EmotionalCheckInWidget({ childProfileId, onCheckInComplete }: EmotionalCheckInWidgetProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood || !user) return;
    setLoading(true);

    try {
      const mood = moods.find(m => m.key === selectedMood);
      await supabase.from('emotional_checkins').insert({
        user_id: user.id,
        child_profile_id: childProfileId || null,
        mood_rating: mood?.value || 3,
        scheduled_for: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        notes: `Check-in via chat: ${mood?.label}`,
      });

      setSubmitted(true);
      onCheckInComplete?.(selectedMood);
      toast.success('Check-in emocional registrado!');
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Erro ao salvar check-in');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="p-4 text-center">
          <Heart className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-sm font-medium">Check-in registrado!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Obrigado por compartilhar como está se sentindo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Heart className="h-4 w-4 text-destructive" />
          Como você está se sentindo?
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {moods.map((mood) => (
            <Button
              key={mood.key}
              variant={selectedMood === mood.key ? 'default' : 'outline'}
              size="sm"
              className="h-auto py-2 flex flex-col items-center gap-1"
              onClick={() => setSelectedMood(mood.key)}
            >
              <span className="text-lg">{mood.emoji}</span>
              <span className="text-[10px]">{mood.label}</span>
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={!selectedMood || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Salvando...' : 'Registrar'}
        </Button>
      </CardContent>
    </Card>
  );
}
