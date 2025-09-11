import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, MessageCircle, Heart, Zap } from "lucide-react";

interface SocialProgress {
  skill_type: string;
  current_level: number;
  experience_points: number;
  scenarios_completed: number;
  best_scores: any;
}

interface SocialScenariosProgressProps {
  userProgress: SocialProgress[];
  totalSessions: number;
}

const skillIcons = {
  communication: MessageCircle,
  empathy: Heart,
  assertiveness: Zap,
  conflict_resolution: Users,
};

const skillLabels = {
  communication: 'Comunicação',
  empathy: 'Empatia',
  assertiveness: 'Assertividade',
  conflict_resolution: 'Resolução de Conflitos',
};

export const SocialScenariosProgress = ({ 
  userProgress, 
  totalSessions 
}: SocialScenariosProgressProps) => {
  const getProgressToNextLevel = (level: number, xp: number) => {
    const xpForCurrentLevel = (level - 1) * 50;
    const xpForNextLevel = level * 50;
    const currentLevelXp = xp - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    
    return (currentLevelXp / xpNeededForNext) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6 bg-card border-0 shadow-card">
        <h3 className="font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Progresso Geral
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalSessions}</div>
            <div className="text-sm text-muted-foreground">Cenários Completados</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {userProgress.reduce((sum, p) => sum + p.experience_points, 0)}
            </div>
            <div className="text-sm text-muted-foreground">XP Total</div>
          </div>
        </div>
      </Card>

      {/* Skills Progress */}
      <Card className="p-6 bg-card border-0 shadow-card">
        <h3 className="font-semibold mb-4">Habilidades Sociais</h3>
        
        <div className="space-y-4">
          {['communication', 'empathy', 'assertiveness'].map((skillType) => {
            const progress = userProgress.find(p => p.skill_type === skillType);
            const Icon = skillIcons[skillType as keyof typeof skillIcons];
            const label = skillLabels[skillType as keyof typeof skillLabels];
            
            if (!progress) {
              return (
                <div key={skillType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <Badge variant="outline">Nível 1</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    0 XP - Complete um cenário para começar
                  </div>
                </div>
              );
            }

            const progressPercentage = getProgressToNextLevel(
              progress.current_level, 
              progress.experience_points
            );

            return (
              <div key={skillType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <Badge variant="default">Nível {progress.current_level}</Badge>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress.experience_points} XP</span>
                  <span>{progress.scenarios_completed} cenários</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Best Scores */}
      {userProgress.some(p => p.best_scores && Object.keys(p.best_scores).length > 0) && (
        <Card className="p-6 bg-card border-0 shadow-card">
          <h3 className="font-semibold mb-4">Melhores Pontuações</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {userProgress.map((progress) => {
              if (!progress.best_scores || Object.keys(progress.best_scores).length === 0) return null;
              
              const Icon = skillIcons[progress.skill_type as keyof typeof skillIcons];
              const label = skillLabels[progress.skill_type as keyof typeof skillLabels];
              const score = progress.best_scores[progress.skill_type] || 0;
              
              return (
                <div key={progress.skill_type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Badge variant={score >= 4 ? "default" : "secondary"}>
                    {score}/5
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};