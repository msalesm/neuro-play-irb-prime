import React, { useState, useEffect, useRef } from 'react';

interface MemoryGameProps {
  onComplete: (metrics: { accuracy: number; avgReactionTime: number; events: any[] }) => void;
}

const TOTAL_ROUNDS = 8;

export function MemoryGame({ onComplete }: MemoryGameProps) {
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const startTime = useRef(0);

  const COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-primary', 'bg-secondary', 'bg-destructive', 'bg-accent', 'bg-muted-foreground'];

  const startRound = () => {
    const seqLength = Math.min(3 + Math.floor(round / 2), 7);
    const newSeq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
    setPlayerSequence([]);
    setPhase('showing');
    
    // Show sequence one by one
    let i = 0;
    const showNext = () => {
      if (i < newSeq.length) {
        setActiveCell(newSeq[i]);
        setTimeout(() => {
          setActiveCell(null);
          i++;
          setTimeout(showNext, 200);
        }, 500);
      } else {
        setPhase('input');
        startTime.current = Date.now();
      }
    };
    setTimeout(showNext, 500);
  };

  useEffect(() => {
    startRound();
  }, []);

  const handleTap = (cellIdx: number) => {
    if (phase !== 'input') return;
    const rt = Date.now() - startTime.current;
    const newPlayerSeq = [...playerSequence, cellIdx];
    setPlayerSequence(newPlayerSeq);
    setActiveCell(cellIdx);
    setTimeout(() => setActiveCell(null), 150);

    const expectedIdx = newPlayerSeq.length - 1;
    const isCorrectSoFar = sequence[expectedIdx] === cellIdx;

    if (!isCorrectSoFar || newPlayerSeq.length === sequence.length) {
      const isFullyCorrect = isCorrectSoFar && newPlayerSeq.length === sequence.length;
      
      setEvents(prev => [...prev, {
        round: round + 1,
        reaction_time_ms: rt,
        is_correct: isFullyCorrect,
        sequence_length: sequence.length,
        game_type: 'memory',
      }]);

      if (isFullyCorrect) setCorrect(c => c + 1);
      setPhase('feedback');

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          const avgRT = events.length > 0
            ? Math.round(events.reduce((s, e) => s + e.reaction_time_ms, 0) / (events.length + 1))
            : rt;
          onComplete({
            accuracy: Math.round(((correct + (isFullyCorrect ? 1 : 0)) / TOTAL_ROUNDS) * 100),
            avgReactionTime: avgRT,
            events: [...events, { round: nextRound, reaction_time_ms: rt, is_correct: isFullyCorrect, game_type: 'memory' }],
          });
        } else {
          setRound(nextRound);
          setTimeout(() => startRound(), 300);
        }
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-xs text-muted-foreground">Memória</span>
        <span className="text-xs font-medium">{round + 1}/{TOTAL_ROUNDS}</span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-chart-2 transition-all" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {phase === 'showing' ? 'Observe a sequência...' : phase === 'input' ? 'Repita a sequência!' : ''}
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            disabled={phase !== 'input'}
            className={`h-16 w-full rounded-xl transition-all duration-150 ${
              activeCell === i
                ? `${COLORS[i % COLORS.length]} scale-110`
                : 'bg-muted hover:bg-muted/70'
            }`}
          />
        ))}
      </div>

      {phase === 'feedback' && (
        <div className="text-3xl">
          {events[events.length - 1]?.is_correct ? '✅' : '❌'}
        </div>
      )}
    </div>
  );
}
