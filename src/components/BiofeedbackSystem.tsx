import { createContext, useContext, ReactNode } from 'react';
import { useBiofeedback } from '@/hooks/useBiofeedback';
import { BiofeedbackState, GameResponse, BiofeedbackMetrics, BreathingPattern } from '@/types/biofeedback';
import { BreathingExercise } from './BreathingExercise';
import { EmotionalEnergyBar } from './EmotionalEnergyBar';

interface BiofeedbackContextType {
  state: BiofeedbackState;
  trackClick: () => void;
  recordResponse: (response: GameResponse) => void;
  startBreathingExercise: () => void;
  completeBreathingExercise: () => void;
  shouldTriggerBreathing: () => boolean;
  getBreathingPattern: () => BreathingPattern;
  getMetrics: () => BiofeedbackMetrics;
  resetSession: () => void;
}

const BiofeedbackContext = createContext<BiofeedbackContextType | null>(null);

export function useBiofeedbackContext() {
  const context = useContext(BiofeedbackContext);
  if (!context) {
    throw new Error('useBiofeedbackContext must be used within BiofeedbackProvider');
  }
  return context;
}

interface BiofeedbackProviderProps {
  children: ReactNode;
}

export function BiofeedbackProvider({ children }: BiofeedbackProviderProps) {
  const biofeedback = useBiofeedback();

  return (
    <BiofeedbackContext.Provider value={biofeedback}>
      {children}
      
      {/* Breathing Exercise Modal */}
      {biofeedback.state.isBreathingExerciseActive && (
        <BreathingExercise
          pattern={biofeedback.getBreathingPattern()}
          onComplete={biofeedback.completeBreathingExercise}
          onSkip={biofeedback.completeBreathingExercise}
          autoStart={true}
        />
      )}
    </BiofeedbackContext.Provider>
  );
}

interface BiofeedbackDisplayProps {
  showLabel?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function BiofeedbackDisplay({ 
  showLabel = false, 
  position = 'top-right',
  className 
}: BiofeedbackDisplayProps) {
  const { state } = useBiofeedbackContext();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40 ${className}`}>
      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-soft border min-w-[200px]">
        <EmotionalEnergyBar 
          energy={state.emotionalEnergy} 
          showLabel={showLabel}
        />
      </div>
    </div>
  );
}