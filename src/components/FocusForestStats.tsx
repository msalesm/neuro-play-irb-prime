import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Trees, Clock, Award } from "lucide-react";

interface FocusForestStatsProps {
  stats: {
    totalSessions: number;
    bestAccuracy: number;
    totalTreesGrown: number;
    currentStreak: number;
    bestAccuracyPerLevel: Record<number, number>;
    recentSessions: any[];
  };
  currentSession?: {
    hits: number;
    misses: number;
    accuracy: number;
    treesGrown: number;
    level: number;
  };
}

export function FocusForestStats({ stats, currentSession }: FocusForestStatsProps) {
  const getCurrentLevelProgress = () => {
    if (!currentSession) return { current: 0, next: 10 };
    
    // Critérios para próximo nível baseado em hits necessários
    const levelRequirements = [0, 5, 10, 15, 20, 25]; // hits necessários para cada nível
    const currentLevel = currentSession.level;
    const nextLevelRequirement = levelRequirements[currentLevel + 1] || 30;
    
    return {
      current: currentSession.hits,
      next: nextLevelRequirement
    };
  };

  const getAccuracyTrend = () => {
    if (stats.recentSessions.length < 2) return 0;
    
    const recent = stats.recentSessions.slice(0, 3);
    const oldAvg = recent.slice(1).reduce((sum, s) => sum + s.accuracy, 0) / (recent.length - 1);
    const latest = recent[0].accuracy;
    
    return latest - oldAvg;
  };

  const levelProgress = getCurrentLevelProgress();
  const accuracyTrend = getAccuracyTrend();

  return (
    <div className="space-y-4">
      {/* Estatísticas da Sessão Atual */}
      {currentSession && (
        <Card className="shadow-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Sessão Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Precisão Atual</span>
                <span className="text-sm font-bold text-green-600">
                  {currentSession.accuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={currentSession.accuracy} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/60 rounded">
                <div className="text-lg font-bold text-green-600">{currentSession.hits}</div>
                <div className="text-xs text-green-700">Acertos</div>
              </div>
              <div className="p-2 bg-white/60 rounded">
                <div className="text-lg font-bold text-red-600">{currentSession.misses}</div>
                <div className="text-xs text-red-700">Erros</div>
              </div>
              <div className="p-2 bg-white/60 rounded">
                <div className="text-lg font-bold text-blue-600">{currentSession.treesGrown}</div>
                <div className="text-xs text-blue-700">Árvores</div>
              </div>
            </div>

            {/* Progresso para próximo nível */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Próximo Nível</span>
                <span className="text-sm">{levelProgress.current}/{levelProgress.next}</span>
              </div>
              <Progress 
                value={(levelProgress.current / levelProgress.next) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Gerais */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-xs text-blue-700">Sessões Totais</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.bestAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-green-700">Melhor Precisão</div>
            </div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trees className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{stats.totalTreesGrown}</span>
            </div>
            <div className="text-xs text-purple-700">Árvores Cultivadas</div>
          </div>

          {/* Tendência de precisão */}
          {stats.recentSessions.length > 1 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Tendência</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${
                  accuracyTrend > 0 ? 'text-green-600' : accuracyTrend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {accuracyTrend > 0 ? '+' : ''}{accuracyTrend.toFixed(1)}%
                </span>
                <Badge variant={accuracyTrend > 0 ? 'default' : 'secondary'} className="text-xs">
                  {accuracyTrend > 0 ? '📈' : accuracyTrend < 0 ? '📉' : '➡️'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Melhor Precisão por Nível */}
      {Object.keys(stats.bestAccuracyPerLevel).length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recordes por Nível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.bestAccuracyPerLevel)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, accuracy]) => (
                <div key={level} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Nível {level}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Number(accuracy)} className="w-16 h-2" />
                    <span className="text-sm font-bold text-green-600 min-w-[3rem]">
                      {Number(accuracy).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}