import { useEffect, useRef, useCallback } from 'react';

interface GameLoopCallbacks {
  update: (deltaTime: number) => void;
  render: () => void;
}

export function useGameLoop({ update, render }: GameLoopCallbacks, paused: boolean = false) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const fpsIntervalRef = useRef<number>(1000 / 60); // 60 FPS

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Cap delta time to prevent large jumps
      const cappedDelta = Math.min(deltaTime, fpsIntervalRef.current * 2);
      
      if (!paused) {
        update(cappedDelta);
      }
      render();
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [update, render, paused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  return null;
}
