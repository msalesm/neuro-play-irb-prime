import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RotateCcw, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UnfinishedSession {
  id: string;
  game_type: string;
  level: number;
  performance_data: any;
  created_at: string;
  session_duration_seconds: number;
}

interface SessionRecoveryModalProps {
  open: boolean;
  sessions: UnfinishedSession[];
  onResume: (session: UnfinishedSession) => void;
  onDiscard: (sessionId: string) => void;
  onStartNew: () => void;
}

export const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  open,
  sessions,
  onResume,
  onDiscard,
  onStartNew
}) => {
  const latestSession = sessions[0];

  if (!latestSession) {
    return null;
  }

  const getGameName = (gameType: string) => {
    const names: { [key: string]: string } = {
      'focus_forest': 'Floresta do Foco',
      'memory_game': 'Memória Colorida',
      'logic_game': 'Lógica Rápida',
      'attention_sustained': 'Atenção Sustentada',
      // Adicionar mais conforme necessário
    };
    return names[gameType] || gameType;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Sessão em Progresso Encontrada
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Você tem uma sessão não finalizada. Deseja continuar de onde parou?</p>
            
            <Card className="p-4 space-y-3 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{getGameName(latestSession.game_type)}</span>
                <Badge variant="outline">Nível {latestSession.level}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Iniciada {formatDistanceToNow(new Date(latestSession.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </span>
              </div>

              {latestSession.performance_data && (
                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Pontos:</span>{' '}
                    <span className="font-semibold">{latestSession.performance_data.score || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jogadas:</span>{' '}
                    <span className="font-semibold">{latestSession.performance_data.moves || 0}</span>
                  </div>
                </div>
              )}
            </Card>

            {sessions.length > 1 && (
              <p className="text-xs text-muted-foreground">
                + {sessions.length - 1} outra{sessions.length > 2 ? 's' : ''} sessão{sessions.length > 2 ? 'ões' : ''} não finalizada{sessions.length > 2 ? 's' : ''}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => onDiscard(latestSession.id)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Descartar e Começar Novo
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onResume(latestSession)}
            className="gap-2 bg-primary"
          >
            <RotateCcw className="w-4 h-4" />
            Continuar de Onde Parei
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
