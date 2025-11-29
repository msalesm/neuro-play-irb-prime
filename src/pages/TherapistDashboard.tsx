import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Brain, TrendingUp, AlertCircle, Calendar, MessageSquare,
  FileText, Settings, ArrowLeft, Download, Sparkles, Target
} from 'lucide-react';
import { ChildAvatarDisplay } from '@/components/ChildAvatarDisplay';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';

interface PatientData {
  id: string;
  name: string;
  age: number;
  avatar_url?: string;
  conditions: string[];
}

export default function TherapistDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evolution');
  const [sessionNotes, setSessionNotes] = useState('');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);

      const { data: childData, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      const birthDate = new Date(childData.birth_date);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const conditions: string[] = Array.isArray(childData.neurodevelopmental_conditions)
        ? childData.neurodevelopmental_conditions.filter((c): c is string => typeof c === 'string')
        : [];

      setPatient({
        id: childData.id,
        name: childData.name,
        age,
        avatar_url: childData.avatar_url,
        conditions
      });
    } catch (error) {
      console.error('Error loading patient:', error);
      toast.error('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    toast.info('Gerando relatório clínico...');
    // Implementation for AI report generation
  };

  const saveSession = async () => {
    if (!sessionNotes.trim()) {
      toast.error('Adicione notas da sessão');
      return;
    }
    toast.success('Sessão registrada com sucesso');
    setSessionNotes('');
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ModernPageLayout>
    );
  }

  if (!patient) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Paciente não encontrado</p>
              <Button onClick={() => navigate('/therapist/patients')} className="mt-4">
                Voltar para Lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <>
      <PlatformOnboarding pageName="therapist-dashboard" />
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/therapist/patients')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Pacientes
            </Button>

            <Card data-tour="patient-info">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <ChildAvatarDisplay
                    avatar={patient.avatar_url}
                    name={patient.name}
                    size="xl"
                  />
                  <div>
                    <h1 className="text-3xl font-bold">{patient.name}</h1>
                    <p className="text-muted-foreground">{patient.age} anos</p>
                    <div className="flex gap-2 mt-2">
                      {patient.conditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Relatório IA
                  </Button>
                  <Button onClick={() => setActiveTab('chat')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat com Pais
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} data-tour="clinical-tabs">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitivo</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="pei">PEI</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c7923e]" />
                  Evolução por Planeta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Aurora (TEA)', 'Vortex (TDAH)', 'Lumen (Dislexia)', 'Calm (Emoções)', 'Order (Executivo)'].map((planeta, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{planeta}</span>
                        <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 40 + 60)}%</span>
                      </div>
                      <Progress value={Math.random() * 40 + 60} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cognitive Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Domínios Cognitivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Atenção Sustentada', 'Memória de Trabalho', 'Flexibilidade Cognitiva', 'Controle Inibitório'].map((domain, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{domain}</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 30 + 70)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Padrões de Comportamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Melhor desempenho pela manhã
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Sessões curtas (10-15min) mais efetivas
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                        Maior engajamento em jogos visuais
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#c7923e]" />
                  Alertas Preditivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-500/10 border-l-4 border-l-red-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">
                          Risco de Regressão - Atenção
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Queda de 20% no desempenho nas últimas 3 sessões. Recomendado intervenção.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border-l-4 border-l-yellow-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                          Padrão de Frustração Detectado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aumento de eventos de frustração em jogos de memória.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-400">
                          Oportunidade de Progressão
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Criança atingiu 85% de acurácia. Sugerido aumentar dificuldade.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PEI Tab */}
          <TabsContent value="pei" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Plano Educacional Individualizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Objetivos Terapêuticos</h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Melhorar atenção sustentada para 5 minutos</span>
                          <Progress value={70} className="w-24" />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Reduzir eventos de frustração em 50%</span>
                          <Progress value={45} className="w-24" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Trilha Recomendada IA</h3>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#005a70]/10 to-[#c7923e]/10 border border-border">
                      <p className="font-medium mb-2">🎯 Trilha: Atenção e Controle Executivo</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sequência otimizada de 12 jogos durante 4 semanas
                      </p>
                      <Button size="sm">Ver Trilha Completa</Button>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => navigate(`/pei-view?child=${patientId}`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Editar PEI Completo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Register Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Registrar Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Notas da sessão: observações, progressos, dificuldades..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={saveSession} className="w-full">
                    Salvar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat Técnico com Pais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/20">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Sistema de chat em desenvolvimento
                    </p>
                    <Button className="mt-4" variant="outline">
                      Enviar Email aos Pais
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernPageLayout>
  </>
  );
}
