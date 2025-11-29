import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { Planeta } from '@/types/planeta';

interface SpaceMapProps {
  planetas: Planeta[];
  onPlanetClick: (planeta: Planeta) => void;
  selectedPlanetId?: string;
}

export function SpaceMap({ planetas, onPlanetClick, selectedPlanetId }: SpaceMapProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 30, 53, 0.95)'; // Azul petróleo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    const drawStars = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Draw orbital paths
    const drawOrbitalPaths = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.strokeStyle = 'rgba(0, 90, 112, 0.3)'; // Azul médio
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      [100, 200, 300, 400].forEach(radius => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.setLineDash([]);
    };

    drawStars();
    drawOrbitalPaths();

    // Draw connection lines between planets
    ctx.strokeStyle = 'rgba(199, 146, 62, 0.2)'; // Dourado
    ctx.lineWidth = 2;
    for (let i = 0; i < planetas.length - 1; i++) {
      const from = planetas[i];
      const to = planetas[i + 1];
      const fromX = (from.posicao.x / 100) * canvas.width;
      const fromY = (from.posicao.y / 100) * canvas.height;
      const toX = (to.posicao.x / 100) * canvas.width;
      const toY = (to.posicao.y / 100) * canvas.height;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    }
  }, [planetas]);

  const getPlanetSize = (tamanho: Planeta['tamanho']) => {
    switch (tamanho) {
      case 'pequeno': return { width: 80, height: 80 };
      case 'medio': return { width: 100, height: 100 };
      case 'grande': return { width: 120, height: 120 };
    }
  };

  return (
    <div className="relative w-full h-[600px] md:h-[600px] h-[500px] rounded-xl overflow-hidden shadow-2xl">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Planetas */}
      <div className="md:block hidden">
        {planetas.map((planeta) => {
          const size = getPlanetSize(planeta.tamanho);
          const isSelected = selectedPlanetId === planeta.id;
          const isHovered = hoveredPlanetId === planeta.id;

          return (
            <motion.div
              key={planeta.id}
              className="absolute cursor-pointer"
              style={{
                left: `${planeta.posicao.x}%`,
                top: `${planeta.posicao.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
                opacity: 1 
              }}
              transition={{ 
                duration: 0.5,
                delay: planetas.indexOf(planeta) * 0.1
              }}
              whileHover={{ scale: 1.15 }}
              onClick={() => {
                onPlanetClick(planeta);
                // Navigate to planet details on double click or after a short delay
                setTimeout(() => navigate(`/planeta/${planeta.id}`), 300);
              }}
              onMouseEnter={() => setHoveredPlanetId(planeta.id)}
              onMouseLeave={() => setHoveredPlanetId(null)}
            >
            <div className="relative">
              {/* Planeta Glow */}
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ 
                  backgroundColor: planeta.cor,
                  width: size.width,
                  height: size.height,
                }}
              />

              {/* Planeta Body */}
              <div
                className="relative rounded-full flex items-center justify-center text-4xl shadow-2xl border-4"
                style={{
                  width: size.width,
                  height: size.height,
                  backgroundColor: `${planeta.cor}80`,
                  borderColor: planeta.desbloqueado ? planeta.cor : 'rgba(255,255,255,0.2)',
                  filter: planeta.desbloqueado ? 'none' : 'grayscale(80%)',
                }}
              >
                <span className="relative z-10">
                  {planeta.icone}
                </span>

                {/* Rotating ring effect for active planets */}
                {planeta.desbloqueado && planeta.progressoAtual > 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-dashed"
                    style={{ borderColor: planeta.cor }}
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + planetas.indexOf(planeta) * 0.1 }}
              >
                <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border shadow-lg">
                  <span className="text-xs font-semibold">{planeta.nome}</span>
                </div>
              </motion.div>

              {/* Progress indicator */}
              {planeta.desbloqueado && (
                <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  {planeta.progressoAtual}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-4 p-4">
        {planetas.map((planeta, idx) => {
          const size = getPlanetSize(planeta.tamanho);
          const isSelected = selectedPlanetId === planeta.id;

          return (
            <motion.div
              key={planeta.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                onPlanetClick(planeta);
                setTimeout(() => navigate(`/planeta/${planeta.id}`), 300);
              }}
              className="cursor-pointer"
            >
              <div className="relative bg-background/90 backdrop-blur-sm rounded-xl p-4 border-2 transition-all"
                style={{
                  borderColor: isSelected ? planeta.cor : 'rgba(255,255,255,0.1)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* Planet Icon */}
                <div className="flex justify-center mb-3">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg border-4"
                    style={{
                      backgroundColor: `${planeta.cor}80`,
                      borderColor: planeta.desbloqueado ? planeta.cor : 'rgba(255,255,255,0.2)',
                      filter: planeta.desbloqueado ? 'none' : 'grayscale(80%)',
                    }}
                  >
                    {planeta.icone}
                  </div>
                </div>

                {/* Planet Name */}
                <h3 className="text-center font-bold text-sm mb-2">{planeta.nome}</h3>

                {/* Progress */}
                {planeta.desbloqueado && (
                  <div className="space-y-1">
                    <Progress 
                      value={(planeta.progressoAtual / planeta.totalMissoes) * 100} 
                      className="h-1.5"
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      {planeta.progressoAtual}/{planeta.totalMissoes} missões
                    </p>
                  </div>
                )}

                {!planeta.desbloqueado && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Bloqueado</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold mb-2">Sistema Planeta Azul</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Missões Completas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-primary" />
            <span className="text-muted-foreground">Planeta Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}