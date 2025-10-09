import { Level } from '@/types/game';

// Mundo 1: Floresta do Foco - Stage 1
export const WORLD_1_STAGE_1: Level = {
  id: 'w1_s1',
  name: 'Início da Jornada',
  world: 1,
  stage: 1,
  theme: 'forest',
  backgroundColor: '#87CEEB',
  startPosition: { x: 20, y: 250 },
  endPosition: { x: 440, y: 100 },
  platforms: [
    // Ground
    { x: 0, y: 280, width: 200, height: 40, type: 'solid' },
    { x: 250, y: 280, width: 230, height: 40, type: 'solid' },
    
    // First jump
    { x: 150, y: 220, width: 80, height: 16, type: 'platform' },
    
    // Mid section platforms
    { x: 280, y: 180, width: 60, height: 16, type: 'platform' },
    { x: 370, y: 140, width: 80, height: 16, type: 'platform' },
    
    // Final platform near goal
    { x: 400, y: 100, width: 80, height: 16, type: 'platform' },
  ],
  checkpoints: [
    { id: 'cp1', position: { x: 150, y: 200 }, activated: false },
    { id: 'cp2', position: { x: 370, y: 120 }, activated: false },
  ],
  collectibles: [
    { x: 100, y: 250 },
    { x: 160, y: 190 },
    { x: 290, y: 150 },
    { x: 380, y: 110 },
  ],
};

export const LEVELS: Record<string, Level> = {
  'w1_s1': WORLD_1_STAGE_1,
};

export function getLevel(world: number, stage: number): Level | undefined {
  return LEVELS[`w${world}_s${stage}`];
}
