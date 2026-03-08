import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, UserPlus } from 'lucide-react';
import { FamilyProgressSection } from '@/components/dashboard/FamilyProgressSection';
import type { SessionData } from '@/hooks/useParentDashboard';

interface ParentEmptyStateProps {
  sessions: SessionData[];
  onAddChild: () => void;
}

export function ParentEmptyState({ sessions, onAddChild }: ParentEmptyStateProps) {
  return (
    <div className="space-y-8">
      <FamilyProgressSection />

      {sessions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Seu Histórico de Jogos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-primary/5">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Jogos Completados</div>
            </Card>
            <Card className="p-4 bg-success/10">
              <div className="text-2xl font-bold">
                {Math.round(sessions.reduce((sum, s) => sum + (s.performance_data?.accuracy || 0), 0) / sessions.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Precisão Média</div>
            </Card>
            <Card className="p-4 bg-info/10">
              <div className="text-2xl font-bold">
                {sessions.reduce((sum, s) => sum + (s.score || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Pontuação Total</div>
            </Card>
          </div>

          <h4 className="font-semibold mb-3">Últimas Sessões</h4>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{session.game_type}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(session.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{session.score} pts</div>
                  <div className="text-sm text-muted-foreground">
                    {session.performance_data?.accuracy?.toFixed(0) || 0}% precisão
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {sessions.length > 0 ? 'Cadastre seu filho para análises detalhadas' : 'Bem-vindo ao NeuroPlay!'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {sessions.length > 0
              ? 'Ao cadastrar o perfil do seu filho, você terá acesso a relatórios cognitivos detalhados, análise preditiva e recomendações personalizadas.'
              : 'Para começar a acompanhar o desenvolvimento do seu filho, cadastre o primeiro perfil.'}
          </p>
          <Button size="lg" onClick={onAddChild}>
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastrar Filho
          </Button>
        </div>
      </Card>
    </div>
  );
}
