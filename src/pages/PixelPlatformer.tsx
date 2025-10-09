import { PixelGame } from '@/components/PixelGame';

export default function PixelPlatformer() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Floresta do Foco
          </h1>
          <p className="text-white/70">
            Aventura terapêutica em pixel art
          </p>
        </div>
        
        <PixelGame />
      </div>
    </div>
  );
}
