import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw, Target, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { GameCompatibilityCheck } from '@/components/games';

/**
 * BATERIA MÍNIMA - DOMÍNIO 1: Atenção Sustentada (CPT-like)
 * 
 * Paradigma: Continuous Performance Test
 * - 80% estímulos neutros (não-alvo)
 * - 20% estímulos alvo (raro)
 * - Duração mínima: 3 minutos (180s)
 * - Métricas: omissão, comissão, variabilidade RT, curva por bloco
 */

const TOTAL_DURATION = 180; // 3 minutes
const STIMULUS_INTERVAL = 1500; // ms between stimuli
const STIMULUS_DISPLAY = 800; // ms stimulus visible
const TARGET_RATIO = 0.20; // 20% targets
const BLOCK_SIZE = 20; // stimuli per block

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'P', 'R', 'S', 'T'];
const TARGET_LETTER = 'X'; // The rare target

interface TrialResult {
  stimulusType: 'target' | 'non-target';
  response: 'hit' | 'miss' | 'false-alarm' | 'correct-rejection';
  reactionTime: number | null;
  block: number;
  trialNumber: number;
}

export default function AttentionSustainedPlay() {
  const navigate = useNavigate();
  const { childProfileId, isTestMode } = useGameProfile();
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);

  const [currentStimulus, setCurrentStimulus] = useState<string | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [canRespond, setCanRespond] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState<string | null>(null);

  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [trialCount, setTrialCount] = useState(0);

  const stimulusTimeRef = useRef(0);
  const isTargetRef = useRef(false);
  const respondedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const stimulusRef = useRef<ReturnType<typeof setInterval>>();

  const { startSession, endSession } = useGameSession(
    'attention-sustained',
    childProfileId || undefined
  );

  // === STIMULUS GENERATION ===
  const generateStimulus = useCallback(() => {
    const isTarget = Math.random() < TARGET_RATIO;
    isTargetRef.current = isTarget;
    respondedRef.current = false;
    stimulusTimeRef.current = Date.now();

    const letter = isTarget
      ? TARGET_LETTER
      : LETTERS[Math.floor(Math.random() * LETTERS.length)];

    setCurrentStimulus(letter);
    setShowStimulus(true);
    setCanRespond(true);
    setFeedbackColor(null);

    // Hide stimulus after display time
    setTimeout(() => {
      setShowStimulus(false);

      // After stimulus disappears, check if they missed a target
      setTimeout(() => {
        if (!respondedRef.current) {
          const block = Math.floor(trialCount / BLOCK_SIZE);
          const result: TrialResult = {
            stimulusType: isTargetRef.current ? 'target' : 'non-target',
            response: isTargetRef.current ? 'miss' : 'correct-rejection',
            reactionTime: null,
            block,
            trialNumber: trialCount,
          };
          setTrials(prev => [...prev, result]);
        }
        setCanRespond(false);
        setTrialCount(prev => prev + 1);
      }, STIMULUS_INTERVAL - STIMULUS_DISPLAY - 100);
    }, STIMULUS_DISPLAY);
  }, [trialCount]);

  // === RESPONSE HANDLER ===
  const handleResponse = useCallback(() => {
    if (!canRespond || respondedRef.current) return;
    respondedRef.current = true;

    const rt = Date.now() - stimulusTimeRef.current;
    const isTarget = isTargetRef.current;
    const block = Math.floor(trialCount / BLOCK_SIZE);

    const result: TrialResult = {
      stimulusType: isTarget ? 'target' : 'non-target',
      response: isTarget ? 'hit' : 'false-alarm',
      reactionTime: rt,
      block,
      trialNumber: trialCount,
    };

    setTrials(prev => [...prev, result]);
    setFeedbackColor(isTarget ? 'bg-success' : 'bg-destructive');

    setTimeout(() => setFeedbackColor(null), 300);
  }, [canRespond, trialCount]);

  // Keyboard listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleResponse();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleResponse]);

  // === GAME TIMER ===
  useEffect(() => {
    if (!isPlaying || isPaused || gameComplete) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameComplete(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, isPaused, gameComplete]);

  // === STIMULUS LOOP ===
  useEffect(() => {
    if (!isPlaying || isPaused || gameComplete) return;

    generateStimulus();
    stimulusRef.current = setInterval(generateStimulus, STIMULUS_INTERVAL);

    return () => clearInterval(stimulusRef.current);
  }, [isPlaying, isPaused, gameComplete, generateStimulus]);

  // === METRICS CALCULATION ===
  const calculateMetrics = () => {
    const hits = trials.filter(t => t.response === 'hit');
    const misses = trials.filter(t => t.response === 'miss');
    const falseAlarms = trials.filter(t => t.response === 'false-alarm');
    const correctRejections = trials.filter(t => t.response === 'correct-rejection');
    const targets = trials.filter(t => t.stimulusType === 'target');
    const nonTargets = trials.filter(t => t.stimulusType === 'non-target');

    const omissionRate = targets.length > 0 ? misses.length / targets.length : 0;
    const commissionRate = nonTargets.length > 0 ? falseAlarms.length / nonTargets.length : 0;

    const rts = hits.map(t => t.reactionTime!).filter(Boolean);
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const rtVariability = rts.length > 1
      ? Math.sqrt(rts.reduce((sum, rt) => sum + Math.pow(rt - meanRT, 2), 0) / rts.length)
      : 0;

    // Block-by-block performance
    const blocks = new Map<number, { hits: number; total: number }>();
    trials.forEach(t => {
      if (!blocks.has(t.block)) blocks.set(t.block, { hits: 0, total: 0 });
      const b = blocks.get(t.block)!;
      b.total++;
      if (t.response === 'hit' || t.response === 'correct-rejection') b.hits++;
    });
    const blockPerformance = Array.from(blocks.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v.total > 0 ? Math.round((v.hits / v.total) * 100) : 0);

    const accuracy = trials.length > 0
      ? (hits.length + correctRejections.length) / trials.length
      : 0;

    return {
      omissionErrors: misses.length,
      commissionErrors: falseAlarms.length,
      omissionRate: Math.round(omissionRate * 100),
      commissionRate: Math.round(commissionRate * 100),
      meanRT: Math.round(meanRT),
      rtVariability: Math.round(rtVariability),
      accuracy: Math.round(accuracy * 100),
      blockPerformance,
      totalTrials: trials.length,
      totalTargets: targets.length,
      totalNonTargets: nonTargets.length,
      hits: hits.length,
    };
  };

  // === START / END ===
  const startGame = async () => {
    setIsPlaying(true);
    setIsPaused(false);
    setGameComplete(false);
    setTimeLeft(TOTAL_DURATION);
    setTrials([]);
    setTrialCount(0);
    setCurrentStimulus(null);
    setFeedbackColor(null);

    if (!isTestMode) {
      await startSession({ difficulty_level: 1 });
    }
  };

  useEffect(() => {
    if (!gameComplete) return;

    const metrics = calculateMetrics();

    if (!isTestMode) {
      endSession({
        score: metrics.accuracy,
        accuracy_percentage: metrics.accuracy,
        correct_attempts: metrics.hits,
        incorrect_attempts: metrics.omissionErrors + metrics.commissionErrors,
        avg_reaction_time_ms: metrics.meanRT,
        session_data: {
          gameId: 'attention-sustained',
          omissionErrors: metrics.omissionErrors,
          commissionErrors: metrics.commissionErrors,
          rtVariability: metrics.rtVariability,
          blockPerformance: metrics.blockPerformance,
        },
      });
    }
  }, [gameComplete]);

  const metrics = gameComplete ? calculateMetrics() : null;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <GameCompatibilityCheck />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Atenção Sustentada (CPT)</h1>
          <p className="text-sm text-muted-foreground">Bateria Cognitiva — Domínio 1</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Stats */}
      {isPlaying && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Clock className="w-5 h-5" />
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Tempo restante</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{trialCount}</div>
              <div className="text-xs text-muted-foreground">Estímulos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{trials.filter(t => t.response === 'hit').length}</div>
              <div className="text-xs text-muted-foreground">Acertos</div>
            </div>
          </div>
          <Progress value={((TOTAL_DURATION - timeLeft) / TOTAL_DURATION) * 100} className="mt-3" />
        </Card>
      )}

      {/* Game Area */}
      <Card className="relative overflow-hidden">
        <div
          className="relative w-full h-[400px] flex items-center justify-center cursor-pointer select-none"
          onClick={handleResponse}
        >
          {!isPlaying && !gameComplete && (
            <div className="text-center space-y-4">
              <Eye className="w-16 h-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Teste de Atenção Sustentada</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Letras aparecerão na tela. Pressione <strong>ESPAÇO</strong> ou <strong>toque na tela</strong> apenas quando a letra <strong className="text-primary text-xl">X</strong> aparecer.
              </p>
              <p className="text-sm text-muted-foreground">Duração: 3 minutos</p>
              <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                <Play className="w-5 h-5 mr-2" /> Iniciar
              </Button>
            </div>
          )}

          {isPlaying && (
            <div className={`transition-all duration-150 ${feedbackColor ? feedbackColor + ' rounded-full p-8' : ''}`}>
              {showStimulus && currentStimulus ? (
                <span className={`text-8xl font-bold ${currentStimulus === TARGET_LETTER ? 'text-primary' : 'text-foreground'}`}>
                  {currentStimulus}
                </span>
              ) : (
                <span className="text-4xl text-muted-foreground/30">+</span>
              )}
            </div>
          )}

          {gameComplete && metrics && (
            <div className="text-center space-y-4 p-4">
              <div className="text-5xl">🎯</div>
              <h2 className="text-2xl font-bold">Avaliação Completa</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{metrics.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Precisão Global</div>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning">{metrics.omissionErrors}</div>
                  <div className="text-xs text-muted-foreground">Erros Omissão</div>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{metrics.commissionErrors}</div>
                  <div className="text-xs text-muted-foreground">Erros Comissão</div>
                </div>
                <div className="p-3 bg-info/10 rounded-lg">
                  <div className="text-2xl font-bold text-info">{metrics.meanRT}ms</div>
                  <div className="text-xs text-muted-foreground">Tempo Reação Médio</div>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{metrics.rtVariability}ms</div>
                  <div className="text-xs text-muted-foreground">Variabilidade RT</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{metrics.totalTrials}</div>
                  <div className="text-xs text-muted-foreground">Total Estímulos</div>
                </div>
              </div>

              {metrics.blockPerformance.length > 1 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Curva de Performance por Bloco</p>
                  <div className="flex items-end gap-1 justify-center h-16">
                    {metrics.blockPerformance.map((perf, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-primary/70 rounded-t"
                          style={{ height: `${Math.max(4, perf * 0.6)}px` }}
                        />
                        <span className="text-[10px] text-muted-foreground mt-1">B{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={(e) => { e.stopPropagation(); startGame(); }}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Repetir
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      {isPlaying && (
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsPaused(p => !p)}>
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? 'Continuar' : 'Pausar'}
          </Button>
        </div>
      )}

      <Card className="mt-4 p-4">
        <h3 className="font-semibold mb-2">Instruções</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Letras aparecerão uma a uma na tela</li>
          <li>• Pressione <strong>ESPAÇO</strong> ou <strong>toque na tela</strong> APENAS quando ver a letra <strong className="text-primary">X</strong></li>
          <li>• NÃO pressione para nenhuma outra letra</li>
          <li>• O teste dura 3 minutos — mantenha o foco constante</li>
        </ul>
      </Card>
    </div>
  );
}
