import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameState {
  state: 'MENU' | 'PRESENTING' | 'RECALL' | 'ROUND_COMPLETE' | 'GAME_OVER';
  score: number;
  round: number;
  sequence: number[];
  playerSequence: number[];
  isShowingSequence: boolean;
  currentSequenceIndex: number;
}

interface CosmicSequenceGameProps {
  onGameStart?: () => void;
  onGameEnd?: (score: number, round: number) => void;
  onCorrectTap?: () => void;
  onWrongTap?: () => void;
}

const gameObjects = [
  { 
    id: 0, 
    color: 'from-green-400 to-emerald-600', 
    glowColor: 'rgba(34, 197, 94, 0.6)',
    frequency: 329.63 // E4
  },
  { 
    id: 1, 
    color: 'from-purple-400 to-fuchsia-600', 
    glowColor: 'rgba(192, 38, 211, 0.6)',
    frequency: 392.00 // G4
  },
  { 
    id: 2, 
    color: 'from-orange-400 to-amber-600', 
    glowColor: 'rgba(251, 146, 60, 0.6)',
    frequency: 523.25 // C5
  },
];

// Audio context for sound generation
let audioContext: AudioContext | null = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number = 0.3) => {
  const ctx = initAudio();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const CosmicSequenceGame = ({ 
  onGameStart, 
  onGameEnd, 
  onCorrectTap, 
  onWrongTap 
}: CosmicSequenceGameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    state: 'MENU',
    score: 0,
    round: 1,
    sequence: [],
    playerSequence: [],
    isShowingSequence: false,
    currentSequenceIndex: 0,
  });

  const [activeObject, setActiveObject] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSequenceLength = useCallback((round: number) => {
    return Math.min(2 + Math.floor(round * 1.2), 8);
  }, []);

  const getAnimationSpeed = useCallback((round: number) => {
    const baseSpeed = 1000;
    const roundSpeedBonus = Math.min(round * 40, 250);
    return Math.max(baseSpeed - roundSpeedBonus, 600);
  }, []);

  const getSequenceDelay = useCallback((round: number) => {
    const baseDelay = 800;
    const roundDelayReduction = Math.min(round * 35, 250);
    return Math.max(baseDelay - roundDelayReduction, 400);
  }, []);

  const generateSequence = useCallback((round: number) => {
    const sequenceLength = getSequenceLength(round);
    const newSequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(Math.floor(Math.random() * gameObjects.length));
    }
    return newSequence;
  }, [getSequenceLength]);

  const startGame = useCallback(() => {
    const newSequence = generateSequence(1);
    setGameState({
      state: 'PRESENTING',
      score: 0,
      round: 1,
      sequence: newSequence,
      playerSequence: [],
      isShowingSequence: true,
      currentSequenceIndex: 0,
    });
    setStatusMessage('Watch the sequence!');
    onGameStart?.();
  }, [generateSequence, onGameStart]);

  const showSequence = useCallback((sequence: number[], round: number) => {
    let index = 0;
    const speed = getAnimationSpeed(round);
    const delay = getSequenceDelay(round);

    const showNext = () => {
      if (index < sequence.length) {
        const objectId = sequence[index];
        setActiveObject(objectId);
        
        // Play sound for this object
        const obj = gameObjects.find(o => o.id === objectId);
        if (obj) {
          playTone(obj.frequency, speed / 1000);
        }
        
        setTimeout(() => {
          setActiveObject(null);
          index++;
          if (index < sequence.length) {
            sequenceTimeoutRef.current = setTimeout(showNext, delay);
          } else {
            sequenceTimeoutRef.current = setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                state: 'RECALL',
                isShowingSequence: false,
              }));
              setStatusMessage(`Round ${round} - Repeat the sequence!`);
            }, delay);
          }
        }, speed);
      }
    };

    showNext();
  }, [getAnimationSpeed, getSequenceDelay]);

  useEffect(() => {
    if (gameState.state === 'PRESENTING' && gameState.isShowingSequence) {
      showSequence(gameState.sequence, gameState.round);
    }

    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [gameState.state, gameState.isShowingSequence, gameState.sequence, gameState.round, showSequence]);

  const handleObjectClick = useCallback((objectId: number) => {
    if (gameState.state !== 'RECALL') return;

    const expectedId = gameState.sequence[gameState.playerSequence.length];

    if (objectId === expectedId) {
      onCorrectTap?.();
      
      // Play sound for correct tap
      const obj = gameObjects.find(o => o.id === objectId);
      if (obj) {
        playTone(obj.frequency, 0.2);
      }
      
      setActiveObject(objectId);
      setTimeout(() => setActiveObject(null), 300);

      const newPlayerSequence = [...gameState.playerSequence, objectId];
      const newScore = gameState.score + 10;

      if (newPlayerSequence.length >= gameState.sequence.length) {
        // Round complete
        const roundBonus = 50;
        const finalScore = newScore + roundBonus;
        
        setGameState(prev => ({
          ...prev,
          state: 'ROUND_COMPLETE',
          score: finalScore,
          playerSequence: newPlayerSequence,
        }));
        setStatusMessage(`Round ${gameState.round} Complete! +${roundBonus} bonus`);

        setTimeout(() => {
          const nextRound = gameState.round + 1;
          const newSequence = generateSequence(nextRound);
          setGameState({
            state: 'PRESENTING',
            score: finalScore,
            round: nextRound,
            sequence: newSequence,
            playerSequence: [],
            isShowingSequence: true,
            currentSequenceIndex: 0,
          });
          setStatusMessage('Watch the sequence!');
        }, 1500);
      } else {
        setGameState(prev => ({
          ...prev,
          score: newScore,
          playerSequence: newPlayerSequence,
        }));
        setStatusMessage(`Correct! ${gameState.sequence.length - newPlayerSequence.length} more to go`);
      }
    } else {
      onWrongTap?.();
      setGameState(prev => ({
        ...prev,
        state: 'GAME_OVER',
      }));
      setStatusMessage('');
      onGameEnd?.(gameState.score, gameState.round);
    }
  }, [gameState, onCorrectTap, onWrongTap, onGameEnd, generateSequence]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  if (gameState.state === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Sequência Cósmica
            </h1>
            <Sparkles className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Observe a sequência de luzes e repita na ordem correta!
          </p>
        </motion.div>

        <Button
          onClick={startGame}
          size="lg"
          className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700"
        >
          <Zap className="w-6 h-6 mr-2" />
          Começar
        </Button>
      </div>
    );
  }

  if (gameState.state === 'GAME_OVER') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <Trophy className="w-24 h-24 mx-auto text-yellow-400" />
          <h2 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Game Over!
          </h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">
              Pontuação Final: <span className="text-cyan-400">{gameState.score}</span>
            </p>
            <p className="text-xl text-muted-foreground">
              Rodada Alcançada: <span className="text-yellow-400">{gameState.round}</span>
            </p>
          </div>
        </motion.div>

        <Button
          onClick={restartGame}
          size="lg"
          className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
      {/* Score Panel */}
      <div className="flex gap-6 items-center bg-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-8 py-4">
        <div className="text-center">
          <p className="text-sm text-cyan-400 font-semibold">PONTUAÇÃO</p>
          <p className="text-3xl font-bold text-white">{gameState.score}</p>
        </div>
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
        <div className="text-center">
          <p className="text-sm text-yellow-400 font-semibold">RODADA</p>
          <p className="text-3xl font-bold text-white">{gameState.round}</p>
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence mode="wait">
        {statusMessage && (
          <motion.div
            key={statusMessage}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Objects */}
      <div className="flex gap-8 md:gap-12 items-center justify-center">
        {gameObjects.map((obj) => (
          <motion.button
            key={obj.id}
            onClick={() => handleObjectClick(obj.id)}
            disabled={gameState.state !== 'RECALL'}
            className={`
              w-28 h-28 md:w-36 md:h-36 rounded-2xl
              bg-gradient-to-br ${obj.color}
              transition-all duration-200
              ${gameState.state === 'RECALL' ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
              ${activeObject === obj.id ? 'scale-125 shadow-2xl' : 'scale-100 opacity-70'}
              disabled:opacity-50
            `}
            style={{
              boxShadow: activeObject === obj.id
                ? `0 0 60px ${obj.glowColor}, 0 0 30px ${obj.glowColor}`
                : 'none',
            }}
            whileTap={{ scale: gameState.state === 'RECALL' ? 1.1 : 1 }}
            animate={{
              opacity: activeObject === obj.id ? 1 : (gameState.state === 'RECALL' ? 0.8 : 0.6),
              scale: activeObject === obj.id ? 1.25 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Sequence Progress Indicator */}
      {gameState.state === 'RECALL' && (
        <div className="flex gap-2 items-center">
          {gameState.sequence.map((_, idx) => (
            <div
              key={idx}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${idx < gameState.playerSequence.length 
                  ? 'bg-green-400 scale-125' 
                  : 'bg-gray-600 scale-100'
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};
