import { useState, useEffect, useCallback } from 'react';
import { GameControls } from '@/types/game';

export function useGameControls() {
  const [controls, setControls] = useState<GameControls>({
    left: false,
    right: false,
    jump: false,
    action: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        setControls(prev => ({ ...prev, left: true }));
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
        setControls(prev => ({ ...prev, right: true }));
        e.preventDefault();
        break;
      case ' ':
      case 'ArrowUp':
      case 'w':
        setControls(prev => ({ ...prev, jump: true }));
        e.preventDefault();
        break;
      case 'Shift':
      case 'Control':
        setControls(prev => ({ ...prev, action: true }));
        e.preventDefault();
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        setControls(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
      case 'd':
        setControls(prev => ({ ...prev, right: false }));
        break;
      case ' ':
      case 'ArrowUp':
      case 'w':
        setControls(prev => ({ ...prev, jump: false }));
        break;
      case 'Shift':
      case 'Control':
        setControls(prev => ({ ...prev, action: false }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return controls;
}
