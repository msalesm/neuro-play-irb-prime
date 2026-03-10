import React, { useState, useEffect, useRef } from 'react';

interface ExecutiveFunctionGameProps {
  onComplete: (metrics: { accuracy: number; avgReactionTime: number; events: any[] }) => void;
}

const TOTAL_ROUNDS = 10;

// Simple Stroop-like: tap the COLOR of the word, not the text
const COLOR_MAP = [
  { name: 'AZUL', color: 'bg-blue-500' },
  { name: 'VERDE', color: 'bg-green-500' },
  { name: 'AMARELO', color: 'bg-yellow-500' },
  { name: 'ROSA', color: 'bg-pink-500' },
];

export function ExecutiveFunctionGame({ onComplete }: ExecutiveFunctionGameProps) {
  const [round, setRound] = useState(0);
  const [stimulus, setStimulus] = useState<{ text: string; actualColor: typeof COLOR_MAP[0] } | null>(null);
  const [options, setOptions] = useState<typeof COLOR_MAP>([]);
  const [correct, setCorrect] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [phase, setPhase] = useState<'playing' | 'feedback'>('playing');
  const startTime = useRef(0);

  const setupRound = () => {
    // Pick random text and random (different) color
    const textIdx = Math.floor(Math.random() * COLOR_MAP.length);
    let colorIdx = Math.floor(Math.random() * COLOR_MAP.length);
    // Make it incongruent 70% of the time
    if (Math.random() > 0.3) {
      while (colorIdx === textIdx) {
        colorIdx = Math.floor(Math.random() * COLOR_MAP.length);
      }
    }
    
    setStimulus({
      text: COLOR_MAP[textIdx].name,
      actualColor: COLOR_MAP[colorIdx],
    });
    
    // Shuffle options
    setOptions([...COLOR_MAP].sort(() => Math.random() - 0.5));
    setPhase('playing');
    startTime.current = Date.now();
  };

  useEffect(() => {
    setupRound();
  }, []);

  const handleSelect = (selected: typeof COLOR_MAP[0]) => {
    if (phase !== 'playing' || !stimulus) return;
    const rt = Date.now() - startTime.current;
    const isCorrect = selected.name === stimulus.actualColor.name;

    setEvents(prev => [...prev, {
      round: round + 1,
      reaction_time_ms: rt,
      is_correct: isCorrect,
      game_type: 'executive_function',
    }]);

    if (isCorrect) setCorrect(c => c + 1);
    setPhase('feedback');

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        const allEvents = [...events, { round: nextRound, reaction_time_ms: rt, is_correct: isCorrect, game_type: 'executive_function' }];
        onComplete({
          accuracy: Math.round(((correct + (isCorrect ? 1 : 0)) / TOTAL_ROUNDS) * 100),
          avgReactionTime: Math.round(allEvents.reduce((s, e) => s + e.reaction_time_ms, 0) / allEvents.length),
          events: allEvents,
        });
      } else {
        setRound(nextRound);
        setupRound();
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs text-muted-foreground">Função Executiva</span>
        <span className="text-xs font-medium">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-chart-4 transition-all" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
      </div>

      {stimulus && (
        <>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">Toque na COR da palavra, não no texto!</p>
            <span className={`text-3xl font-bold px-6 py-3 rounded-xl text-white ${stimulus.actualColor.color}`}>
              {stimulus.text}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={phase !== 'playing'}
                className={`py-4 rounded-xl text-white font-bold text-sm transition-all active:scale-95 ${opt.color} ${
                  phase === 'feedback' && opt.name === stimulus.actualColor.name
                    ? 'ring-4 ring-foreground/30 scale-105'
                    : ''
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
