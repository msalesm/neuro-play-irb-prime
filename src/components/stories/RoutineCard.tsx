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
    case 'manha': return <Sun className="h-8 w-8 text-amber-500" />;
    case 'noite': return <Moon className="h-8 w-8 text-indigo-500" />;
    case 'escola': return <School className="h-8 w-8 text-blue-500" />;
    default: return <Settings className="h-8 w-8 text-primary" />;
  }
};

const getRoutineGradient = (type: string) => {
  switch (type) {
    case 'manha': return 'from-amber-500/20 via-orange-500/10 to-transparent';
    case 'noite': return 'from-indigo-500/20 via-purple-500/10 to-transparent';
    case 'escola': return 'from-blue-500/20 via-cyan-500/10 to-transparent';
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
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl group ${
          isComplete ? 'border-2 border-green-500/50 ring-2 ring-green-500/20' : 'border-2 border-transparent hover:border-primary/40'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className={`flex bg-gradient-to-r ${getRoutineGradient(routine.routine_type)}`}>
            {/* Icon */}
            <div className="flex-shrink-0 h-32 w-32 flex items-center justify-center bg-background/50">
              <motion.div
                animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0, repeatDelay: 2 }}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : (
                  getRoutineIcon(routine.routine_type, routine.icon)
                )}
              </motion.div>
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
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{completedSteps} de {totalSteps} passos</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
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
