import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Lock } from "lucide-react";

interface Achievement {
  name: string;
  title: string;
  description: string;
  icon: string;
  stars_reward: number;
}

interface SocialScenariosAchievementsProps {
  achievements: Achievement[];
  unlockedAchievements: string[];
}

export const SocialScenariosAchievements = ({ 
  achievements, 
  unlockedAchievements 
}: SocialScenariosAchievementsProps) => {
  return (
    <Card className="p-6 bg-card border-0 shadow-card">
      <h3 className="font-semibold mb-4 flex items-center">
        <span className="text-lg">🏆</span>
        <span className="ml-2">Conquistas Sociais</span>
      </h3>
      
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.name);
          
          return (
            <div
              key={achievement.name}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isUnlocked 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/50'
              }`}
            >
              <div className="text-2xl">
                {isUnlocked ? achievement.icon : '🔒'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium text-sm ${
                    isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {achievement.title}
                  </h4>
                  {isUnlocked && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {!isUnlocked && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <p className={`text-xs ${
                  isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                }`}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={isUnlocked ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {achievement.stars_reward} ⭐
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="text-center text-sm text-muted-foreground">
          {unlockedAchievements.length}/{achievements.length} conquistas desbloqueadas
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ 
              width: `${(unlockedAchievements.length / achievements.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </Card>
  );
};