import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameSession } from '@/hooks/useGameSession';
import { toast } from 'sonner';

const GAME_ID = 'memory-sequence-builder';

const COLORS = [
  { id: 'red', name: 'Vermelho', class: 'bg-red-500', sound: 261.63 },
  { id: 'blue', name: 'Azul', class: 'bg-blue-500', sound: 293.66 },
  { id: 'green', name: 'Verde', class: 'bg-green-500', sound: 329.63 },
  { id: 'yellow', name: 'Amarelo', class: 'bg-yellow-500', sound: 349.23 },
  { id: 'purple', name: 'Roxo', class: 'bg-purple-500', sound: 392.00 },
  { id: 'orange', name: 'Laranja', class: 'bg-orange-500', sound: 440.00 },
];

type GamePhase = 'ready' | 'showing' | 'waiting' | 'checking' | 'complete';

export default function MemorySequenceBuilder() {
  const navigate = useNavigate();
  const [childProfileId] = useState<string>('test-child-id'); // TODO: Get from context
  
  const {
    sessionId,
    isActive,
    currentDifficulty,
    startSession,
    endSession,
    recordMetric,
  } = useGameSession(GAME_ID, childProfileId);

  const [gameStarted, setGameStarted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [sequence, setSequence] = useState<typeof COLORS>([]);
  const [userSequence, setUserSequence] = useState<typeof COLORS>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  
  const audioContext = useRef<AudioContext | null>(null);
  const sequenceStartTime = useRef<number>(0);

  // Configuração adaptativa
  const getGameConfig = useCallback(() => {
    const baseLength = 3 + Math.floor(currentDifficulty * 0.8);
    
    return {
      sequenceLength: Math.min(12, baseLength),
      showDuration: Math.max(600, 1000 - currentDifficulty * 40),
      interItemDelay: Math.max(300, 500 - currentDifficulty * 20),
      totalRounds: 8,
    };
  }, [currentDifficulty]);

  // Inicializar AudioContext
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  // Tocar som
  const playSound = useCallback((frequency: number, duration: number = 200) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration / 1000);

    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  }, []);

  // Iniciar jogo
  const handleStartGame = async () => {
    const sid = await startSession();
    if (sid) {
      setGameStarted(true);
      setRound(1);
      setScore(0);
      setLives(3);
      setTotalAttempts(0);
      setCorrectAttempts(0);
      startNewRound();
    }
  };

  // Gerar nova sequência
  const generateSequence = useCallback(() => {
    const config = getGameConfig();
    const newSequence: typeof COLORS = [];
    
    for (let i = 0; i < config.sequenceLength; i++) {
      newSequence.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    
    return newSequence;
  }, [getGameConfig]);

  // Mostrar sequência
  const showSequence = useCallback(async (seq: typeof COLORS) => {
    setPhase('showing');
    const config = getGameConfig();

    for (let i = 0; i < seq.length; i++) {
      const color = seq[i];
      setActiveColor(color.id);
      playSound(color.sound, config.showDuration);
      
      await new Promise(resolve => setTimeout(resolve, config.showDuration));
      setActiveColor(null);
      await new Promise(resolve => setTimeout(resolve, config.interItemDelay));
    }

    setPhase('waiting');
    sequenceStartTime.current = Date.now();
  }, [getGameConfig, playSound]);

  // Iniciar nova rodada
  const startNewRound = useCallback(async () => {
    setPhase('ready');
    setUserSequence([]);
    
    const newSeq = generateSequence();
    setSequence(newSeq);
    
    // Dar tempo para o jogador se preparar
    await new Promise(resolve => setTimeout(resolve, 1500));
    await showSequence(newSeq);
  }, [generateSequence, showSequence]);

  // Clique em cor
  const handleColorClick = useCallback((color: typeof COLORS[0]) => {
    if (phase !== 'waiting') return;

    playSound(color.sound, 150);
    setActiveColor(color.id);
    setTimeout(() => setActiveColor(null), 150);

    const newUserSeq = [...userSequence, color];
    setUserSequence(newUserSeq);

    const expectedColor = sequence[newUserSeq.length - 1];
    const reactionTime = Date.now() - sequenceStartTime.current;

    if (color.id !== expectedColor.id) {
      // Erro
      setPhase('checking');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          endGame();
        } else {
          setTimeout(() => startNewRound(), 2000);
        }
        return newLives;
      });

      recordMetric({
        event_type: 'incorrect',
        reaction_time_ms: reactionTime,
        event_data: { 
          expected: expectedColor.id, 
          got: color.id,
          position: newUserSeq.length,
          round 
        },
      });

      toast.error('❌ Sequência incorreta!');
      setTotalAttempts(prev => prev + 1);
      
    } else if (newUserSeq.length === sequence.length) {
      // Sequência completa e correta
      setPhase('checking');
      const points = sequence.length * 10 * currentDifficulty;
      setScore(prev => prev + points);
      setCorrectAttempts(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);

      recordMetric({
        event_type: 'correct',
        reaction_time_ms: reactionTime,
        event_data: { sequence_length: sequence.length, round },
      });

      toast.success(`🎯 Perfeito! +${points} pontos!`);

      const config = getGameConfig();
      if (round >= config.totalRounds) {
        setTimeout(() => endGame(), 2000);
      } else {
        setRound(prev => prev + 1);
        setTimeout(() => startNewRound(), 2000);
      }
    }
  }, [phase, userSequence, sequence, round, currentDifficulty, playSound, recordMetric, startNewRound, getGameConfig]);

  // Finalizar jogo
  const endGame = useCallback(async () => {
    if (!sessionId) return;

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const config = getGameConfig();
    const maxScore = config.totalRounds * config.sequenceLength * 10 * currentDifficulty;

    await endSession({
      score,
      max_possible_score: maxScore,
      accuracy_percentage: accuracy,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      incorrect_attempts: totalAttempts - correctAttempts,
      avg_reaction_time_ms: 0,
      session_data: {
        rounds_completed: round,
        final_lives: lives,
        max_sequence_length: getGameConfig().sequenceLength,
        difficulty: currentDifficulty,
      },
    });

    setGameStarted(false);
  }, [sessionId, score, totalAttempts, correctAttempts, round, lives, currentDifficulty, endSession, getGameConfig]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/games')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center space-y-6">
            <Brain className="w-20 h-20 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Sequência Mágica</h1>
            <p className="text-lg text-muted-foreground">
              Memorize e reproduza sequências cada vez maiores! Desenvolva memória de trabalho e atenção sequencial.
            </p>

            <div className="bg-muted/50 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold">Como Jogar:</h3>
              <ul className="text-left space-y-2">
                <li>• Observe atentamente a sequência de cores</li>
                <li>• Cada cor acende e toca um som diferente</li>
                <li>• Reproduza a sequência clicando nas cores na ordem correta</li>
                <li>• As sequências ficam maiores a cada nível</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Volume2 className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                🎧 Use fones de ouvido para melhor experiência
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {currentDifficulty}
                </div>
                <span>Nível Atual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  {getGameConfig().sequenceLength}
                </div>
                <span>Tamanho da Sequência</span>
              </div>
            </div>

            <Button size="lg" onClick={handleStartGame} className="w-full">
              Começar Jogo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const config = getGameConfig();
  const progress = (round / config.totalRounds) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Pontos</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rodada</p>
              <p className="text-2xl font-bold">{round}/{config.totalRounds}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequência</p>
              <p className="text-2xl font-bold">{sequence.length}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full",
                  i < lives ? "bg-red-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        <Progress value={progress} className="mt-2 h-2" />
      </div>

      {/* Status */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <Card className="p-4">
          {phase === 'ready' && <p className="text-lg font-semibold">Prepare-se...</p>}
          {phase === 'showing' && <p className="text-lg font-semibold text-primary">Observe a sequência! 👀</p>}
          {phase === 'waiting' && (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-green-600">Sua vez! Reproduza a sequência</p>
              <p className="text-sm text-muted-foreground">
                {userSequence.length} / {sequence.length}
              </p>
            </div>
          )}
          {phase === 'checking' && <p className="text-lg font-semibold">Verificando...</p>}
        </Card>
      </div>

      {/* Grade de cores */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color)}
              disabled={phase !== 'waiting'}
              className={cn(
                "aspect-square rounded-2xl transition-all shadow-lg",
                "hover:scale-105 active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-50",
                color.class,
                activeColor === color.id && "ring-8 ring-white scale-110 brightness-125"
              )}
            >
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
