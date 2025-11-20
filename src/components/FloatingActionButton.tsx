import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, MessageCircle, Settings, Trophy, 
  Brain, Target, Sparkles, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
  href?: string;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  className?: string;
}

export function FloatingActionButton({ 
  actions = [],
  className 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: FABAction[] = [
    {
      id: 'quick-game',
      label: 'Jogo Rápido',
      icon: <Brain className="w-4 h-4" />,
      href: '/games',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'achievements',
      label: 'Conquistas',
      icon: <Trophy className="w-4 h-4" />,
      href: '/achievements',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => console.log('Feedback clicked'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
      href: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  const toggleFAB = () => setIsOpen(!isOpen);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)} role="group" aria-label="Ações rápidas">
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
          {allActions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span 
                className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap"
                id={`fab-label-${action.id}`}
              >
                {action.label}
              </span>
              
              {action.href ? (
                <Link to={action.href} aria-label={action.label}>
                  <Button
                    size="sm"
                    className={cn(
                      "w-10 h-10 rounded-full shadow-lg hover-scale",
                      action.color || "bg-primary hover:bg-primary/90"
                    )}
                    aria-describedby={`fab-label-${action.id}`}
                  >
                    {action.icon}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  onClick={action.action}
                  className={cn(
                    "w-10 h-10 rounded-full shadow-lg hover-scale",
                    action.color || "bg-primary hover:bg-primary/90"
                  )}
                  aria-label={action.label}
                  aria-describedby={`fab-label-${action.id}`}
                >
                  {action.icon}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleFAB}
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg hover-scale transition-all duration-300",
          "bg-gradient-primary hover:shadow-glow",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Plus className="w-6 h-6" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}