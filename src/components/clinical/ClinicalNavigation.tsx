import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, Stethoscope, Users, Brain, 
  BarChart3, ClipboardCheck, TrendingUp, AlertTriangle, ClipboardList
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  description: string;
}

// Navegação clínica simplificada - PACIENTES como foco central
const clinicalNavigation: NavItem[] = [
  {
    title: 'Pacientes',
    path: '/therapist/patients',
    icon: Users,
    description: 'Prontuário, PEI e acompanhamento'
  },
  {
    title: 'Agenda',
    path: '/agenda',
    icon: FileText,
    description: 'Agenda de atendimentos'
  },
  {
    title: 'Teleconsultas',
    path: '/teleconsultas',
    icon: Stethoscope,
    description: 'Consultas com registro obrigatório'
  },
  {
    title: 'Avaliações',
    path: '/diagnostic-tests',
    icon: ClipboardCheck,
    description: 'Avaliações em 3 blocos'
  },
  {
    title: 'Relatórios',
    path: '/reports',
    icon: BarChart3,
    description: 'Todos os relatórios clínicos'
  },
];

const gestorNavigation: NavItem[] = [
  {
    title: 'Dashboard Institucional',
    path: '/institutional',
    icon: BarChart3,
    description: 'Visão agregada e anonimizada'
  },
  {
    title: 'Centro de Operações',
    path: '/operations',
    icon: TrendingUp,
    description: 'Gargalos, SLA e escala'
  },
  {
    title: 'Mapas de Risco',
    path: '/admin/risk-maps',
    icon: AlertTriangle,
    description: 'Perfis de risco por região'
  },
  {
    title: 'Impacto',
    path: '/admin/impact',
    icon: Brain,
    description: 'Evidência e desfechos'
  },
];

export function ClinicalNavigation() {
  const location = useLocation();
  const { role, isAdmin } = useUserRole();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const showClinical = isAdmin || role === 'therapist';
  const showGestor = isAdmin;

  return (
    <div className="space-y-6">
      {showClinical && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Clínico
          </h3>
          <div className="space-y-1">
            {clinicalNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block">{item.title}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {showGestor && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Gestor
          </h3>
          <div className="space-y-1">
            {gestorNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-primary')} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block">{item.title}</span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
