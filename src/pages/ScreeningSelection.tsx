import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Heart, ArrowLeft, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlatformOnboarding } from '@/components/PlatformOnboarding';

export default function ScreeningSelection() {
  const screenings = [
    {
      id: 'dislexia',
      title: 'Triagem de Dislexia',
      description: 'Avaliação de habilidades de leitura, consciência fonológica e decodificação',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      path: '/screening/dislexia',
      duration: '10-15 min',
    },
    {
      id: 'tdah',
      title: 'Triagem de TDAH',
      description: 'Avaliação de atenção, foco, controle inibitório e hiperatividade',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      path: '/screening/tdah',
      duration: '10-12 min',
    },
    {
      id: 'tea',
      title: 'Triagem de TEA',
      description: 'Avaliação de interação social, comunicação e padrões comportamentais',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      path: '/screening/tea',
      duration: '12-15 min',
    },
  ];

  return (
    <>
      <PlatformOnboarding pageName="screening" />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-32">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Triagem Gamificada Neuro Play EDU
          </h1>
          <p className="text-muted-foreground text-lg">
            Conforme Lei 14.254/21 - Identificação precoce de sinais de Dislexia, TDAH e TEA
          </p>
        </div>

        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Esta triagem é uma ferramenta de apoio pedagógico e NÃO substitui avaliação profissional.
            Os resultados servem para orientar encaminhamentos e planejamento educacional individualizado.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {screenings.map((screening) => (
            <Card
              key={screening.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/50"
            >
              <div className={`h-2 bg-gradient-to-r ${screening.color}`} />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${screening.color} text-white`}>
                    <screening.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{screening.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{screening.duration}</p>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {screening.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  <Link to={screening.path}>
                    Iniciar Triagem
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Sobre a Lei 14.254/21
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Lei federal que garante acompanhamento integral para educandos com dislexia, TDAH e TEA, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Identificação precoce através de triagens</li>
              <li>Apoio educacional especializado</li>
              <li>Planos Educacionais Individualizados (PEI)</li>
              <li>Capacitação de professores e equipe escolar</li>
              <li>Integração com saúde e assistência social</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
