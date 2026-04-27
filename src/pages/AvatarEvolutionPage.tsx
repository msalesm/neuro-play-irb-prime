import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { AvatarEvolutionCard } from '@/components/gamification/AvatarEvolutionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AvatarEvolutionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { avatarEvolution, badgeProgress, loading } = useAchievementSystem(user?.id);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground p-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-3 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-7 w-7" />
            <h1 className="text-2xl md:text-3xl font-bold">Evolução do Avatar</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            Acompanhe a jornada de progresso através dos jogos cognitivos.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <AvatarEvolutionCard
          stage={avatarEvolution.stage}
          xp={avatarEvolution.xp}
          nextStageXp={avatarEvolution.nextStageXp}
          unlockedAccessories={avatarEvolution.unlockedAccessories}
        />

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Progresso de medalha</h3>
              <span className="text-xs uppercase font-bold text-muted-foreground">
                {badgeProgress.level}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, badgeProgress.percentage)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {badgeProgress.current} de {badgeProgress.required} para próximo nível
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate('/conquistas')}>
            Ver conquistas
          </Button>
          <Button onClick={() => navigate('/games')}>
            Jogar agora
          </Button>
        </div>
      </div>
    </div>
  );
}
