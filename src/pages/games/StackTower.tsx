import { StackTowerGame } from '@/components/StackTowerGame';
import { GameExitButton } from '@/components/GameExitButton';
import { Trophy, Target, Zap, Timer } from 'lucide-react';

export default function StackTower() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-vortex-900 via-vortex-800 to-vortex-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      {/* Exit Button */}
      <GameExitButton returnTo="/sistema-planeta-azul" />

      {/* Game Info Header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Torre Perfeita</h1>
        <p className="text-white/80 text-sm">Planeta Vortex - Foco e Precisão</p>
      </div>

      {/* Game Stats */}
      <div className="absolute top-20 right-4 z-10 bg-black/30 backdrop-blur-sm rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-white">
          <Target className="h-4 w-4 text-vortex-400" />
          <span className="text-xs">Acerte no centro para blocos perfeitos</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-xs">3 perfeitos seguidos = recuperação</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-xs">Construa a torre mais alta!</span>
        </div>
      </div>

      {/* Game Container */}
      <div className="w-full h-screen">
        <StackTowerGame />
      </div>

      {/* Instructions (Mobile) */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
        <p className="text-white text-sm font-medium">Toque para soltar o bloco</p>
      </div>
    </div>
  );
}
