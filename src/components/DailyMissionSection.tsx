import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Play, Clock, Award, Sparkles, BookOpen, Target, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocialStories } from '@/hooks/useSocialStories';
import type { JogoPlaneta, Planeta } from '@/types/planeta';

interface DailyMission {
  jogo: JogoPlaneta;
  planeta: Planeta;
  recomendadoPorIA: boolean;
}

interface DailyMissionSectionProps {
  missions: DailyMission[];
  loading: boolean;
}

export const DailyMissionSection = ({ missions, loading }: DailyMissionSectionProps) => {
  const navigate = useNavigate();
  const { stories } = useSocialStories();

  // Get new stories (recently added)
  const newStories = stories.filter(s => s.is_active).slice(0, 2);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold">Missão do Dia</h3>
        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
          <Sparkles className="w-3 h-3 mr-1" />
          Sugestões IA
        </Badge>
      </div>

      {/* Suggested Starting Point */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Por onde começar hoje</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Baseado no seu progresso, recomendamos explorar novos conteúdos para desenvolver diferentes habilidades.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3 hover:bg-primary/5"
              onClick={() => navigate('/stories')}
            >
              <BookOpen className="w-4 h-4 mr-2 text-secondary" />
              <div className="text-left">
                <div className="font-medium">Histórias Sociais</div>
                <div className="text-xs text-muted-foreground">
                  {newStories.length} novas disponíveis
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 hover:bg-primary/5"
              onClick={() => navigate('/sistema-planeta-azul')}
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <div className="font-medium">Jogos Cognitivos</div>
                <div className="text-xs text-muted-foreground">
                  5+ jogos novos
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3 hover:bg-primary/5"
              onClick={() => navigate('/diagnostic-tests')}
            >
              <Target className="w-4 h-4 mr-2 text-accent" />
              <div className="text-left">
                <div className="font-medium">Testes Diagnósticos</div>
                <div className="text-xs text-muted-foreground">
                  Acompanhe evolução
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Stories Section */}
      {newStories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              Novas Histórias Sociais
            </h4>
            <Button variant="ghost" size="sm" onClick={() => navigate('/stories')}>
              Ver todas <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {newStories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all border-secondary/20 hover:border-secondary/40"
                  onClick={() => navigate(`/stories/${story.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-xl">
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">{story.title}</h5>
                          <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                            NOVO
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {story.description || 'História social interativa'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Game Missions */}
      {missions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Jogos Recomendados
            </h4>
          </div>
          <div className="space-y-3">
            {missions.slice(0, 3).map((mission, index) => (
              <motion.div
                key={mission.jogo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    mission.recomendadoPorIA 
                      ? 'border-2 border-accent/30 bg-accent/5' 
                      : 'hover:border-primary/30'
                  }`}
                  onClick={() => navigate(mission.jogo.rota)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${mission.planeta.cor}20` }}
                      >
                        {mission.jogo.icone}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold">{mission.jogo.nome}</h5>
                          {mission.jogo.novo && (
                            <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0 animate-pulse">
                              🌟 NOVO
                            </Badge>
                          )}
                          {mission.recomendadoPorIA && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-accent text-accent">
                              <Sparkles className="w-2 h-2 mr-0.5" />
                              IA
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {mission.planeta.icone} {mission.planeta.nome}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {mission.jogo.duracao} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" /> Nível {mission.jogo.dificuldade}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        style={{ backgroundColor: mission.planeta.cor }}
                        className="text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Jogar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};