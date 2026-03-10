import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, CheckCircle2, Sparkles } from 'lucide-react';
import { ScanGameRunner } from '@/components/educacao/scan-games/ScanGameRunner';

type Phase = 'code' | 'select-student' | 'playing' | 'done';

export default function JoinScan() {
  const [phase, setPhase] = useState<Phase>('code');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleJoin = async () => {
    if (code.length !== 4) {
      toast.error('Digite o código de 4 dígitos');
      return;
    }
    setLoading(true);
    try {
      // Find active session
      const { data: sess, error: sessError } = await supabase
        .from('classroom_scan_sessions')
        .select('*')
        .eq('session_code', code)
        .eq('status', 'active')
        .maybeSingle();
      
      if (sessError) throw sessError;
      if (!sess) {
        toast.error('Sessão não encontrada ou ainda não liberada');
        setLoading(false);
        return;
      }
      
      // Get available students (not yet completed)
      const { data: studentResults, error: srError } = await supabase
        .from('scan_student_results')
        .select('*')
        .eq('session_id', sess.id)
        .in('status', ['waiting', 'playing']);
      
      if (srError) throw srError;
      
      setSession(sess);
      setStudents(studentResults || []);
      setPhase('select-student');
    } catch (e) {
      toast.error('Erro ao entrar na sessão');
    }
    setLoading(false);
  };

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    // Mark as playing
    await supabase
      .from('scan_student_results')
      .update({ status: 'playing', started_at: new Date().toISOString() })
      .eq('id', student.id);
    setPhase('playing');
  };

  const handleAllComplete = async (results: any[]) => {
    if (!selectedStudent || !session) return;
    
    const attResult = results.find(r => r.gameType === 'attention');
    const memResult = results.find(r => r.gameType === 'memory');
    const langResult = results.find(r => r.gameType === 'language');
    const execResult = results.find(r => r.gameType === 'executive_function');

    const attScore = attResult?.accuracy || 0;
    const memScore = memResult?.accuracy || 0;
    const langScore = langResult?.accuracy || 0;
    const execScore = execResult?.accuracy || 0;
    const overall = Math.round((attScore + memScore + langScore + execScore) / 4);

    // Generate risk flags
    const riskFlags: any[] = [];
    if (langScore < 50) riskFlags.push({ type: 'reading', score: langScore, label: 'Risco leitura' });
    if (attScore < 50) riskFlags.push({ type: 'attention', score: attScore, label: 'Risco atenção' });
    if (execScore < 40) riskFlags.push({ type: 'social', score: execScore, label: 'Risco cognição social' });

    // Save cognitive events
    const allEvents = results.flatMap(r => r.events.map((e: any) => ({
      session_id: session.id,
      child_id: selectedStudent.child_id,
      game_type: e.game_type || r.gameType,
      event_type: 'response',
      reaction_time_ms: e.reaction_time_ms,
      is_correct: e.is_correct,
      accuracy: r.accuracy,
      recorded_at: new Date().toISOString(),
    })));

    try {
      // Save events in batch
      if (allEvents.length > 0) {
        await supabase.from('cognitive_events').insert(allEvents);
      }

      // Update student result
      await supabase
        .from('scan_student_results')
        .update({
          status: 'completed',
          attention_score: attScore,
          memory_score: memScore,
          language_score: langScore,
          executive_function_score: execScore,
          overall_score: overall,
          risk_flags: riskFlags,
          raw_metrics: {
            attention: { accuracy: attScore, avgRT: attResult?.avgReactionTime },
            memory: { accuracy: memScore, avgRT: memResult?.avgReactionTime },
            language: { accuracy: langScore, avgRT: langResult?.avgReactionTime },
            executive: { accuracy: execScore, avgRT: execResult?.avgReactionTime },
          },
          completed_at: new Date().toISOString(),
        })
        .eq('id', selectedStudent.id);

      setPhase('done');
    } catch {
      toast.error('Erro ao salvar resultados');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">NeuroPlay</h1>
          <p className="text-sm text-muted-foreground">Cognitive Scan</p>
        </div>

        {/* Phase: Enter Code */}
        {phase === 'code' && (
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Digite o código da sessão fornecido pelo professor
                </p>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  className="text-center text-3xl font-mono tracking-[0.5em] h-16"
                  maxLength={4}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleJoin}
                disabled={code.length !== 4 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Select Student */}
        {phase === 'select-student' && (
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm font-medium text-center mb-2">Selecione seu nome:</p>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full p-4 rounded-xl bg-muted hover:bg-primary/10 text-left transition-all active:scale-[0.98]"
                  >
                    <span className="font-medium">{s.student_name}</span>
                  </button>
                ))}
              </div>
              {students.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum aluno disponível nesta sessão.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phase: Playing Games */}
        {phase === 'playing' && selectedStudent && (
          <ScanGameRunner
            studentName={selectedStudent.student_name}
            onAllComplete={handleAllComplete}
          />
        )}

        {/* Phase: Done */}
        {phase === 'done' && (
          <Card className="border-border">
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-chart-3 mx-auto" />
              <h2 className="text-xl font-bold">Tudo pronto! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                Você completou todas as atividades. Pode devolver o dispositivo ao professor.
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Obrigado por participar!</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
