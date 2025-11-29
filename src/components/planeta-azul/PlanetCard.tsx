import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, CheckCircle2, Trophy } from 'lucide-react';
import type { Planeta } from '@/types/planeta';

interface PlanetCardProps {
  planeta: Planeta;
  onClick?: () => void;
}

export function PlanetCard({ planeta, onClick }: PlanetCardProps) {
  const navigate = useNavigate();
  const progressoPercentual = (planeta.progressoAtual / planeta.totalMissoes) * 100;

  return (
    <Card 
      className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-2"
      style={{ 
        borderColor: planeta.desbloqueado ? planeta.cor : 'hsl(var(--border))',
        background: `linear-gradient(135deg, ${planeta.cor}15, transparent)`
      }}
      onClick={onClick}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {!planeta.desbloqueado ? (
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Bloqueado
          </Badge>
        ) : planeta.progressoAtual === planeta.totalMissoes ? (
          <Badge className="gap-1 bg-accent text-accent-foreground">
            <Trophy className="w-3 h-3" />
            Completo
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Ativo
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
            style={{ backgroundColor: `${planeta.cor}25` }}
          >
            {planeta.icone}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{planeta.nome}</CardTitle>
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: `${planeta.cor}25`,
                color: planeta.cor 
              }}
            >
              {planeta.diagnostico}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {planeta.descricao}
        </CardDescription>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">
              {planeta.progressoAtual}/{planeta.totalMissoes} missões
            </span>
          </div>
          <Progress value={progressoPercentual} className="h-2" />
        </div>

        {/* Focos */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Focos Terapêuticos
          </p>
          <div className="flex flex-wrap gap-1">
            {planeta.focos.slice(0, 3).map((foco, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {foco}
              </Badge>
            ))}
            {planeta.focos.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{planeta.focos.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Jogos */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Jogos Disponíveis
          </p>
          <div className="grid grid-cols-2 gap-2">
            {planeta.jogos.slice(0, 4).map((jogo) => (
              <Button
                key={jogo.id}
                variant="ghost"
                size="sm"
                className="h-auto py-2 px-2 flex flex-col items-start gap-1 hover:bg-secondary/50 relative"
                onClick={(e) => {
                  e.stopPropagation();
                  if (planeta.desbloqueado) navigate(jogo.rota);
                }}
                disabled={!planeta.desbloqueado}
              >
                {jogo.novo && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 px-1.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-lg animate-pulse"
                  >
                    NOVO
                  </Badge>
                )}
                <div className="flex items-center gap-1 w-full">
                  <span className="text-base">{jogo.icone}</span>
                  {jogo.completado && (
                    <CheckCircle2 className="w-3 h-3 text-accent ml-auto" />
                  )}
                </div>
                <span className="text-xs text-left line-clamp-2">
                  {jogo.nome}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recompensa */}
        <div 
          className="rounded-lg p-3 text-xs"
          style={{ 
            backgroundColor: `${planeta.cor}15`,
            borderLeft: `3px solid ${planeta.cor}`
          }}
        >
          <p className="font-semibold mb-1" style={{ color: planeta.cor }}>
            🏆 Recompensa Final
          </p>
          <p className="text-muted-foreground">{planeta.recompensa}</p>
        </div>

        <Button 
          className="w-full"
          disabled={!planeta.desbloqueado}
          onClick={(e) => {
            e.stopPropagation();
            if (planeta.desbloqueado) navigate(`/planeta/${planeta.id}`);
          }}
          style={{
            backgroundColor: planeta.desbloqueado ? planeta.cor : undefined,
            color: planeta.desbloqueado ? 'white' : undefined
          }}
        >
          {planeta.desbloqueado ? 'Explorar Planeta' : 'Planeta Bloqueado'}
        </Button>
      </CardContent>
    </Card>
  );
}