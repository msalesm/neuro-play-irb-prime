import { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

// Component that applies high visibility mode styles globally
export function HighVisibilityMode() {
  const { profile } = useAccessibility();

  useEffect(() => {
    const root = document.documentElement;
    
    if (profile.highContrast) {
      // Apply high visibility CSS variables
      root.setAttribute('data-high-visibility', 'true');
      root.style.setProperty('--focus-ring-width', '4px');
      root.style.setProperty('--border-width', '2px');
    } else {
      root.removeAttribute('data-high-visibility');
      root.style.removeProperty('--focus-ring-width');
      root.style.removeProperty('--border-width');
    }

    return () => {
      root.removeAttribute('data-high-visibility');
    };
  }, [profile.highContrast]);

  return null;
}

// CSS styles to add to index.css for high visibility mode
export const highVisibilityStyles = `
/* High Visibility Mode - Enhanced for low vision users */
[data-high-visibility="true"] {
  --background: 0 0% 0%;
  --foreground: 60 100% 50%;
  --card: 0 0% 5%;
  --card-foreground: 60 100% 50%;
  --primary: 180 100% 50%;
  --primary-foreground: 0 0% 0%;
  --secondary: 300 100% 50%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 15%;
  --muted-foreground: 60 80% 70%;
  --border: 60 100% 50%;
  --input: 0 0% 15%;
  --ring: 180 100% 50%;
}

[data-high-visibility="true"] * {
  border-width: var(--border-width, 2px) !important;
}

[data-high-visibility="true"] *:focus-visible {
  outline-width: var(--focus-ring-width, 4px) !important;
  outline-style: solid !important;
  outline-color: hsl(var(--ring)) !important;
}

[data-high-visibility="true"] button,
[data-high-visibility="true"] a,
[data-high-visibility="true"] [role="button"] {
  border: 2px solid currentColor !important;
  font-weight: 700 !important;
}

[data-high-visibility="true"] .text-muted-foreground {
  color: hsl(60 80% 70%) !important;
}
`;
