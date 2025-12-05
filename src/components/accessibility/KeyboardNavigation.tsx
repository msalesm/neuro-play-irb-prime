import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { announce } from './ScreenReaderAnnouncer';

// Global keyboard shortcuts for accessibility (WCAG 2.2)
export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Alt + key shortcuts
    if (event.altKey) {
      switch (event.key) {
        case 'h':
        case 'H':
          event.preventDefault();
          navigate('/');
          announce('Navegando para a página inicial', 'polite');
          break;
        case 's':
        case 'S':
          event.preventDefault();
          navigate('/settings');
          announce('Navegando para configurações', 'polite');
          break;
        case 'a':
        case 'A':
          event.preventDefault();
          navigate('/accessibility');
          announce('Navegando para acessibilidade', 'polite');
          break;
        case 'g':
        case 'G':
          event.preventDefault();
          navigate('/games');
          announce('Navegando para jogos', 'polite');
          break;
        case 'd':
        case 'D':
          event.preventDefault();
          navigate('/dashboard-pais');
          announce('Navegando para o painel', 'polite');
          break;
      }
    }

    // Escape closes modals (handled by radix)
    // Tab navigation (native browser behavior)
    
    // Arrow keys for game-like navigation
    if (event.key === '?' && event.shiftKey) {
      event.preventDefault();
      announce(
        'Atalhos de teclado: Alt+H para início, Alt+S para configurações, Alt+A para acessibilidade, Alt+G para jogos, Alt+D para painel',
        'polite'
      );
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
}
