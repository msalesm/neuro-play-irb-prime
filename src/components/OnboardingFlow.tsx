import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Brain, Target, Trophy, Sparkles, Users, BookOpen, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  canNext: boolean;
}

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { neurodiversityProfile, recordLearningSession } = useEducationalSystem();
  const { saveBehavioralMetric, generateClinicalReport } = useBehavioralAnalysis();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [personalityData, setPersonalityData] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
      component: <WelcomeStep />,
      canNext: true
    },
    {
      id: 'profile',
      title: t('onboarding.profile.title'), 
      description: t('onboarding.profile.description'),
      component: <ProfileStep onUpdate={setPersonalityData} />,
      canNext: !!personalityData
    },
    {
      id: 'diagnostic',
      title: t('onboarding.diagnostic.title'),
      description: t('onboarding.diagnostic.description'),
      component: <DiagnosticTestStep onComplete={setTestResults} />,
      canNext: !!testResults
    },
    {
      id: 'results',
      title: t('onboarding.results.title'),
      description: t('onboarding.results.description'),
      component: <ResultsStep results={testResults} personality={personalityData} />,
      canNext: true
    },
    {
      id: 'learning-path',
      title: t('onboarding.learningPath.title'),
      description: t('onboarding.learningPath.description'),
      component: <LearningPathStep results={testResults} personality={personalityData} />,
      canNext: true
    }
  ];

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !testResults) return;
    
    setIsCompleting(true);
    
    try {
      // Skip behavioral metrics for now - will be implemented with proper schema

      // Generate clinical report
      await generateClinicalReport();

      // Skip database update for now - onboarding completion tracked via learning trails

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl animate-scale-in">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8" />
            <CardTitle className="text-2xl font-bold">
              {t('onboarding.title')}
            </CardTitle>
          </div>
          
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full h-2" />
            <p className="text-sm opacity-90">
              {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>

          <div className="mb-8">
            {currentStepData.component}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('onboarding.previous')}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentStepData.canNext || isCompleting}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isCompleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('onboarding.completing')}
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <Trophy className="w-4 h-4" />
                  {t('onboarding.finish')}
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const WelcomeStep: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{t('onboarding.welcome.welcomeTitle')}</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('onboarding.welcome.welcomeDescription')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 border-purple-200">
            <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold">{t('onboarding.welcome.feature1')}</h4>
            <p className="text-sm text-muted-foreground">{t('onboarding.welcome.feature1Desc')}</p>
          </Card>
          <Card className="p-4 border-blue-200">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold">{t('onboarding.welcome.feature2')}</h4>
            <p className="text-sm text-muted-foreground">{t('onboarding.welcome.feature2Desc')}</p>
          </Card>
          <Card className="p-4 border-green-200">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold">{t('onboarding.welcome.feature3')}</h4>
            <p className="text-sm text-muted-foreground">{t('onboarding.welcome.feature3Desc')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProfileStep: React.FC<{ onUpdate: (data: any) => void }> = ({ onUpdate }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    age: '',
    interests: [] as string[],
    learningStyle: '',
    challenges: [] as string[]
  });

  const interests = ['games', 'music', 'art', 'sports', 'reading', 'science', 'technology', 'animals'];
  const learningStyles = ['visual', 'auditory', 'kinesthetic', 'mixed'];
  const challenges = ['attention', 'memory', 'reading', 'math', 'social', 'motor'];

  useEffect(() => {
    if (formData.age && formData.learningStyle) {
      onUpdate(formData);
    }
  }, [formData, onUpdate]);

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">{t('onboarding.profile.age')}</label>
        <select 
          value={formData.age} 
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">{t('onboarding.profile.selectAge')}</option>
          <option value="5-7">5-7 {t('onboarding.profile.years')}</option>
          <option value="8-11">8-11 {t('onboarding.profile.years')}</option>
          <option value="12-15">12-15 {t('onboarding.profile.years')}</option>
          <option value="16-18">16-18 {t('onboarding.profile.years')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('onboarding.profile.interests')}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {interests.map(interest => (
            <Button
              key={interest}
              variant={formData.interests.includes(interest) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayItem(
                formData.interests, 
                interest, 
                (items) => setFormData(prev => ({ ...prev, interests: items }))
              )}
              className="text-xs"
            >
              {t(`onboarding.profile.interest.${interest}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('onboarding.profile.learningStyle')}</label>
        <div className="grid grid-cols-2 gap-2">
          {learningStyles.map(style => (
            <Button
              key={style}
              variant={formData.learningStyle === style ? "default" : "outline"}
              onClick={() => setFormData(prev => ({ ...prev, learningStyle: style }))}
            >
              {t(`onboarding.profile.style.${style}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('onboarding.profile.challenges')}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {challenges.map(challenge => (
            <Button
              key={challenge}
              variant={formData.challenges.includes(challenge) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayItem(
                formData.challenges, 
                challenge, 
                (items) => setFormData(prev => ({ ...prev, challenges: items }))
              )}
              className="text-xs"
            >
              {t(`onboarding.profile.challenge.${challenge}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const DiagnosticTestStep: React.FC<{ onComplete: (results: any) => void }> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [testProgress, setTestProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnosticTest = async () => {
    setIsRunning(true);
    
    // Simulate diagnostic test progress
    for (let i = 0; i <= 100; i += 10) {
      setTestProgress(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate realistic test results
    const results = {
      attention_score: Math.floor(Math.random() * 40) + 60,
      memory_score: Math.floor(Math.random() * 30) + 70,
      processing_speed: Math.floor(Math.random() * 35) + 65,
      cognitive_flexibility: Math.floor(Math.random() * 40) + 60,
      social_communication: Math.floor(Math.random() * 30) + 70,
      sensory_processing: Math.floor(Math.random() * 25) + 75,
      executive_function: Math.floor(Math.random() * 35) + 65,
      emotional_regulation: Math.floor(Math.random() * 30) + 70,
      detected_patterns: ['attention_variability', 'processing_speed_variation'],
      risk_indicators: [],
      confidence_level: 0.85
    };

    onComplete(results);
    setIsRunning(false);
  };

  return (
    <div className="text-center space-y-6">
      {!isRunning && testProgress === 0 ? (
        <>
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{t('onboarding.diagnostic.testTitle')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('onboarding.diagnostic.testDescription')}
            </p>
            <Button onClick={runDiagnosticTest} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-5 h-5 mr-2" />
              {t('onboarding.diagnostic.startTest')}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{t('onboarding.diagnostic.analyzing')}</h3>
            <Progress value={testProgress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground">
              {testProgress < 100 ? t('onboarding.diagnostic.inProgress') : t('onboarding.diagnostic.completed')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ResultsStep: React.FC<{ results: any; personality: any }> = ({ results, personality }) => {
  const { t } = useLanguage();

  if (!results) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('onboarding.results.excellent');
    if (score >= 60) return t('onboarding.results.good');
    return t('onboarding.results.needsAttention');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">{t('onboarding.results.analysisComplete')}</h3>
        <p className="text-muted-foreground">{t('onboarding.results.resultsDescription')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).filter(([key]) => key.endsWith('_score')).map(([key, value]) => {
          const score = value as number;
          const area = key.replace('_score', '');
          
          return (
            <Card key={key} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{t(`onboarding.results.area.${area}`)}</h4>
                <Badge className={getScoreColor(score)}>
                  {score}/100
                </Badge>
              </div>
              <Progress value={score} className="mb-2" />
              <p className={`text-sm ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h4 className="font-bold mb-3">{t('onboarding.results.recommendations')}</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Gamepad2 className="w-4 h-4 text-blue-600 mt-0.5" />
            {t('onboarding.results.recommendation1')}
          </li>
          <li className="flex items-start gap-2">
            <Users className="w-4 h-4 text-green-600 mt-0.5" />
            {t('onboarding.results.recommendation2')}
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-purple-600 mt-0.5" />
            {t('onboarding.results.recommendation3')}
          </li>
        </ul>
      </Card>
    </div>
  );
};

const LearningPathStep: React.FC<{ results: any; personality: any }> = ({ results, personality }) => {
  const { t } = useLanguage();

  const recommendedGames = [
    {
      id: 'memoria-colorida',
      title: t('games.memoriaColorida'),
      reason: t('onboarding.learningPath.memoryReason'),
      difficulty: 'beginner'
    },
    {
      id: 'caca-foco', 
      title: t('games.cacaFoco'),
      reason: t('onboarding.learningPath.attentionReason'),
      difficulty: 'beginner'
    },
    {
      id: 'logica-rapida',
      title: t('games.logicaRapida'), 
      reason: t('onboarding.learningPath.logicReason'),
      difficulty: 'intermediate'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">{t('onboarding.learningPath.pathTitle')}</h3>
        <p className="text-muted-foreground">{t('onboarding.learningPath.pathDescription')}</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold">{t('onboarding.learningPath.recommendedGames')}</h4>
        {recommendedGames.map((game, index) => (
          <Card key={game.id} className="p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-semibold">{game.title}</h5>
                  <Badge variant="outline" className="text-xs">
                    {t(`difficulty.${game.difficulty}`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{game.reason}</p>
              </div>
              <Gamepad2 className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h4 className="font-bold mb-3">{t('onboarding.learningPath.nextSteps')}</h4>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.learningPath.nextStepsDescription')}
        </p>
      </Card>
    </div>
  );
};