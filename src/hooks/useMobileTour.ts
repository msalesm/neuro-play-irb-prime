import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MOBILE_TOUR_KEY = 'neuro-irb-prime-mobile-tour-completed';

export function useMobileTour() {
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem(MOBILE_TOUR_KEY);
    
    if (!completed && location.pathname === '/') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const completeTour = () => {
    localStorage.setItem(MOBILE_TOUR_KEY, 'true');
    setTourCompleted(true);
    setRunTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(MOBILE_TOUR_KEY);
    setTourCompleted(false);
  };

  const skipTour = () => {
    completeTour();
  };

  return {
    runTour,
    setRunTour,
    completeTour,
    resetTour,
    skipTour,
    tourCompleted,
  };
}
