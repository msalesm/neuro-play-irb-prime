import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRoutines, useRoutineSteps, useStoryProgress } from '@/hooks/useRoutines';
import { StepCheckbox } from '@/components/stories/StepCheckbox';
import { TTSButton } from '@/components/stories/TTSButton';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RoutineViewer() {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { routines } = useRoutines();
  const { steps, loading, toggleStepComplete, resetAllSteps } = useRoutineSteps(routineId || null);
  const { recordProgress } = useStoryProgress();
  const { profile } = useAccessibility();
  
  const [showComplete, setShowComplete] = useState(false);

  const routine = routines.find(r => r.id === routineId);
  const completedSteps = steps.filter(s => s.is_completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const isComplete = completedSteps === steps.length && steps.length > 0;

  useEffect(() => {
    if (isComplete && !showComplete) {
      setShowComplete(true);
      recordProgress('routine', routineId!, 15);
      toast.success('Rotina completa! +15 pontos 🎉');
    }
  }, [isComplete, showComplete, routineId, recordProgress]);

  const handleReset = async () => {
    await resetAllSteps();
    setShowComplete(false);
    toast.info('Rotina reiniciada');
  };

  const handleToggleStep = async (stepId: string, currentValue: boolean) => {
    await toggleStepComplete(stepId, !currentValue);
    if (!currentValue) {
      toast.success('Passo concluído! ⭐');
    }
  };

  if (!routine) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(199,100%,11%)] via-[hsl(194,100%,22%)] to-[hsl(199,100%,11%)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Rotina não encontrada</p>
            <Button onClick={() => navigate('/rotinas')} className="mt-4">
              Voltar às Rotinas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(199,100%,11%)] via-[hsl(194,100%,22%)] to-[hsl(199,100%,11%)] pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate('/rotinas')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{routine.title}</h1>
            <p className="text-white/70 text-sm">{routine.description}</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleReset} className="text-white border-white/30">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Progress */}
        <Card className="mb-6 bg-white/10 border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>{completedSteps} de {steps.length} passos</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Completion Celebration */}
        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50">
                <CardContent className="p-6 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-2">Parabéns! 🎉</h2>
                  <p className="text-white/80">Você completou toda a rotina!</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-[hsl(40,55%,51%)]">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-bold">+15 pontos</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps List */}
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-24 bg-white/5" />
              </Card>
            ))
          ) : (
            steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-all ${step.is_completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/20'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Step number */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        step.is_completed ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-semibold text-white ${step.is_completed ? 'line-through opacity-70' : ''}`}
                          style={{ fontSize: `${1.1 * profile.fontScale}rem` }}
                        >
                          {step.title}
                        </h3>
                        {step.description && (
                          <p 
                            className="text-white/70 mt-1"
                            style={{ fontSize: `${profile.fontScale}rem` }}
                          >
                            {step.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <TTSButton 
                          text={`${step.title}. ${step.description || ''}`}
                          variant="ghost"
                          className="text-white hover:bg-white/10"
                        />
                        <StepCheckbox
                          checked={step.is_completed}
                          onChange={() => handleToggleStep(step.id, step.is_completed)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
