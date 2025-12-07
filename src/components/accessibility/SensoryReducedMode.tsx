import { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Component that applies sensory reduced mode styles globally
export function SensoryReducedMode() {
  const { profile } = useAccessibility();

  useEffect(() => {
    const root = document.documentElement;
    
    if (profile.lowStimulation) {
      root.setAttribute('data-sensory-reduced', 'true');
      
      // Reduce all saturations and contrasts
      root.style.setProperty('--saturation-multiplier', '0.5');
      
      // Slow down transitions
      root.style.setProperty('--transition-duration', '0.5s');
      
      // Mute decorative elements
      const decorativeElements = document.querySelectorAll('[data-decorative="true"], .decorative, .animate-pulse, .animate-bounce');
      decorativeElements.forEach(el => {
        (el as HTMLElement).style.opacity = '0.3';
      });
    } else {
      root.removeAttribute('data-sensory-reduced');
      root.style.removeProperty('--saturation-multiplier');
      root.style.removeProperty('--transition-duration');
      
      const decorativeElements = document.querySelectorAll('[data-decorative="true"], .decorative, .animate-pulse, .animate-bounce');
      decorativeElements.forEach(el => {
        (el as HTMLElement).style.opacity = '';
      });
    }

    return () => {
      root.removeAttribute('data-sensory-reduced');
    };
  }, [profile.lowStimulation]);

  return null;
}

// Muted color palette for sensory reduced mode
export const sensoryReducedPalette = {
  background: 'hsl(40, 15%, 98%)',
  foreground: 'hsl(40, 10%, 25%)',
  primary: 'hsl(40, 20%, 45%)',
  secondary: 'hsl(40, 15%, 55%)',
  accent: 'hsl(40, 25%, 60%)',
  muted: 'hsl(40, 10%, 90%)',
  mutedForeground: 'hsl(40, 15%, 50%)',
  card: 'hsl(40, 15%, 99%)',
  border: 'hsl(40, 10%, 85%)',
};

// CSS styles for sensory reduced mode
export const sensoryReducedStyles = `
/* Sensory Reduced Mode - Calming interface for sensory sensitivity */
[data-sensory-reduced="true"] {
  --background: 40 15% 98%;
  --foreground: 40 10% 25%;
  --primary: 40 20% 45%;
  --primary-foreground: 40 5% 98%;
  --secondary: 40 15% 55%;
  --secondary-foreground: 40 5% 98%;
  --accent: 40 25% 60%;
  --accent-foreground: 40 10% 15%;
  --muted: 40 10% 90%;
  --muted-foreground: 40 15% 50%;
  --card: 40 15% 99%;
  --card-foreground: 40 10% 25%;
  --border: 40 10% 85%;
  --input: 40 10% 92%;
  --ring: 40 20% 50%;
  
  /* Reduce all color saturation */
  --tdah-primary: 25 30% 55%;
  --tea-primary: 250 20% 55%;
  --dislexia-primary: 150 25% 50%;
  
  /* Softer shadows */
  --shadow-soft: 0 2px 8px hsla(40, 10%, 30%, 0.04);
  --shadow-medium: 0 4px 12px hsla(40, 10%, 30%, 0.06);
  --shadow-card: 0 2px 8px hsla(40, 10%, 30%, 0.05);
}

[data-sensory-reduced="true"] * {
  transition-duration: var(--transition-duration, 0.5s) !important;
}

[data-sensory-reduced="true"] .animate-pulse,
[data-sensory-reduced="true"] .animate-bounce,
[data-sensory-reduced="true"] .animate-spin {
  animation: none !important;
}

[data-sensory-reduced="true"] img,
[data-sensory-reduced="true"] video {
  filter: saturate(0.6) brightness(1.05);
}

[data-sensory-reduced="true"] .gradient-primary,
[data-sensory-reduced="true"] .gradient-hero {
  background: hsl(40, 15%, 92%) !important;
}
`;
