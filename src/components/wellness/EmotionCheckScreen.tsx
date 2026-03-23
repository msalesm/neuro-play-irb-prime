import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const emotions = [
  { key: 'happy', label: 'Feliz', emoji: '😊', color: 'hsl(var(--neuroplay-yellow))', rating: 5 },
  { key: 'calm', label: 'Calmo', emoji: '😌', color: 'hsl(var(--neuroplay-green))', rating: 4 },
  { key: 'frustrated', label: 'Frustrado', emoji: '😤', color: 'hsl(var(--neuroplay-orange))', rating: 2 },
  { key: 'sad', label: 'Triste', emoji: '😢', color: 'hsl(var(--neuroplay-blue))', rating: 1 },
  { key: 'anxious', label: 'Ansioso', emoji: '😰', color: 'hsl(var(--neuroplay-purple))', rating: 2 },
];

export function EmotionCheckScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);

    const emotion = emotions.find(e => e.key === selected);
    try {
      await supabase.from('emotional_checkins').insert({
        user_id: user.id,
        mood_rating: emotion?.rating ?? 3,
        emotions_detected: [selected],
        scheduled_for: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
      setSaved(true);
      toast.success('Emoção registrada! 💚');
      setTimeout(() => navigate(-1), 1200);
    } catch {
      toast.error('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Como você está?</h1>
      </div>

      {/* Emotion Wheel */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.div
              key="wheel"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-72 h-72"
            >
              {emotions.map((emo, i) => {
                const angle = (i / emotions.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isActive = selected === emo.key;

                return (
                  <motion.button
                    key={emo.key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200 }}
                    onClick={() => setSelected(emo.key)}
                    className="absolute flex flex-col items-center gap-1 transition-transform"
                    style={{
                      left: `calc(50% + ${x}px - 32px)`,
                      top: `calc(50% + ${y}px - 32px)`,
                    }}
                  >
                    <motion.div
                      animate={{ scale: isActive ? 1.25 : 1 }}
                      className={`h-16 w-16 rounded-full flex items-center justify-center text-3xl shadow-soft transition-all ${
                        isActive
                          ? 'ring-4 ring-primary/30 shadow-glow'
                          : 'bg-card border border-border'
                      }`}
                      style={isActive ? { backgroundColor: emo.color + '30' } : {}}
                    >
                      {emo.emoji}
                    </motion.div>
                    <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {emo.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground font-medium">
                  {selected ? emotions.find(e => e.key === selected)?.label : 'Toque para\nescolher'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-accent" />
              </div>
              <p className="text-lg font-bold text-foreground">Registrado!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save button */}
        {selected && !saved && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-8"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="rounded-full px-10 h-12 text-base font-semibold shadow-card"
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
