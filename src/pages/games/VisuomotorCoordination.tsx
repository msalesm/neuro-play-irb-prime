import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameProfile } from '@/hooks/useGameProfile';
import { useGameSession } from '@/hooks/useGameSession';

/**
 * BATERIA MÍNIMA - DOMÍNIO 5: Coordenação Visuomotora
 * 
 * Tarefa de traçado controlado
 * Métricas: desvio médio, tempo, número de correções
 */

interface Point { x: number; y: number }

const PATHS: Point[][] = [
  // Horizontal wave
  Array.from({ length: 50 }, (_, i) => ({
    x: 30 + (i / 49) * 340,
    y: 200 + Math.sin((i / 49) * Math.PI * 3) * 80,
  })),
  // Spiral-like
  Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * Math.PI * 4;
    const r = 40 + t * 15;
    return { x: 200 + Math.cos(t) * r * 0.4, y: 200 + Math.sin(t) * r * 0.4 };
  }),
  // Zigzag
  Array.from({ length: 40 }, (_, i) => ({
    x: 40 + (i / 39) * 320,
    y: i % 2 === 0 ? 120 : 280,
  })),
];

export default function VisuomotorCoordination() {
  const navigate = useNavigate();
  const { childProfileId, isTestMode } = useGameProfile();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentPathIdx, setCurrentPathIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<Point[]>([]);
  const [pathResults, setPathResults] = useState<{ deviation: number; time: number; corrections: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(0);
  const lastPointRef = useRef<Point | null>(null);
  const correctionsRef = useRef(0);
  const prevDeviationRef = useRef(0);

  const { startSession, endSession } = useGameSession(
    'visuomotor-coordination',
    childProfileId || undefined
  );

  const currentPath = PATHS[currentPathIdx];

  // Draw path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw target path
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    currentPath.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    currentPath.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw user trace
    if (userPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'hsl(142.1 76.2% 36.3%)';
      ctx.lineWidth = 3;
      userPoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Draw start/end markers
    const start = currentPath[0];
    const end = currentPath[currentPath.length - 1];
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'hsl(0 84.2% 60.2%)';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }, [currentPath, userPoints]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const distToPath = (point: Point): number => {
    let minDist = Infinity;
    for (const p of currentPath) {
      const d = Math.sqrt(Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2));
      if (d < minDist) minDist = d;
    }
    return minDist;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || gameComplete) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);
    if (!pt) return;
    setIsDrawing(true);
    setUserPoints([pt]);
    startTimeRef.current = Date.now();
    lastPointRef.current = pt;
    correctionsRef.current = 0;
    prevDeviationRef.current = 0;
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isPlaying) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);
    if (!pt) return;

    setUserPoints(prev => [...prev, pt]);

    // Detect corrections (direction reversal toward path)
    const currentDev = distToPath(pt);
    if (prevDeviationRef.current > 0 && currentDev < prevDeviationRef.current - 2) {
      correctionsRef.current++;
    }
    prevDeviationRef.current = currentDev;
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const time = Date.now() - startTimeRef.current;
    const deviations = userPoints.map(p => distToPath(p));
    const avgDeviation = deviations.length > 0
      ? deviations.reduce((a, b) => a + b, 0) / deviations.length
      : 0;

    const result = {
      deviation: Math.round(avgDeviation * 100) / 100,
      time,
      corrections: correctionsRef.current,
    };

    setPathResults(prev => [...prev, result]);

    // Next path or complete
    if (currentPathIdx < PATHS.length - 1) {
      setTimeout(() => {
        setCurrentPathIdx(prev => prev + 1);
        setUserPoints([]);
      }, 500);
    } else {
      setGameComplete(true);
      setIsPlaying(false);
    }
  };

  const startGame = async () => {
    setIsPlaying(true);
    setGameComplete(false);
    setCurrentPathIdx(0);
    setUserPoints([]);
    setPathResults([]);
    if (!isTestMode) await startSession({ difficulty_level: 1 });
  };

  // Save results
  useEffect(() => {
    if (!gameComplete || pathResults.length === 0) return;

    const avgDev = pathResults.reduce((s, r) => s + r.deviation, 0) / pathResults.length;
    const avgTime = pathResults.reduce((s, r) => s + r.time, 0) / pathResults.length;
    const totalCorrections = pathResults.reduce((s, r) => s + r.corrections, 0);
    const accuracy = Math.max(0, 100 - avgDev * 2);

    if (!isTestMode) {
      endSession({
        score: Math.round(accuracy),
        accuracy_percentage: Math.round(accuracy),
        correct_attempts: PATHS.length,
        incorrect_attempts: 0,
        avg_reaction_time_ms: Math.round(avgTime),
        session_data: {
          gameId: 'visuomotor-coordination',
          averageDeviation: Math.round(avgDev),
          corrections: totalCorrections,
          pathResults,
        },
      });
    }
  }, [gameComplete]);

  const avgMetrics = pathResults.length > 0 ? {
    deviation: Math.round(pathResults.reduce((s, r) => s + r.deviation, 0) / pathResults.length),
    time: Math.round(pathResults.reduce((s, r) => s + r.time, 0) / pathResults.length),
    corrections: pathResults.reduce((s, r) => s + r.corrections, 0),
  } : null;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Coordenação Visuomotora</h1>
          <p className="text-sm text-muted-foreground">Bateria Cognitiva — Domínio 5</p>
        </div>
        <div className="w-20" />
      </div>

      <Card className="relative overflow-hidden">
        {!isPlaying && !gameComplete && (
          <div className="p-8 text-center space-y-4">
            <Crosshair className="w-16 h-16 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Traçado Controlado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Trace o caminho indicado na tela com o dedo ou mouse, seguindo a linha pontilhada o mais precisamente possível.
            </p>
            <Button size="lg" onClick={startGame}>
              <Play className="w-5 h-5 mr-2" /> Iniciar
            </Button>
          </div>
        )}

        {isPlaying && !gameComplete && (
          <div className="p-2">
            <div className="text-center text-sm text-muted-foreground mb-2">
              Traçado {currentPathIdx + 1} de {PATHS.length} — Siga a linha pontilhada
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full max-w-[400px] mx-auto border rounded-lg touch-none cursor-crosshair"
              style={{ aspectRatio: '1/1' }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
          </div>
        )}

        {gameComplete && avgMetrics && (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">✏️</div>
            <h2 className="text-2xl font-bold">Avaliação Completa</h2>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{avgMetrics.deviation}px</div>
                <div className="text-xs text-muted-foreground">Desvio Médio</div>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <div className="text-2xl font-bold text-info">{Math.round(avgMetrics.time / 1000)}s</div>
                <div className="text-xs text-muted-foreground">Tempo Médio</div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-accent">{avgMetrics.corrections}</div>
                <div className="text-xs text-muted-foreground">Correções</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button onClick={startGame}>
                <RotateCcw className="w-4 h-4 mr-2" /> Repetir
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-4 p-4">
        <h3 className="font-semibold mb-2">Instruções</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Trace sobre a linha pontilhada do ponto azul ao ponto vermelho</li>
          <li>• Mantenha o traço o mais próximo possível da linha central</li>
          <li>• Complete {PATHS.length} traçados diferentes</li>
        </ul>
      </Card>
    </div>
  );
}
