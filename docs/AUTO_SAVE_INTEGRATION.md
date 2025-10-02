# Guia de Integração do Sistema de Auto-Save

## Visão Geral

O sistema de auto-save garante que **TODAS as sessões** sejam salvas, mesmo as incompletas. Isso é crítico para:
1. Gerar relatórios clínicos precisos
2. Nunca perder progresso do usuário
3. Permitir retomar sessões

## Como Funciona

### 1. Auto-Save Periódico
- Salva a cada 10 segundos (configurável)
- Salva ao fechar/sair da página
- Salva ao desmontar componente

### 2. Recuperação de Sessão
- Detecta sessões não finalizadas (últimas 24h)
- Permite retomar de onde parou
- Restaura estado completo do jogo

### 3. Salvamento Garantido
- Cria registro no início da sessão
- Atualiza periodicamente
- Marca como completa ao finalizar

## Passo a Passo para Integrar

### 1. Import os Hooks e Componentes

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { SessionRecoveryModal } from '@/components/SessionRecoveryModal';
import { GameExitButton } from '@/components/GameExitButton';
```

### 2. Inicialize os Hooks

```typescript
// Auto-save
const {
  currentSession,
  isSaving,
  startSession,
  updateSession,
  completeSession,
  abandonSession
} = useAutoSave({
  saveInterval: 10000,  // 10 segundos
  saveOnUnload: true    // Salvar ao sair
});

// Recuperação
const {
  unfinishedSessions,
  hasUnfinishedSessions,
  resumeSession,
  discardSession
} = useSessionRecovery('nome_do_jogo'); // Seu tipo de jogo
```

### 3. Adicione Modal de Recuperação

```typescript
const [showRecoveryModal, setShowRecoveryModal] = useState(false);

// Mostrar modal se há sessões
useEffect(() => {
  if (hasUnfinishedSessions && !gameStarted) {
    setShowRecoveryModal(true);
  }
}, [hasUnfinishedSessions]);

// Render modal
<SessionRecoveryModal
  open={showRecoveryModal}
  sessions={unfinishedSessions}
  onResume={handleResumeSession}
  onDiscard={handleDiscardSession}
  onStartNew={handleStartNewGame}
/>
```

### 4. Inicie a Sessão ao Começar o Jogo

```typescript
const handleStartGame = async () => {
  const sessionId = await startSession(
    'nome_do_jogo',  // Tipo do jogo
    currentLevel,     // Nível inicial
    {
      trailId: attentionTrail?.id, // ID do learning trail
      difficulty: 'normal',
      // Outros dados extras
    }
  );

  if (sessionId) {
    setGameStarted(true);
  }
};
```

### 5. Atualize a Sessão Durante o Jogo

```typescript
// Após CADA ação importante do jogo
const handleGameAction = (isCorrect: boolean) => {
  // Atualizar estado local
  setScore(prevScore => prevScore + (isCorrect ? 10 : 0));
  setMoves(prev => prev + 1);

  // Atualizar sessão (será auto-salva)
  updateSession({
    score: newScore,
    moves: newMoves,
    correctMoves: isCorrect ? correctMoves + 1 : correctMoves,
    additionalData: {
      lastAction: isCorrect ? 'correct' : 'incorrect',
      timestamp: new Date()
    }
  });
};
```

### 6. Complete a Sessão ao Finalizar

```typescript
const handleFinishGame = async () => {
  // Dados finais
  const finalData = {
    score,
    moves,
    accuracy: (correctMoves / moves) * 100,
    completedAt: new Date()
  };

  // Marcar como completa e salvar
  await completeSession(finalData);

  // Limpar estado
  setGameStarted(false);
};
```

### 7. Adicione Botão de Saída com Auto-Save

```typescript
<GameExitButton
  variant="quit"
  onExit={async () => {
    await abandonSession(); // Salva antes de sair
    navigate('/games');
  }}
  showProgress={true}
  currentProgress={moves}
  totalProgress={totalMoves}
/>
```

### 8. Implemente Retomada de Sessão

```typescript
const handleResumeSession = async (session: any) => {
  // Restaurar estado do jogo
  setScore(session.performance_data.score || 0);
  setMoves(session.performance_data.moves || 0);
  setLevel(session.level);
  
  // Retomar sessão (usa o mesmo ID)
  await startSession('nome_do_jogo', session.level, {
    sessionId: session.id, // IMPORTANTE: usa o ID existente
    trailId: session.trail_id
  });

  setGameStarted(true);
  setShowRecoveryModal(false);
};
```

## Indicador de Status de Salvamento

```typescript
<div className="text-sm">
  {isSaving && '💾 Salvando...'}
  {!isSaving && lastSaveSuccess && '✅ Salvo'}
  {!lastSaveSuccess && '⚠️ Erro ao salvar'}
</div>
```

## Exemplo Completo

Veja o arquivo `src/components/GameWithAutoSave.example.tsx` para um exemplo completo funcionando.

## Checklist de Integração

- [ ] Importar hooks e componentes
- [ ] Inicializar `useAutoSave`
- [ ] Inicializar `useSessionRecovery`
- [ ] Adicionar `SessionRecoveryModal`
- [ ] Chamar `startSession()` ao iniciar jogo
- [ ] Chamar `updateSession()` após cada ação
- [ ] Chamar `completeSession()` ao finalizar
- [ ] Adicionar `GameExitButton` com `abandonSession()`
- [ ] Testar fluxo de recuperação
- [ ] Testar salvamento ao fechar página

## Configurações Opcionais

```typescript
useAutoSave({
  saveInterval: 5000,      // Salvar a cada 5s (mais frequente)
  saveOnAction: true,      // Salvar após cada ação (mais requests)
  saveOnUnload: true       // Salvar ao sair (recomendado)
});
```

## Troubleshooting

### Sessão não está sendo salva
- Verifique se `startSession()` foi chamado
- Confirme que `user` está autenticado
- Veja logs no console (`✅ Nova sessão criada:`, `💾 Sessão auto-salva:`)

### Dados não estão sendo atualizados
- Certifique-se de chamar `updateSession()` após mudanças de estado
- Use `hasPendingChanges` para verificar se há dados para salvar

### Modal de recuperação não aparece
- Verifique se há sessões nas últimas 24h
- Confirme que `hasUnfinishedSessions` é `true`
- Veja se `showRecoveryModal` está sendo controlado corretamente

## Próximos Passos

Depois de integrar o auto-save:
1. Teste abandonar uma sessão no meio
2. Recarregue a página e veja o modal de recuperação
3. Continue a sessão e verifique se o estado foi restaurado
4. Complete a sessão e veja se foi marcada como completa
5. Gere um relatório clínico e veja se os dados aparecem
