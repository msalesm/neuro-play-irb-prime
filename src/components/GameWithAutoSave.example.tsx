import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';
import { GameProgressBar } from '@/components/GameProgressBar';
import { useToast } from '@/hooks/use-toast';

/**
 * EXEMPLO DE USO DO SISTEMA DE AUTO-SAVE
 * 
 * Este componente mostra como integrar o sistema de auto-save em qualquer jogo.
 * 
 * RECURSOS:
 * 1. Auto-save a cada 10 segundos (configurável)
 * 2. Salvamento ao sair/fechar página
 * 3. Recuperação de sessões não finalizadas
 * 4. Indicador de status de salvamento
 * 5. Progresso nunca é perdido
 */

export default function GameWithAutoSaveExample() {
  const { toast } = useToast();
  
  // Hook de auto-save com configurações
  const {
    currentSession,
    isSaving,
    lastSaveSuccess,
    hasPendingChanges,
    startSession,
    updateSession,
    completeSession,
    abandonSession
  } = useAutoSave({
    saveInterval: 10000, // Salvar a cada 10 segundos
    saveOnAction: false, // Não salvar após cada ação (economiza requests)
    saveOnUnload: true   // Salvar ao fechar página
  });

  // Hook de recuperação de sessão
  const {
    unfinishedSessions,
    loading: loadingRecovery,
    hasUnfinishedSessions,
    resumeSession,
    discardSession
  } = useSessionRecovery('example_game'); // Filtrar por tipo de jogo

  // Estado do jogo
  const [gameStarted, setGameStarted] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);

  // Verificar sessões não finalizadas ao carregar
  useEffect(() => {
    if (!loadingRecovery && hasUnfinishedSessions && !gameStarted) {
      setShowRecoveryModal(true);
    }
  }, [loadingRecovery, hasUnfinishedSessions, gameStarted]);

  // Iniciar novo jogo
  const handleStartNewGame = async () => {
    const sessionId = await startSession('example_game', level, {
      trailId: 'attention-trail-id', // ID do trail de atenção
      difficulty: 'normal'
    });

    if (sessionId) {
      setGameStarted(true);
      setShowRecoveryModal(false);
      
      toast({
        title: '🎮 Jogo Iniciado',
        description: 'Seu progresso será salvo automaticamente a cada 10 segundos.'
      });
    }
  };

  // Retomar sessão existente
  const handleResumeSession = async (session: any) => {
    // Restaurar estado do jogo
    setScore(session.performance_data.score || 0);
    setLevel(session.level || 1);
    setMoves(session.performance_data.moves || 0);
    
    // Iniciar nova sessão com o ID existente
    await startSession('example_game', session.level, {
      sessionId: session.id, // Continuar a mesma sessão
      trailId: 'attention-trail-id'
    });

    setGameStarted(true);
    setShowRecoveryModal(false);

    toast({
      title: '🔄 Sessão Retomada',
      description: 'Continuando de onde você parou!'
    });
  };

  // Simular uma ação do jogo
  const handleGameAction = (isCorrect: boolean) => {
    const newScore = isCorrect ? score + 10 : score;
    const newMoves = moves + 1;
    
    setScore(newScore);
    setMoves(newMoves);

    // Atualizar sessão (será auto-salva periodicamente)
    updateSession({
      score: newScore,
      moves: newMoves,
      correctMoves: isCorrect ? (currentSession?.correctMoves || 0) + 1 : currentSession?.correctMoves,
      additionalData: {
        lastAction: isCorrect ? 'correct' : 'wrong',
        timestamp: new Date().toISOString()
      }
    });
  };

  // Finalizar jogo
  const handleCompleteGame = async () => {
    const finalSession = await completeSession({
      score,
      moves,
      finalLevel: level
    });

    toast({
      title: '🎉 Jogo Completo!',
      description: `Pontuação final: ${score} pontos em ${moves} jogadas`
    });

    setGameStarted(false);
    setScore(0);
    setMoves(0);
  };

  // Sair/abandonar jogo
  const handleAbandonGame = async () => {
    await abandonSession(); // Salva progresso antes de sair
    setGameStarted(false);
    
    toast({
      title: 'Progresso Salvo',
      description: 'Você pode continuar depois de onde parou.'
    });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-blue-900">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Jogo com Auto-Save</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Este jogo salva automaticamente seu progresso a cada 10 segundos e quando você sai.
            </p>
            <Button onClick={handleStartNewGame} className="w-full">
              Iniciar Novo Jogo
            </Button>
          </CardContent>
        </Card>

        {/* Modal de recuperação de sessão */}
        <SessionRecoveryModal
          open={showRecoveryModal}
          sessions={unfinishedSessions}
          onResume={handleResumeSession}
          onDiscard={async (id) => {
            await discardSession(id);
            setShowRecoveryModal(false);
          }}
          onStartNew={handleStartNewGame}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-blue-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com botão de saída */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Jogo Exemplo</h1>
          <div className="flex items-center gap-3">
            {/* Indicador de salvamento */}
            <div className="text-sm text-white/60">
              {isSaving && '💾 Salvando...'}
              {!isSaving && lastSaveSuccess && hasPendingChanges && '⏰ Será salvo em breve'}
              {!isSaving && lastSaveSuccess && !hasPendingChanges && '✅ Tudo salvo'}
              {!lastSaveSuccess && '⚠️ Erro ao salvar'}
            </div>
            <GameExitButton
              variant="quit"
              onExit={handleAbandonGame}
              showProgress={true}
              currentProgress={moves}
              totalProgress={10}
            />
          </div>
        </div>

        {/* Progresso */}
        <GameProgressBar
          current={moves}
          total={10}
          showSteps={true}
          label="Progresso da Sessão"
        />

        {/* Game área */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center text-white">
              <div>
                <div className="text-3xl font-bold">{score}</div>
                <div className="text-sm text-white/60">Pontos</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{level}</div>
                <div className="text-sm text-white/60">Nível</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{moves}</div>
                <div className="text-sm text-white/60">Jogadas</div>
              </div>
            </div>

            {/* Exemplo de botões de jogo */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleGameAction(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Acertar ✓
              </Button>
              <Button
                onClick={() => handleGameAction(false)}
                className="bg-red-600 hover:bg-red-700"
              >
                Errar ✗
              </Button>
            </div>

            {moves >= 10 && (
              <Button
                onClick={handleCompleteGame}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Finalizar Jogo
              </Button>
            )}

            {/* Informação sobre auto-save */}
            <div className="pt-4 border-t border-white/20 text-xs text-white/60 space-y-1">
              <p>💾 Auto-save ativo: Salvamento a cada 10 segundos</p>
              <p>🔄 Última ação salva: {currentSession?.lastSaveTime.toLocaleTimeString()}</p>
              <p>📊 ID da Sessão: {currentSession?.sessionId || 'Criando...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
