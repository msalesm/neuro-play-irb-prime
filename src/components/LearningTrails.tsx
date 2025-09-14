import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Eye, 
  Calculator, 
  BookOpen, 
  Users, 
  Trophy, 
  Star,
  Lock,
  Play,
  CheckCircle,
  ArrowRight,
  Crown,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEducationalSystem } from '@/hooks/useEducationalSystem';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Trail {
  id: string;
  category: string;
  icon: any;
  color: string;
  gradient: string;
  level: number;
  xp: number;
  maxXp: number;
  games: TrailGame[];
  unlocked: boolean;
  mastered: boolean;
}

interface TrailGame {
  id: string;
  name: string;
  xp: number;
  completed: boolean;
  unlocked: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const LearningTrails: React.FC = () => {
  const { learningTrails } = useEducationalSystem();
  const { t } = useLanguage();
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);

  // Create Duolingo-style trails data
  const trails: Trail[] = [
    {
      id: 'memory',
      category: t('trails.memory'),
      icon: Brain,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-purple-700',
      level: 3,
      xp: 1240,
      maxXp: 2000,
      unlocked: true,
      mastered: false,
      games: [
        { id: 'memoria-colorida', name: t('games.memoriaColorida'), xp: 320, completed: true, unlocked: true, difficulty: 'easy' },
        { id: 'memoria-espacial', name: t('games.memoriaEspacial'), xp: 480, completed: true, unlocked: true, difficulty: 'medium' },
        { id: 'memoria-sequencial', name: t('games.memoriaSequencial'), xp: 440, completed: false, unlocked: true, difficulty: 'medium' },
        { id: 'memoria-avancada', name: t('games.memoriaAvancada'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    },
    {
      id: 'attention',
      category: t('trails.attention'),
      icon: Target,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      level: 2,
      xp: 850,
      maxXp: 1500,
      unlocked: true,
      mastered: false,
      games: [
        { id: 'caca-foco', name: t('games.cacaFoco'), xp: 400, completed: true, unlocked: true, difficulty: 'easy' },
        { id: 'atencao-seletiva', name: t('games.atencaoSeletiva'), xp: 450, completed: true, unlocked: true, difficulty: 'medium' },
        { id: 'atencao-dividida', name: t('games.atencaoDividida'), xp: 0, completed: false, unlocked: true, difficulty: 'hard' },
        { id: 'atencao-sustentada', name: t('games.atencaoSustentada'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    },
    {
      id: 'logic',
      category: t('trails.logic'),
      icon: Calculator,
      color: '#10B981',
      gradient: 'from-green-500 to-green-700',
      level: 1,
      xp: 320,
      maxXp: 1000,
      unlocked: true,
      mastered: false,
      games: [
        { id: 'logica-rapida', name: t('games.logicaRapida'), xp: 320, completed: true, unlocked: true, difficulty: 'easy' },
        { id: 'padroes-logicos', name: t('games.padroesLogicos'), xp: 0, completed: false, unlocked: true, difficulty: 'medium' },
        { id: 'raciocinio-abstrato', name: t('games.raciocinioAbstrato'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    },
    {
      id: 'language',
      category: t('trails.language'),
      icon: BookOpen,
      color: '#F59E0B',
      gradient: 'from-yellow-500 to-orange-600',
      level: 2,
      xp: 680,
      maxXp: 1200,
      unlocked: true,
      mastered: false,
      games: [
        { id: 'silaba-magica', name: t('games.silabaMagica'), xp: 380, completed: true, unlocked: true, difficulty: 'easy' },
        { id: 'caca-letras', name: t('games.cacaLetras'), xp: 300, completed: true, unlocked: true, difficulty: 'easy' },
        { id: 'contador-historias', name: t('games.contadorHistorias'), xp: 0, completed: false, unlocked: true, difficulty: 'medium' },
        { id: 'vocabulario-avancado', name: t('games.vocabularioAvancado'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    },
    {
      id: 'social',
      category: t('trails.social'),
      icon: Users,
      color: '#EF4444',
      gradient: 'from-red-500 to-pink-600',
      level: 1,
      xp: 0,
      maxXp: 800,
      unlocked: false,
      mastered: false,
      games: [
        { id: 'social-scenarios', name: t('games.socialScenarios'), xp: 0, completed: false, unlocked: false, difficulty: 'easy' },
        { id: 'emocoes-basicas', name: t('games.emocoes'), xp: 0, completed: false, unlocked: false, difficulty: 'medium' },
        { id: 'comunicacao-social', name: t('games.comunicacao'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    },
    {
      id: 'executive',
      category: t('trails.executive'),
      icon: Crown,
      color: '#7C3AED',
      gradient: 'from-violet-500 to-purple-700',
      level: 1,
      xp: 0,
      maxXp: 1500,
      unlocked: false,
      mastered: false,
      games: [
        { id: 'planejamento', name: t('games.planejamento'), xp: 0, completed: false, unlocked: false, difficulty: 'medium' },
        { id: 'flexibilidade-cognitiva', name: t('games.flexibilidade'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' },
        { id: 'controle-inibitorio', name: t('games.controleInibitorio'), xp: 0, completed: false, unlocked: false, difficulty: 'hard' }
      ]
    }
  ];

  const TrailCard: React.FC<{ trail: Trail }> = ({ trail }) => {
    const progressPercentage = (trail.xp / trail.maxXp) * 100;
    const completedGames = trail.games.filter(g => g.completed).length;
    const totalGames = trail.games.length;

    return (
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer",
          trail.unlocked ? "border-2 hover:border-primary/50" : "opacity-60 cursor-not-allowed"
        )}
        onClick={() => trail.unlocked && setSelectedTrail(trail.id)}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${trail.gradient} opacity-10`} />
        
        {/* Unlock overlay */}
        {!trail.unlocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">{t('trails.locked')}</p>
            </div>
          </div>
        )}

        <CardHeader className="relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: trail.color }}
              >
                <trail.icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{trail.category}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{t('trails.level')} {trail.level}</span>
                </div>
              </div>
            </div>
            
            {trail.mastered && (
              <Trophy className="w-6 h-6 text-yellow-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-20 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{trail.xp} XP</span>
              <span>{trail.maxXp} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {completedGames}/{totalGames} {t('trails.gamesCompleted')}
            </span>
            <Badge variant={trail.unlocked ? 'default' : 'secondary'}>
              {trail.unlocked ? t('trails.available') : t('trails.locked')}
            </Badge>
          </div>

          {trail.unlocked && (
            <Button 
              className="w-full" 
              style={{ backgroundColor: trail.color }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTrail(trail.id);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              {t('trails.explore')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const TrailDetail: React.FC<{ trail: Trail }> = ({ trail }) => (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: trail.color }}
            >
              <trail.icon className="w-6 h-6" />
            </div>
            <CardTitle>{trail.category} - {t('trails.gameSequence')}</CardTitle>
          </div>
          <Button variant="outline" onClick={() => setSelectedTrail(null)}>
            {t('common.close')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {trail.games.map((game, index) => (
            <div 
              key={game.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-all",
                game.unlocked ? "hover:bg-muted/50" : "opacity-60"
              )}
            >
              {/* Game number and status */}
              <div className="relative">
                {game.completed ? (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : game.unlocked ? (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: trail.color }}
                  >
                    {index + 1}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                
                {/* Connection line */}
                {index < trail.games.length - 1 && (
                  <div className="absolute top-10 left-5 w-px h-8 bg-gray-300" />
                )}
              </div>

              {/* Game info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{game.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      game.difficulty === 'easy' && "border-green-300 text-green-700",
                      game.difficulty === 'medium' && "border-yellow-300 text-yellow-700",
                      game.difficulty === 'hard' && "border-red-300 text-red-700"
                    )}
                  >
                    {t(`difficulty.${game.difficulty}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{game.xp} XP {t('trails.earned')}</span>
                  {game.completed && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t('trails.completed')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action button */}
              {game.unlocked && (
                <Button
                  variant={game.completed ? "outline" : "default"}
                  size="sm"
                  asChild
                  style={!game.completed ? { backgroundColor: trail.color } : {}}
                >
                  <Link to={`/games/${game.id}`} className="flex items-center gap-2">
                    {game.completed ? (
                      <>
                        <Star className="w-4 h-4" />
                        {t('trails.review')}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {t('trails.play')}
                      </>
                    )}
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const selectedTrailData = trails.find(t => t.id === selectedTrail);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{t('trails.title')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('trails.description')}
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">2,150</div>
          <div className="text-sm text-muted-foreground">{t('trails.totalXP')}</div>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">{t('trails.gamesCompleted')}</div>
        </Card>
        <Card className="p-4 text-center">
          <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">7</div>
          <div className="text-sm text-muted-foreground">{t('trails.currentStreak')}</div>
        </Card>
        <Card className="p-4 text-center">
          <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-muted-foreground">{t('trails.level')}</div>
        </Card>
      </div>

      {/* Trails grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trails.map((trail) => (
          <TrailCard key={trail.id} trail={trail} />
        ))}
      </div>

      {/* Trail detail */}
      {selectedTrailData && <TrailDetail trail={selectedTrailData} />}
    </div>
  );
};