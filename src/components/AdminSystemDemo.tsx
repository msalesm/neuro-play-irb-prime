import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, Crown, BookOpen } from 'lucide-react';

export function AdminSystemDemo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');

  const assignEducatorRole = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Add educator role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'educator'
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast({
        title: "✅ Role de Educador Atribuída",
        description: "Você agora tem acesso ao painel administrativo. Recarregue a página para ver o botão 'Painel Admin' no header."
      });
    } catch (error) {
      console.error('Error assigning educator role:', error);
      toast({
        title: "Erro ao atribuir role",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoLearningData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create some demo learning sessions
      const demoSessions = [
        {
          game_type: 'focus_forest',
          level: 1,
          performance_data: { accuracy: 85, score: 1250, hits: 12, misses: 2 },
          learning_indicators: { attention_span: 180, focus_consistency: 8 },
          struggles_detected: [],
          improvements_noted: ['good_focus'],
          session_duration_seconds: 180,
          completed: true
        },
        {
          game_type: 'focus_forest',
          level: 2,
          performance_data: { accuracy: 70, score: 800, hits: 7, misses: 3 },
          learning_indicators: { attention_span: 120, focus_consistency: 4 },
          struggles_detected: ['difficulty_with_level'],
          improvements_noted: [],
          session_duration_seconds: 120,
          completed: true
        },
        {
          game_type: 'memoria_colorida',
          level: 1,
          performance_data: { accuracy: 90, score: 1500, correct: 9, incorrect: 1 },
          learning_indicators: { memory_retention: 95, pattern_recognition: 88 },
          struggles_detected: [],
          improvements_noted: ['excellent_memory'],
          session_duration_seconds: 200,
          completed: true
        }
      ];

      // Get user's learning trails
      const { data: trails } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('user_id', user.id);

      if (!trails || trails.length === 0) {
        toast({
          title: "Erro",
          description: "Você precisa ter trilhas de aprendizado criadas primeiro. Visite o Learning Dashboard.",
          variant: "destructive"
        });
        return;
      }

      // Create sessions for different trails
      for (let i = 0; i < demoSessions.length; i++) {
        const session = demoSessions[i];
        const trail = trails[i % trails.length]; // Cycle through available trails

        const { error } = await supabase
          .from('learning_sessions')
          .insert({
            user_id: user.id,
            trail_id: trail.id,
            ...session,
            completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date in last 7 days
          });

        if (error) throw error;
      }

      // Update learning trails with some XP
      for (const trail of trails) {
        const { error } = await supabase
          .from('learning_trails')
          .update({
            total_xp: trail.total_xp + Math.floor(Math.random() * 500) + 100,
            completed_exercises: trail.completed_exercises + Math.floor(Math.random() * 5) + 1,
            current_level: Math.min(trail.current_level + Math.floor(Math.random() * 2), 5)
          })
          .eq('id', trail.id);

        if (error) throw error;
      }

      toast({
        title: "✅ Dados Demo Criados",
        description: "Dados de aprendizado de exemplo foram criados. Agora você pode ver relatórios no painel admin!"
      });
    } catch (error) {
      console.error('Error creating demo data:', error);
      toast({
        title: "Erro ao criar dados demo",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addStudentByEmail = async () => {
    if (!user || !studentEmail.trim()) return;

    try {
      setLoading(true);

      // Find student by email
      const { data: student, error: studentError } = await supabase
        .from('user_profiles')
        .select('id, name')
        .eq('email', studentEmail)
        .single();

      if (studentError) {
        toast({
          title: "Estudante não encontrado",
          description: `Nenhum usuário com email ${studentEmail} foi encontrado`,
          variant: "destructive"
        });
        return;
      }

      // Add educator-student relationship
      const { error: relationError } = await supabase
        .from('educator_students')
        .insert({
          educator_id: user.id,
          student_id: student.id,
          notes: 'Adicionado via sistema demo'
        });

      if (relationError) {
        if (relationError.message.includes('duplicate')) {
          toast({
            title: "Estudante já vinculado",
            description: "Este estudante já está em sua lista",
            variant: "destructive"
          });
        } else {
          throw relationError;
        }
        return;
      }

      toast({
        title: "✅ Estudante Adicionado",
        description: `${student.name || studentEmail} foi adicionado à sua lista de estudantes`
      });
      setStudentEmail('');
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Erro ao adicionar estudante",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sistema Admin Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Faça login para testar o sistema administrativo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Sistema Administrativo - Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">1. Tornar-se Educador</h4>
              <p className="text-sm text-muted-foreground">
                Atribua a role de educador para acessar o painel administrativo
              </p>
              <Button 
                onClick={assignEducatorRole} 
                disabled={loading}
                className="w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Atribuir Role de Educador
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">2. Criar Dados de Teste</h4>
              <p className="text-sm text-muted-foreground">
                Gere dados de aprendizado de exemplo para demonstração
              </p>
              <Button 
                onClick={createDemoLearningData} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Criar Dados Demo
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">3. Adicionar Estudante (Opcional)</h4>
            <div className="flex gap-2">
              <Input
                placeholder="email@exemplo.com"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                type="email"
              />
              <Button 
                onClick={addStudentByEmail} 
                disabled={loading || !studentEmail.trim()}
                variant="outline"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione outro usuário registrado como seu estudante
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Usar o Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs">1</Badge>
              <div>
                <p className="font-medium">Atribua a role de educador</p>
                <p className="text-sm text-muted-foreground">
                  Clique no botão acima para receber permissões administrativas
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs">2</Badge>
              <div>
                <p className="font-medium">Crie dados de demonstração</p>
                <p className="text-sm text-muted-foreground">
                  Gere sessões de aprendizado de exemplo para ver relatórios
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs">3</Badge>
              <div>
                <p className="font-medium">Acesse o Painel Admin</p>
                <p className="text-sm text-muted-foreground">
                  Use o botão "Painel Admin" no header para ver relatórios detalhados
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs">4</Badge>
              <div>
                <p className="font-medium">Jogue para gerar dados reais</p>
                <p className="text-sm text-muted-foreground">
                  Jogue Focus Forest ou outros jogos para ver como os dados são coletados automaticamente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}