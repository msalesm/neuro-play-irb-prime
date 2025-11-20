import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Clock,
  CheckCircle2,
  Trophy,
  BookOpen,
  Target,
  Info,
} from 'lucide-react';
import { useParentTraining } from '@/hooks/useParentTraining';
import { useAuth } from '@/hooks/useAuth';
import { trainingModules } from '@/data/trainingModules';

export default function ParentTraining() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trainings, loading, getCompletedModules, getTotalScore } = useParentTraining();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user]);

  const completedModules = getCompletedModules();
  const totalScore = getTotalScore();
  const completionRate = (completedModules.length / trainingModules.length) * 100;

  const getModuleStatus = (moduleId: string) => {
    return trainings.find((t) => t.moduleName === moduleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando capacitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-32">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary/60 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Capacitação dos Pais</h1>
              <p className="text-muted-foreground">Apoie o desenvolvimento do seu filho</p>
            </div>
          </div>
        </div>

        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete os módulos de capacitação para aprender estratégias eficazes de apoio ao desenvolvimento
            cognitivo e emocional de crianças com Dislexia, TDAH e TEA.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.round(completionRate)}%
              </div>
              <Progress value={completionRate} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {completedModules.length} de {trainingModules.length} módulos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Score Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{totalScore}</div>
              <p className="text-xs text-muted-foreground mt-2">pontos de 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" />
                Certificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{completedModules.length}</div>
              <p className="text-xs text-muted-foreground mt-2">obtidos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trainingModules.map((module) => {
            const status = getModuleStatus(module.id);
            const isCompleted = status?.status === 'concluido';
            const isInProgress = status?.status === 'em_andamento';

            return (
              <Card
                key={module.id}
                className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  isCompleted ? 'border-green-500/50' : ''
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{module.icon}</div>
                    {isCompleted && (
                      <Badge className="bg-green-500/10 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                    {isInProgress && (
                      <Badge className="bg-blue-500/10 text-blue-700">Em Andamento</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{module.duration}</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-2">Tópicos:</p>
                    <ul className="space-y-1">
                      {module.topics.slice(0, 3).map((topic, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isCompleted && status && (
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-semibold">{status.score}/100</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a
                          href={status.certificateUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Ver Certificado
                        </a>
                      </Button>
                    </div>
                  )}

                  {!isCompleted && (
                    <Button
                      asChild
                      className="w-full group-hover:scale-105 transition-transform"
                      variant={isInProgress ? 'secondary' : 'default'}
                    >
                      <Link to={`/training/${module.id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        {isInProgress ? 'Continuar' : 'Iniciar Módulo'}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {completedModules.length === trainingModules.length && (
          <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-background">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <CardTitle>Parabéns! Capacitação Completa</CardTitle>
                  <CardDescription>
                    Você concluiu todos os módulos de capacitação
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Você está preparado para apoiar o desenvolvimento do seu filho com estratégias
                baseadas em evidências científicas.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/dashboard">
                    Ir para Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/games">
                    Explorar Jogos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
