/**
 * Hook: useGameEngine
 * 
 * Provides game session lifecycle management using the core game engine.
 */

import { useRef, useCallback, useState } from 'react';
import { 
  GameMetricsCollector, 
  calculateAdaptiveDifficulty, 
  type GameEvent, 
  type GameSessionConfig, 
  type SessionSummary 
} from '@/modules/games/engine';

export function useGameEngine(config: GameSessionConfig) {
  const collectorRef = useRef(new GameMetricsCollector());
  const [difficulty, setDifficulty] = useState(config.difficulty);
  const [sessionActive, setSessionActive] = useState(false);
  const startTimeRef = useRef<string>('');

  const startSession = useCallback(() => {
    collectorRef.current = new GameMetricsCollector();
    startTimeRef.current = new Date().toISOString();
    setSessionActive(true);
  }, []);

  const recordEvent = useCallback((event: GameEvent) => {
    collectorRef.current.recordEvent(event);
  }, []);

  const endSession = useCallback((): SessionSummary => {
    setSessionActive(false);
    const metrics = collectorRef.current.getSummary();
    const completedAt = new Date().toISOString();
    const durationSeconds = metrics.persistenceSeconds || 0;

    let adaptiveResult: SessionSummary['adaptiveResult'];
    if (config.adaptiveEnabled && metrics.accuracy !== undefined) {
      const result = calculateAdaptiveDifficulty(difficulty, metrics.accuracy);
      adaptiveResult = result;
      setDifficulty(result.newDifficulty);
    }

    return {
      gameId: config.gameId,
      gameName: config.gameName,
      startedAt: startTimeRef.current,
      completedAt,
      durationSeconds,
      difficulty,
      metrics,
      domains: config.cognitiveDomainsTargeted,
      adaptiveResult,
    };
  }, [config, difficulty]);

  return {
    difficulty,
    sessionActive,
    startSession,
    recordEvent,
    endSession,
    getMetrics: () => collectorRef.current.getSummary(),
  };
}
