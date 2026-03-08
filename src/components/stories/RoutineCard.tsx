import { Sun, Moon, School, Settings, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Routine } from '@/hooks/useRoutines';

interface RoutineCardProps {
  routine: Routine;
  onClick: () => void;
  completedSteps?: number;
  totalSteps?: number;
}

const getRoutineIcon = (type: string, icon: string) => {
  switch (type) {
    case 'manha': return <Sun className="h-8 w-8 text-warning" />;
    case 'noite': return <Moon className="h-8 w-8 text-accent" />;
    case 'escola': return <School className="h-8 w-8 text-primary" />;
    default: return <Settings className="h-8 w-8 text-primary" />;
  }
};

const getRoutineGradient = (type: string) => {
  switch (type) {
    case 'manha': return 'from-warning/20 via-warning/10 to-transparent';
    case 'noite': return 'from-primary/20 via-primary/10 to-transparent';
    case 'escola': return 'from-info/20 via-info/10 to-transparent';
    default: return 'from-primary/20 via-secondary/10 to-transparent';
  }
};

const getRoutineLabel = (type: string) => {
  switch (type) {
    case 'manha': return 'Manhã';
    case 'noite': return 'Noite';
    case 'escola': return 'Escola';
    default: return 'Personalizada';
  }
};

export function RoutineCard({ routine, onClick, completedSteps = 0, totalSteps = 0 }: RoutineCardProps) {
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = totalSteps > 0 && completedSteps >= totalSteps;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl group ${
          isComplete ? 'border-2 border-success/30' : 'border-2 border-transparent hover:border-primary/40'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className={`flex bg-gradient-to-r ${getRoutineGradient(routine.routine_type)}`}>
            {/* Icon */}
            <div className="flex-shrink-0 h-32 w-32 flex items-center justify-center bg-background/50">
              {isComplete ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                  <span className="text-[10px] font-medium text-success">Concluída</span>
                </div>
              ) : (
                getRoutineIcon(routine.routine_type, routine.icon)
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                    {getRoutineLabel(routine.routine_type)}
                  </span>
                  {routine.is_template && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Modelo
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {routine.title}
                </h3>
                {routine.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {routine.description}
                  </p>
                )}
              </div>
              
              <div className="mt-3">
                {isComplete ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-success font-medium">✓ Todos os {totalSteps} passos completos</span>
                    <span className="text-xs text-primary font-medium group-hover:underline">Ver / Recomeçar →</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{totalSteps > 0 ? `${completedSteps} de ${totalSteps} passos` : 'Carregando...'}</span>
                      {totalSteps > 0 && <span>{Math.round(progress)}%</span>}
                    </div>
                    <Progress value={progress} className="h-2" />
                  </>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex items-center pr-4">
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
