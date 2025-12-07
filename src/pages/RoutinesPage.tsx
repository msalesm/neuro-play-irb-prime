import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, School, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoutines, useRoutineSteps, useStoryProgress } from '@/hooks/useRoutines';
import { RoutineCard } from '@/components/stories/RoutineCard';
import { GamificationBadge } from '@/components/stories/GamificationBadge';
import { useTelemetry } from '@/hooks/useTelemetry';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoutinesPage() {
  const navigate = useNavigate();
  const { routines, loading } = useRoutines();
  const { points, completedCount } = useStoryProgress();
  const { trackScreenView } = useTelemetry();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    trackScreenView('routines_page');
  }, [trackScreenView]);

  // Filter routines based on tab
  const filteredRoutines = routines.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'templates') return r.is_template;
    if (activeTab === 'custom') return !r.is_template;
    return true;
  });

  // Group template routines
  const morningRoutines = filteredRoutines.filter(r => r.routine_type === 'manha');
  const schoolRoutines = filteredRoutines.filter(r => r.routine_type === 'escola');
  const nightRoutines = filteredRoutines.filter(r => r.routine_type === 'noite');
  const customRoutines = filteredRoutines.filter(r => r.routine_type === 'custom');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(199,100%,11%)] via-[hsl(194,100%,22%)] to-[hsl(199,100%,11%)] pb-24">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[hsl(40,55%,51%)]" />
              Minhas Rotinas
            </h1>
            <p className="text-white/70">Organize seu dia passo a passo</p>
          </div>
        </motion.div>

        {/* Gamification Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GamificationBadge points={points} completedCount={completedCount} />
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20">
              Todas
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-white data-[state=active]:bg-white/20">
              Modelos
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-white data-[state=active]:bg-white/20">
              Minhas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex">
                    <Skeleton className="h-32 w-32 rounded-none" />
                    <div className="flex-1 p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Routines List */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Morning Routines */}
            {morningRoutines.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-white">Manhã</h2>
                </div>
                <div className="space-y-3">
                  {morningRoutines.map((routine) => (
                    <RoutineCardWithSteps key={routine.id} routine={routine} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* School Routines */}
            {schoolRoutines.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <School className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-white">Escola</h2>
                </div>
                <div className="space-y-3">
                  {schoolRoutines.map((routine) => (
                    <RoutineCardWithSteps key={routine.id} routine={routine} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Night Routines */}
            {nightRoutines.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-white">Noite</h2>
                </div>
                <div className="space-y-3">
                  {nightRoutines.map((routine) => (
                    <RoutineCardWithSteps key={routine.id} routine={routine} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Custom Routines */}
            {customRoutines.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-white">Personalizadas</h2>
                </div>
                <div className="space-y-3">
                  {customRoutines.map((routine) => (
                    <RoutineCardWithSteps key={routine.id} routine={routine} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredRoutines.length === 0 && !loading && (
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/70">Nenhuma rotina encontrada</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Create Button (FAB) */}
        <motion.div
          className="fixed bottom-24 right-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-[hsl(40,55%,51%)] hover:bg-[hsl(40,55%,41%)]"
            onClick={() => navigate('/rotinas/criar')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component to show routine with steps count
function RoutineCardWithSteps({ routine }: { routine: any }) {
  const navigate = useNavigate();
  const { steps } = useRoutineSteps(routine.id);
  const completedSteps = steps.filter(s => s.is_completed).length;

  return (
    <RoutineCard
      routine={routine}
      onClick={() => navigate(`/rotinas/${routine.id}`)}
      completedSteps={completedSteps}
      totalSteps={steps.length}
    />
  );
}
