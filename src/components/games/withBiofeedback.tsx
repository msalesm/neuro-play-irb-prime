import { ComponentType, useEffect, useState } from 'react';
import { BiofeedbackProvider, BiofeedbackDisplay, useBiofeedbackContext } from './BiofeedbackSystem';
import { GameResponse } from '@/types/biofeedback';

interface BiofeedbackEnhancedProps {
  onGameResponse?: (response: GameResponse) => void;
  enableEnergyBar?: boolean;
  energyBarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// HOC that wraps a game component with biofeedback functionality
export function withBiofeedback<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    enableEnergyBar?: boolean;
    energyBarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    autoTriggerBreathing?: boolean;
  } = {}
) {
  const {
    enableEnergyBar = true,
    energyBarPosition = 'top-right',
    autoTriggerBreathing = true,
  } = options;

  function BiofeedbackEnhanced(props: P & BiofeedbackEnhancedProps) {
    return (
      <BiofeedbackProvider>
        <BiofeedbackGame 
          {...props} 
          enableEnergyBar={enableEnergyBar}
          energyBarPosition={energyBarPosition}
          autoTriggerBreathing={autoTriggerBreathing}
        />
      </BiofeedbackProvider>
    );
  }

  function BiofeedbackGame(props: P & BiofeedbackEnhancedProps & { autoTriggerBreathing: boolean }) {
    const { 
      onGameResponse, 
      enableEnergyBar, 
      energyBarPosition, 
      autoTriggerBreathing,
      ...gameProps 
    } = props;
    
    const biofeedback = useBiofeedbackContext();
    const [lastBreathingCheck, setLastBreathingCheck] = useState(0);

    // Enhanced game response handler
    const handleGameResponse = (response: GameResponse) => {
      // Record in biofeedback system
      biofeedback.recordResponse(response);
      
      // Call original handler if provided
      onGameResponse?.(response);
    };

    // Auto-trigger breathing exercise
    useEffect(() => {
      if (!autoTriggerBreathing) return;

      const now = Date.now();
      // Check every 2 seconds to avoid too frequent checks
      if (now - lastBreathingCheck < 2000) return;
      
      if (biofeedback.shouldTriggerBreathing()) {
        biofeedback.startBreathingExercise();
        setLastBreathingCheck(now);
      }
    }, [biofeedback, autoTriggerBreathing, lastBreathingCheck]);

    // Add click tracking to all clicks in the game
    useEffect(() => {
      const handleClick = () => {
        biofeedback.trackClick();
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, [biofeedback]);

    return (
      <div className="relative">
        <WrappedComponent 
          {...(gameProps as P)}
          onGameResponse={handleGameResponse}
        />
        
        {enableEnergyBar && (
          <BiofeedbackDisplay 
            position={energyBarPosition}
            showLabel={false}
          />
        )}
      </div>
    );
  }

  BiofeedbackEnhanced.displayName = `withBiofeedback(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return BiofeedbackEnhanced;
}

// Utility hook for manual biofeedback integration in existing games
export function useBiofeedbackIntegration() {
  const biofeedback = useBiofeedbackContext();

  // Simple helpers for games that want to integrate manually
  const recordCorrectAnswer = (responseTime: number, gameData?: any) => {
    biofeedback.recordResponse({
      isCorrect: true,
      responseTime,
      timestamp: Date.now(),
      gameSpecificData: gameData,
    });
  };

  const recordIncorrectAnswer = (responseTime: number, gameData?: any) => {
    biofeedback.recordResponse({
      isCorrect: false,
      responseTime,
      timestamp: Date.now(),
      gameSpecificData: gameData,
    });
  };

  const checkAndTriggerBreathing = () => {
    if (biofeedback.shouldTriggerBreathing()) {
      biofeedback.startBreathingExercise();
    }
  };

  return {
    ...biofeedback,
    recordCorrectAnswer,
    recordIncorrectAnswer,
    checkAndTriggerBreathing,
  };
}