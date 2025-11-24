import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, PlayCircle, XCircle } from "lucide-react";

interface SessionRecoveryModalProps {
  open: boolean;
  session?: any;
  sessions?: any[];
  onResume: (session?: any) => void;
  onDiscard: (sessionId?: string) => void;
  onStartNew?: () => void;
}

export function SessionRecoveryModal({ 
  open, 
  session,
  sessions,
  onResume, 
  onDiscard,
  onStartNew
}: SessionRecoveryModalProps) {
  // Support both single session and sessions array
  const activeSession = session || (sessions && sessions[0]);
  
  if (!activeSession) return null;

  const startedAt = new Date(activeSession.started_at || activeSession.created_at);
  const timeAgo = Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60)); // minutes ago

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-primary animate-pulse" />
            <AlertDialogTitle>Sessão Interrompida Encontrada</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Encontramos uma sessão de jogo que não foi finalizada há <strong>{timeAgo} minutos</strong>.
            </p>
            <Card className="p-3 bg-muted border-primary/20">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nível:</span>
                  <Badge variant="outline">
                    {activeSession.difficulty_level || activeSession.level || 1}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pontuação:</span>
                  <span className="font-medium">{activeSession.score || 0}</span>
                </div>
                {(activeSession.session_data?.correctMoves || activeSession.performance_data?.moves) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progresso:</span>
                    <span className="font-medium">
                      {activeSession.session_data?.correctMoves || activeSession.performance_data?.moves || 0}
                    </span>
                  </div>
                )}
              </div>
            </Card>
            <p className="text-sm">
              Deseja continuar de onde parou ou começar uma nova sessão?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={() => onDiscard(activeSession.id)}
            className="flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Nova Sessão
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onResume(activeSession)}
            className="flex items-center gap-2 bg-primary"
          >
            <PlayCircle className="w-4 h-4" />
            Continuar Jogando
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
