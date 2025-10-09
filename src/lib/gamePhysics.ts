import { PlayerState, Platform, Vector2D, GAME_CONFIG } from '@/types/game';

export function updatePlayerPhysics(
  player: PlayerState,
  platforms: Platform[],
  deltaTime: number,
  controls: { left: boolean; right: boolean; jump: boolean }
): PlayerState {
  const newPlayer = { ...player };
  const dt = deltaTime / 16.67; // Normalize to 60fps

  // Horizontal movement
  if (controls.left) {
    newPlayer.velocity.x = -GAME_CONFIG.PLAYER_SPEED;
    newPlayer.facing = 'left';
  } else if (controls.right) {
    newPlayer.velocity.x = GAME_CONFIG.PLAYER_SPEED;
    newPlayer.facing = 'right';
  } else {
    newPlayer.velocity.x *= 0.8; // Friction
  }

  // Apply gravity
  if (!newPlayer.grounded) {
    newPlayer.velocity.y += GAME_CONFIG.GRAVITY * dt;
  }

  // Jump
  if (controls.jump && newPlayer.grounded) {
    newPlayer.velocity.y = GAME_CONFIG.JUMP_FORCE;
    newPlayer.grounded = false;
  }

  // Update position
  newPlayer.position.x += newPlayer.velocity.x * dt;
  newPlayer.position.y += newPlayer.velocity.y * dt;

  // Collision detection
  newPlayer.grounded = false;
  
  for (const platform of platforms) {
    if (platform.type === 'hazard') continue;

    const collision = checkCollision(
      newPlayer.position,
      { x: GAME_CONFIG.PLAYER_WIDTH, y: GAME_CONFIG.PLAYER_HEIGHT },
      { x: platform.x, y: platform.y },
      { x: platform.width, y: platform.height }
    );

    if (collision) {
      // Bottom collision (landing on platform)
      if (newPlayer.velocity.y > 0 && 
          newPlayer.position.y + GAME_CONFIG.PLAYER_HEIGHT <= platform.y + 5) {
        newPlayer.position.y = platform.y - GAME_CONFIG.PLAYER_HEIGHT;
        newPlayer.velocity.y = 0;
        newPlayer.grounded = true;
      }
      // Top collision (hitting platform from below)
      else if (newPlayer.velocity.y < 0 && 
               newPlayer.position.y >= platform.y + platform.height - 5) {
        newPlayer.position.y = platform.y + platform.height;
        newPlayer.velocity.y = 0;
      }
      // Side collisions
      else if (newPlayer.velocity.x > 0) {
        newPlayer.position.x = platform.x - GAME_CONFIG.PLAYER_WIDTH;
        newPlayer.velocity.x = 0;
      } else if (newPlayer.velocity.x < 0) {
        newPlayer.position.x = platform.x + platform.width;
        newPlayer.velocity.x = 0;
      }
    }
  }

  // Update animation state
  if (!newPlayer.grounded) {
    newPlayer.animation = newPlayer.velocity.y < 0 ? 'jump' : 'fall';
  } else if (Math.abs(newPlayer.velocity.x) > 0.5) {
    newPlayer.animation = 'run';
  } else {
    newPlayer.animation = 'idle';
  }

  // Prevent falling through bottom
  if (newPlayer.position.y > GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT) {
    newPlayer.position.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT;
    newPlayer.velocity.y = 0;
    newPlayer.grounded = true;
  }

  // Keep player in bounds horizontally
  newPlayer.position.x = Math.max(0, Math.min(
    GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_WIDTH,
    newPlayer.position.x
  ));

  return newPlayer;
}

function checkCollision(
  pos1: Vector2D,
  size1: Vector2D,
  pos2: Vector2D,
  size2: Vector2D
): boolean {
  return (
    pos1.x < pos2.x + size2.x &&
    pos1.x + size1.x > pos2.x &&
    pos1.y < pos2.y + size2.y &&
    pos1.y + size1.y > pos2.y
  );
}
