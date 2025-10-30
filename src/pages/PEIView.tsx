import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  Brain,
  Target,
  BookOpen,
  Lightbulb,
  Save,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { usePEI } from '@/hooks/usePEI';
import { useAuth } from '@/hooks/useAuth';

export default function PEIView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screeningId = searchParams.get('screening');
  const { user } = useAuth();
  const { currentPlan, loading, getPEIByScreening, updatePEI } = usePEI();

  const [isEditing, setIsEditing] = useState(false);
  const [editedObjectives, setEditedObjectives] = useState('');
  const [editedActivities, setEditedActivities] = useState('');
  const [editedRecommendations, setEditedRecommendations] = useState('');
  const [editedProgress, setEditedProgress] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (screeningId) {
      getPEIByScreening(screeningId);
    }
  }, [user, screeningId]);

  useEffect(() => {
    if (currentPlan) {
      setEditedObjectives(currentPlan.objectives);
      setEditedActivities(currentPlan.activities);
      setEditedRecommendations(currentPlan.recommendations);
      setEditedProgress(currentPlan.progress);
    }
  }, [currentPlan]);

  const handleSave = async () => {
    if (!currentPlan) return;

    const success = await updatePEI(currentPlan.id, {
      objectives: editedObjectives,
      activities: editedActivities,
      recommendations: editedRecommendations,
      progress: editedProgress,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (currentPlan) {
      setEditedObjectives(currentPlan.objectives);
      setEditedActivities(currentPlan.activities);
      setEditedRecommendations(currentPlan.recommendations);
      setEditedProgress(currentPlan.progress);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando PEI...</p>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>PEI não encontrado</CardTitle>
            <CardDescription>
              Nenhum Plano Educacional Individualizado foi encontrado para esta triagem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/screening">Voltar para Triagens</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary/60 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Plano Educacional Individualizado</h1>
              <p className="text-muted-foreground">Lei 14.254/21 - PEI Personalizado</p>
            </div>
          </div>

          <div className="flex gap-2">
            {currentPlan.aiGenerated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Gerado por IA
              </Badge>
            )}
            <Badge
              variant={
                currentPlan.status === 'ativo'
                  ? 'default'
                  : currentPlan.status === 'concluido'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{currentPlan.progress}%</div>
              <Progress value={currentPlan.progress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Criado em
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(currentPlan.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm capitalize">{currentPlan.status}</p>
            </CardContent>
          </Card>
        </div>

        {isEditing && (
          <Alert className="mb-6">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Você está editando o PEI. As alterações serão salvas quando você clicar em "Salvar
              Alterações".
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="objectives" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="objectives">
              <Target className="h-4 w-4 mr-2" />
              Objetivos
            </TabsTrigger>
            <TabsTrigger value="activities">
              <BookOpen className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recomendações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>Objetivos Pedagógicos</CardTitle>
                <CardDescription>
                  Metas específicas para o desenvolvimento do estudante
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedObjectives}
                    onChange={(e) => setEditedObjectives(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{currentPlan.objectives}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Sugeridas</CardTitle>
                <CardDescription>
                  Exercícios e práticas recomendadas para alcançar os objetivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedActivities}
                    onChange={(e) => setEditedActivities(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{currentPlan.activities}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Pedagógicas</CardTitle>
                <CardDescription>
                  Orientações para professores e equipe educacional
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedRecommendations}
                    onChange={(e) => setEditedRecommendations(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{currentPlan.recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Atualizar Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progresso: {editedProgress}%</span>
                </div>
                <Slider
                  value={[editedProgress]}
                  onValueChange={(value) => setEditedProgress(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full">
              Editar PEI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
