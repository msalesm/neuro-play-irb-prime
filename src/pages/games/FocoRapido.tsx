import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, RotateCcw, Clock, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';
import { toast } from 'sonner';

/**
 * BATERIA MÍNIMA - DOMÍNIO 2: Controle Inibitório (Go/No-Go)
 * 
 * 70% estímulo Go (responder)
 * 30% estímulo No-Go (inibir)
 * Métricas: taxa impulsividade, latência média, latência pós-erro
 */

const TOTAL_TRIALS = 60;
const GO_RATIO = 0.70;
const STIMULUS_DISPLAY = 1000; // ms
const INTER_STIMULUS = 1200; // ms

interface Trial {
  type: 'go' | 'nogo';
  response: 'hit' | 'miss' | 'false-alarm' | 'correct-inhibition';
  reactionTime: number | null;
  trialNumber: number;
  wasPostError: boolean;
}

export default function FocoRapido() {
  const { childProfileId, isTestMode } = useGameProfile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  
  const [currentStimulus, setCurrentStimulus] = useState<'go' | 'nogo' | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [canRespond, setCanRespond] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState<string | null>(null);
  const [trialNum, setTrialNum] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  
  const stimTimeRef = useRef(0);
  const respondedRef = useRef(false);
  const lastErrorRef = useRef(false);
  const stimTypeRef = useRef<'go' | 'nogo'>('go');
  const loopRef = useRef<ReturnType<typeof setTimeout>>();

  const { startSession, endSession } = useGameSession(
    'inhibitory-control',
    childProfileId || undefined
  );

  const runTrial = useCallback((num: number) => {
    if (num >= TOTAL_TRIALS) {
      setGameComplete(true);
      setIsPlaying(false);
      return;
    }

    const isGo = Math.random() < GO_RATIO;
    stimTypeRef.current = isGo ? 'go' : 'nogo';
    respondedRef.current = false;
    stimTimeRef.current = Date.now();

    setCurrentStimulus(isGo ? 'go' : 'nogo');
    setShowStimulus(true);
    setCanRespond(true);
    setFeedbackColor(null);
    setTrialNum(num);

    // Hide stimulus
    setTimeout(() => {
      setShowStimulus(false);
      
      // Check response after stimulus gone
      setTimeout(() => {
        if (!respondedRef.current) {
          const result: Trial = {
            type: stimTypeRef.current,
            response: stimTypeRef.current === 'go' ? 'miss' : 'correct-inhibition',
            reactionTime: null,
            trialNumber: num,
            wasPostError: lastErrorRef.current,
          };
          setTrials(prev => [...prev, result]);
          
          if (stimTypeRef.current === 'go') {
            lastErrorRef.current = true; // missed a go = error
          } else {
            lastErrorRef.current = false;
          }
        }
        setCanRespond(false);
        
        // Next trial
        loopRef.current = setTimeout(() => runTrial(num + 1), 200);
      }, INTER_STIMULUS - STIMULUS_DISPLAY);
    }, STIMULUS_DISPLAY);
  }, []);

  const handleResponse = useCallback(() => {
    if (!canRespond || respondedRef.current) return;
    respondedRef.current = true;

    const rt = Date.now() - stimTimeRef.current;
    const isGo = stimTypeRef.current === 'go';

    const result: Trial = {
      type: stimTypeRef.current,
      response: isGo ? 'hit' : 'false-alarm',
      reactionTime: rt,
      trialNumber: trialNum,
      wasPostError: lastErrorRef.current,
    };

    setTrials(prev => [...prev, result]);
    setFeedbackColor(isGo ? 'bg-green-500/20' : 'bg-red-500/20');
    
    if (!isGo) {
      lastErrorRef.current = true; // false alarm = error
    } else {
      lastErrorRef.current = false;
    }

    setTimeout(() => setFeedbackColor(null), 200);
  }, [canRespond, trialNum]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleResponse(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleResponse]);

  const startGame = async () => {
    setIsPlaying(true);
    setGameComplete(false);
    setTrials([]);
    setTrialNum(0);
    lastErrorRef.current = false;

    if (!isTestMode) await startSession({ difficulty_level: 1 });
    
    setTimeout(() => runTrial(0), 1000);
  };

  // Cleanup
  useEffect(() => {
    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, []);

  // Calculate metrics
  const calcMetrics = () => {
    const hits = trials.filter(t => t.response === 'hit');
    const falseAlarms = trials.filter(t => t.response === 'false-alarm');
    const misses = trials.filter(t => t.response === 'miss');
    const correctInhibitions = trials.filter(t => t.response === 'correct-inhibition');

    const goTrials = trials.filter(t => t.type === 'go');
    const nogoTrials = trials.filter(t => t.type === 'nogo');

    const impulsivityRate = nogoTrials.length > 0 ? falseAlarms.length / nogoTrials.length : 0;
    
    const rts = hits.map(t => t.reactionTime!).filter(Boolean);
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;

    // Post-error latency
    const postErrorTrials = hits.filter(t => t.wasPostError);
    const postErrorRTs = postErrorTrials.map(t => t.reactionTime!).filter(Boolean);
    const postErrorLatency = postErrorRTs.length > 0
      ? postErrorRTs.reduce((a, b) => a + b, 0) / postErrorRTs.length
      : 0;

    const accuracy = trials.length > 0
      ? (hits.length + correctInhibitions.length) / trials.length
      : 0;

    return {
      accuracy: Math.round(accuracy * 100),
      impulsivityRate: Math.round(impulsivityRate * 100),
      meanRT: Math.round(meanRT),
      postErrorLatency: Math.round(postErrorLatency),
      falseAlarms: falseAlarms.length,
      misses: misses.length,
      hits: hits.length,
      correctInhibitions: correctInhibitions.length,
      totalTrials: trials.length,
    };
  };

  // Save on complete
  useEffect(() => {
    if (!gameComplete) return;
    const m = calcMetrics();
    if (!isTestMode) {
      endSession({
        score: m.accuracy,
        accuracy_percentage: m.accuracy,
        correct_attempts: m.hits + m.correctInhibitions,
        incorrect_attempts: m.falseAlarms + m.misses,
        avg_reaction_time_ms: m.meanRT,
        session_data: {
          gameId: 'inhibitory-control',
          commissionErrors: m.falseAlarms,
          omissionErrors: m.misses,
          impulsivityRate: m.impulsivityRate,
          postErrorLatency: m.postErrorLatency,
        },
      });
    }
  }, [gameComplete]);

  const metrics = gameComplete ? calcMetrics() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/games">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </Link>

        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Controle Inibitório (Go/No-Go)</h1>
          <p className="text-sm text-muted-foreground">Bateria Cognitiva — Domínio 2</p>
        </div>

        {isPlaying && (
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{trialNum}/{TOTAL_TRIALS}</div>
                <div className="text-xs text-muted-foreground">Estímulo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trials.filter(t => t.response === 'hit' || t.response === 'correct-inhibition').length}
                </div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {trials.filter(t => t.response === 'false-alarm').length}
                </div>
                <div className="text-xs text-muted-foreground">Falsos Alarmes</div>
              </div>
            </div>
            <Progress value={(trialNum / TOTAL_TRIALS) * 100} className="mt-3" />
          </Card>
        )}

        <Card className="relative overflow-hidden">
          <div 
            className={`relative w-full h-[400px] flex items-center justify-center cursor-pointer select-none transition-colors ${feedbackColor || ''}`}
            onClick={handleResponse}
          >
            {!isPlaying && !gameComplete && (
              <div className="text-center space-y-4">
                <Hand className="w-16 h-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">Teste Go/No-Go</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Pressione <strong>ESPAÇO</strong> ou <strong>toque</strong> quando ver o <strong className="text-green-600">círculo VERDE</strong>.
                  <br />
                  <strong className="text-red-600">NÃO pressione</strong> quando ver o <strong className="text-red-600">círculo VERMELHO</strong>.
                </p>
                <Button size="lg" onClick={(e) => { e.stopPropagation(); startGame(); }}>
                  <Play className="w-5 h-5 mr-2" /> Iniciar
                </Button>
              </div>
            )}

            {isPlaying && (
              <div>
                {showStimulus && currentStimulus ? (
                  <div className={`w-32 h-32 rounded-full ${
                    currentStimulus === 'go' ? 'bg-green-500' : 'bg-red-500'
                  } shadow-lg transition-transform animate-in zoom-in duration-200`} />
                ) : (
                  <div className="w-4 h-4 bg-muted-foreground/30 rounded-full" />
                )}
              </div>
            )}

            {gameComplete && metrics && (
              <div className="text-center space-y-4 p-4">
                <div className="text-5xl">🛑</div>
                <h2 className="text-2xl font-bold">Avaliação Completa</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{metrics.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Precisão</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{metrics.impulsivityRate}%</div>
                    <div className="text-xs text-muted-foreground">Taxa Impulsividade</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.meanRT}ms</div>
                    <div className="text-xs text-muted-foreground">Latência Média</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{metrics.postErrorLatency}ms</div>
                    <div className="text-xs text-muted-foreground">Latência Pós-Erro</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.correctInhibitions}</div>
                    <div className="text-xs text-muted-foreground">Inibições Corretas</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{metrics.falseAlarms}</div>
                    <div className="text-xs text-muted-foreground">Falsos Alarmes</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center mt-4">
                  <Button variant="outline" onClick={() => window.history.back()}>
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

        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-2">Instruções</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong className="text-green-600">Círculo Verde</strong> → Pressione ESPAÇO ou toque (Go)</li>
            <li>• <strong className="text-red-600">Círculo Vermelho</strong> → NÃO pressione (No-Go)</li>
            <li>• Responda o mais rápido possível sem cometer erros</li>
            <li>• 60 estímulos no total</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
