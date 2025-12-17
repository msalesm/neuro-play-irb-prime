import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, MessageCircle, Settings, Trophy, Brain, X,
  Calendar, Users, FileText, ClipboardList, BarChart3,
  Video, Heart, Rocket, BookOpen, UserPlus, AlertTriangle,
  LineChart, FolderOpen, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { role, isAdmin, isTherapist, isParent, isPatient } = useUserRole();
  const { t } = useLanguage();

  // Role-specific actions
  const getActionsForRole = (): FABAction[] => {
    // Admin actions
    if (isAdmin) {
      return [
        {
          id: 'admin-users',
          label: 'Gerenciar Usuários',
          icon: <Users className="w-4 h-4" />,
          href: '/admin/users',
          color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
          id: 'admin-reports',
          label: 'Relatórios',
          icon: <BarChart3 className="w-4 h-4" />,
          href: '/admin/reports',
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
          id: 'admin-operations',
          label: 'Centro de Operações',
          icon: <AlertTriangle className="w-4 h-4" />,
          href: '/centro-operacoes',
          color: 'bg-orange-500 hover:bg-orange-600'
        },
        {
          id: 'settings',
          label: 'Configurações',
          icon: <Settings className="w-4 h-4" />,
          href: '/settings',
          color: 'bg-gray-500 hover:bg-gray-600'
        },
      ];
    }

    // Therapist actions
    if (isTherapist) {
      return [
        {
          id: 'new-patient',
          label: 'Novo Paciente',
          icon: <UserPlus className="w-4 h-4" />,
          href: '/therapist/patients',
          color: 'bg-green-500 hover:bg-green-600'
        },
        {
          id: 'teleconsulta',
          label: 'Teleconsulta',
          icon: <Video className="w-4 h-4" />,
          href: '/teleconsultas',
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
          id: 'prontuario',
          label: 'Prontuário',
          icon: <FolderOpen className="w-4 h-4" />,
          href: '/prontuario',
          color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
          id: 'agenda',
          label: 'Agenda',
          icon: <Calendar className="w-4 h-4" />,
          href: '/agenda',
          color: 'bg-teal-500 hover:bg-teal-600'
        },
      ];
    }

    // Parent actions
    if (isParent) {
      return [
        {
          id: 'chat',
          label: 'Chat Terapêutico',
          icon: <MessageCircle className="w-4 h-4" />,
          href: '/chat',
          color: 'bg-purple-500 hover:bg-purple-600'
        },
        {
          id: 'progress',
          label: 'Progresso',
          icon: <LineChart className="w-4 h-4" />,
          href: '/progresso',
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
          id: 'emotional-history',
          label: 'Histórico Emocional',
          icon: <Heart className="w-4 h-4" />,
          href: '/historico-emocional',
          color: 'bg-pink-500 hover:bg-pink-600'
        },
        {
          id: 'reports',
          label: 'Relatórios',
          icon: <FileText className="w-4 h-4" />,
          href: '/relatorios',
          color: 'bg-green-500 hover:bg-green-600'
        },
      ];
    }

    // Patient actions (adult patients or children)
    if (isPatient) {
      return [
        {
          id: 'planets',
          label: 'Planetas',
          icon: <Rocket className="w-4 h-4" />,
          href: '/sistema-planeta-azul',
          color: 'bg-indigo-500 hover:bg-indigo-600'
        },
        {
          id: 'quick-game',
          label: 'Jogo Rápido',
          icon: <Brain className="w-4 h-4" />,
          href: '/games',
          color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
          id: 'stories',
          label: 'Histórias Sociais',
          icon: <BookOpen className="w-4 h-4" />,
          href: '/historias-sociais',
          color: 'bg-amber-500 hover:bg-amber-600'
        },
        {
          id: 'achievements',
          label: 'Conquistas',
          icon: <Trophy className="w-4 h-4" />,
          href: '/conquistas',
          color: 'bg-yellow-500 hover:bg-yellow-600'
        },
      ];
    }

    // Default actions (for users without specific role)
    return [
      {
        id: 'chat',
        label: 'Chat Terapêutico',
        icon: <MessageCircle className="w-4 h-4" />,
        href: '/chat',
        color: 'bg-purple-500 hover:bg-purple-600'
      },
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
        href: '/conquistas',
        color: 'bg-yellow-500 hover:bg-yellow-600'
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: <Settings className="w-4 h-4" />,
        href: '/settings',
        color: 'bg-gray-500 hover:bg-gray-600'
      },
    ];
  };

  const allActions = actions.length > 0 ? actions : getActionsForRole();

  const toggleFAB = () => setIsOpen(!isOpen);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)} role="group" aria-label="Ações rápidas" data-mobile-tour="floating-chat">
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
                <Link to={action.href} aria-label={action.label} onClick={() => setIsOpen(false)}>
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
                  onClick={() => {
                    action.action?.();
                    setIsOpen(false);
                  }}
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
