import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Volume2, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSocialStories, useStorySteps } from '@/hooks/useSocialStories';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { getStepImage } from '@/lib/storyStepImages';

export default function StoryReader() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { stories } = useSocialStories();
  const { steps, loading, error } = useStorySteps(storyId || null);
  const { trackStoryStart, trackStepView, trackStoryEnd } = useTelemetry();
  const { profile } = useAccessibility();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const story = stories.find(s => s.id === storyId);
  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  // Track story start
  useEffect(() => {
    if (story && steps.length > 0 && !hasStarted) {
      trackStoryStart(story.id, story.title);
      setHasStarted(true);
    }
  }, [story, steps.length, hasStarted, trackStoryStart]);

  // Track step view
  useEffect(() => {
    if (currentStep && hasStarted) {
      trackStepView(storyId!, currentStep.order_number, currentStep.title);
    }
  }, [currentStep, storyId, hasStarted, trackStepView]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Story completed
      setIsCompleted(true);
      if (story) {
        trackStoryEnd(story.id, story.title, steps.length);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePlayAudio = useCallback(() => {
    if (currentStep?.audio_url) {
      const audio = new Audio(currentStep.audio_url);
      audio.play();
    } else if (currentStep) {
      // Use TTS
      const utterance = new SpeechSynthesisUtterance(
        `${currentStep.title}. ${currentStep.description || ''}`
      );
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, [currentStep]);

  const handleFinish = () => {
    navigate('/stories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-64 w-64 mx-auto mb-4 rounded-xl" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">História não encontrada</h2>
            <p className="text-muted-foreground mb-4">{error || 'Esta história não está disponível'}</p>
            <Button onClick={() => navigate('/stories')}>
              Voltar às Histórias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Card className="max-w-md w-full">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="h-24 w-24 mx-auto mb-6 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Parabéns! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                Você completou a história "{story.title}"
              </p>
              <Button onClick={handleFinish} size="lg" className="w-full">
                Voltar às Histórias
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="container max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/stories')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate flex-1">{story.title}</h1>
            <span className="text-sm text-muted-foreground">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: profile.reducedMotion ? 0 : 0.3 }}
            >
              <Card className="overflow-hidden">
                {/* Image */}
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {(() => {
                    // Prioriza imagens do sistema de mapeamento (importadas como ES6 modules)
                    const mappedImage = getStepImage(storyId!, currentStepIndex);
                    const imageUrl = mappedImage || currentStep.image_url;
                    if (imageUrl) {
                      return (
                        <img
                          src={imageUrl}
                          alt={currentStep.title}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    return (
                      <div className="text-center p-8">
                        <div className="text-8xl mb-4">
                          {getStepEmoji(currentStepIndex)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Text Content */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 
                      className="text-xl font-bold text-foreground leading-normal pb-1"
                      style={{ fontSize: `${1.25 * profile.fontScale}rem`, lineHeight: 1.4 }}
                    >
                      {currentStep.title}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePlayAudio}
                      title="Ouvir"
                      style={{ 
                        minHeight: `${profile.touchTargetSizePx}px`,
                        minWidth: `${profile.touchTargetSizePx}px`,
                      }}
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {currentStep.description && (
                    <p 
                      className="text-muted-foreground leading-loose pb-2"
                      style={{ fontSize: `${profile.fontScale}rem`, lineHeight: 1.8 }}
                    >
                      {currentStep.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-20 bg-background border-t px-4 py-4">
        <div className="container max-w-2xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex-1"
            style={{ 
              minHeight: `${profile.touchTargetSizePx}px`,
            }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
            style={{ 
              minHeight: `${profile.touchTargetSizePx}px`,
            }}
          >
            {currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}
            {currentStepIndex < steps.length - 1 && <ArrowRight className="h-5 w-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji based on step index
function getStepEmoji(index: number): string {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[index] || '📖';
}
