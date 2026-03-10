import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AttentionGameProps {
  onComplete: (metrics: { accuracy: number; avgReactionTime: number; events: any[] }) => void;
}

const TOTAL_ROUNDS = 10;
const SHOW_TIME = 800;
const PAUSE_TIME = 500;

export function AttentionGame({ onComplete }: AttentionGameProps) {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<string | null>(null);
  const [items, setItems] = useState<{ id: number; emoji: string; isTarget: boolean }[]>([]);
  const [phase, setPhase] = useState<'show-target' | 'find' | 'feedback'>('show-target');
  const [correct, setCorrect] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const startTime = useRef(0);

  const EMOJIS = ['🌟', '🔵', '🟢', '🔴', '🟡', '🟣', '🟠', '💜', '💚', '❤️'];

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      const avgRT = events.length > 0
        ? Math.round(events.reduce((s, e) => s + e.reaction_time_ms, 0) / events.length)
        : 0;
      onComplete({
        accuracy: Math.round((correct / TOTAL_ROUNDS) * 100),
        avgReactionTime: avgRT,
        events,
      });
      return;
    }

    const targetEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setTarget(targetEmoji);
    setPhase('show-target');

    setTimeout(() => {
      const gridItems = Array.from({ length: 9 }, (_, i) => {
        const isTarget = i === Math.floor(Math.random() * 9);
        return {
          id: i,
          emoji: isTarget ? targetEmoji : EMOJIS.filter(e => e !== targetEmoji)[Math.floor(Math.random() * (EMOJIS.length - 1))],
          isTarget,
        };
      });
      // Ensure at least one target
      if (!gridItems.some(g => g.isTarget)) {
        const idx = Math.floor(Math.random() * 9);
        gridItems[idx] = { id: idx, emoji: targetEmoji, isTarget: true };
      }
      setItems(gridItems);
      setPhase('find');
      startTime.current = Date.now();
    }, SHOW_TIME);
  }, [round, correct, events, onComplete]);

  useEffect(() => {
    nextRound();
  }, []);

  const handleTap = (item: { id: number; emoji: string; isTarget: boolean }) => {
    if (phase !== 'find') return;
    const rt = Date.now() - startTime.current;
    const isCorrect = item.isTarget;
    
    setEvents(prev => [...prev, {
      round: round + 1,
      reaction_time_ms: rt,
      is_correct: isCorrect,
      game_type: 'attention',
    }]);
    
    if (isCorrect) setCorrect(c => c + 1);
    setPhase('feedback');
    
    setTimeout(() => {
      setRound(r => r + 1);
      setTimeout(() => nextRound(), PAUSE_TIME);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs text-muted-foreground">Atenção</span>
        <span className="text-xs font-medium">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-chart-1 transition-all" style={{ width: `${((round) / TOTAL_ROUNDS) * 100}%` }} />
      </div>

      {phase === 'show-target' && target && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">Encontre este símbolo:</p>
          <span className="text-6xl">{target}</span>
        </div>
      )}

      {phase === 'find' && (
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleTap(item)}
              className="h-16 w-full rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center text-3xl transition-transform active:scale-95"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}

      {phase === 'feedback' && (
        <div className="text-center py-8 text-4xl">
          {items.find(i => i.isTarget)?.emoji === items.find(i => events[events.length - 1]?.is_correct)?.emoji ? '✅' : '❌'}
        </div>
      )}
    </div>
  );
}
