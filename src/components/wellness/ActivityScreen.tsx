import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  title?: string;
  totalSeconds?: number;
  onComplete?: (points: number) => void;
}

export function ActivityScreen({ title = 'Treino de Atenção', totalSeconds = 180, onComplete }: Props) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const [points, setPoints] = useState(0);
  const [completed, setCompleted] = useState(false);

  const elapsed = totalSeconds - secondsLeft;
  const progress = (elapsed / totalSeconds) * 100;

  useEffect(() => {
    if (paused || completed) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCompleted(true);
          setPoints(p => p + 10);
          onComplete?.(points + 10);
          return 0;
        }
        return prev - 1;
      });
      // Award points periodically
      if (elapsed > 0 && elapsed % 30 === 0) {
        setPoints(p => p + 5);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [paused, completed, elapsed]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>

      {/* Main circular progress */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke={completed ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-foreground">{formatTime(secondsLeft)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {completed ? 'Concluído!' : 'restante'}
            </p>
          </div>
        </motion.div>

        {/* Points */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-8 bg-card rounded-full px-5 py-2.5 shadow-soft border border-border"
        >
          <Star className="h-5 w-5 text-[hsl(var(--neuroplay-yellow))]" />
          <span className="text-lg font-bold text-foreground">{points}</span>
          <span className="text-sm text-muted-foreground">pontos</span>
        </motion.div>

        {/* Controls */}
        {!completed && (
          <div className="flex items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPaused(!paused)}
              className="rounded-full h-14 w-14 p-0 shadow-soft"
            >
              {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
          </div>
        )}

        {completed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8"
          >
            <Button
              size="lg"
              onClick={() => navigate(-1)}
              className="rounded-full px-10 h-12 text-base font-semibold"
            >
              Voltar ao Início
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
