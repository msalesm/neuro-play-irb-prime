import React, { useState, useEffect, useRef } from 'react';

interface LanguageGameProps {
  onComplete: (metrics: { accuracy: number; avgReactionTime: number; events: any[] }) => void;
}

const WORD_PAIRS = [
  { word: 'GATO', rhymes: ['PATO', 'RATO'], notRhymes: ['MESA', 'LIVRO'] },
  { word: 'BOLA', rhymes: ['MOLA', 'COLA'], notRhymes: ['CASA', 'FOGO'] },
  { word: 'PÃO', rhymes: ['MÃO', 'CHÃO'], notRhymes: ['LUZ', 'FLOR'] },
  { word: 'REI', rhymes: ['LEI', 'MEI'], notRhymes: ['SOL', 'MAR'] },
  { word: 'FADA', rhymes: ['NADA', 'CADA'], notRhymes: ['RIO', 'CÉU'] },
  { word: 'LOBO', rhymes: ['BOBO', 'ROLO'], notRhymes: ['LAGO', 'PENA'] },
  { word: 'LUA', rhymes: ['RUA', 'TUA'], notRhymes: ['PIPA', 'DADO'] },
  { word: 'COR', rhymes: ['FLOR', 'DOR'], notRhymes: ['TREM', 'VELA'] },
  { word: 'VEZ', rhymes: ['PEZ', 'DEZ'], notRhymes: ['ARCO', 'LAGO'] },
  { word: 'SOM', rhymes: ['BOM', 'TOM'], notRhymes: ['NAVE', 'PELE'] },
];

const TOTAL_ROUNDS = 10;

export function LanguageGame({ onComplete }: LanguageGameProps) {
  const [round, setRound] = useState(0);
  const [currentPair, setCurrentPair] = useState<typeof WORD_PAIRS[0] | null>(null);
  const [options, setOptions] = useState<{ word: string; isCorrect: boolean }[]>([]);
  const [correct, setCorrect] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [phase, setPhase] = useState<'playing' | 'feedback'>('playing');
  const startTime = useRef(0);

  const setupRound = (roundIdx: number) => {
    const pair = WORD_PAIRS[roundIdx % WORD_PAIRS.length];
    setCurrentPair(pair);
    
    const correctWord = pair.rhymes[Math.floor(Math.random() * pair.rhymes.length)];
    const wrongWord = pair.notRhymes[Math.floor(Math.random() * pair.notRhymes.length)];
    
    const opts = [
      { word: correctWord, isCorrect: true },
      { word: wrongWord, isCorrect: false },
    ].sort(() => Math.random() - 0.5);
    
    setOptions(opts);
    setPhase('playing');
    startTime.current = Date.now();
  };

  useEffect(() => {
    setupRound(0);
  }, []);

  const handleSelect = (option: { word: string; isCorrect: boolean }) => {
    if (phase !== 'playing') return;
    const rt = Date.now() - startTime.current;
    
    setEvents(prev => [...prev, {
      round: round + 1,
      reaction_time_ms: rt,
      is_correct: option.isCorrect,
      game_type: 'language',
    }]);

    if (option.isCorrect) setCorrect(c => c + 1);
    setPhase('feedback');

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        const allEvents = [...events, { round: nextRound, reaction_time_ms: rt, is_correct: option.isCorrect, game_type: 'language' }];
        onComplete({
          accuracy: Math.round(((correct + (option.isCorrect ? 1 : 0)) / TOTAL_ROUNDS) * 100),
          avgReactionTime: Math.round(allEvents.reduce((s, e) => s + e.reaction_time_ms, 0) / allEvents.length),
          events: allEvents,
        });
      } else {
        setRound(nextRound);
        setupRound(nextRound);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs text-muted-foreground">Linguagem</span>
        <span className="text-xs font-medium">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-chart-3 transition-all" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
      </div>

      {currentPair && (
        <>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Qual palavra rima com:</p>
            <span className="text-3xl font-bold text-primary">{currentPair.word}</span>
          </div>

          <div className="flex gap-4 w-full max-w-[280px]">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={phase !== 'playing'}
                className={`flex-1 py-6 px-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${
                  phase === 'feedback' && opt.isCorrect
                    ? 'bg-chart-3 text-primary-foreground'
                    : phase === 'feedback' && !opt.isCorrect
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                {opt.word}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
