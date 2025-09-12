import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock, ClipboardCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const diagnosticTests = [
  {
    id: 'attention-sustained',
    title: "Teste de Atenção Sustentada",
    category: "Diagnóstico • TDAH",
    description: "Avaliação científica da capacidade de manter atenção focada. Identifica déficits característicos do TDAH.",
    features: ["Vigilância sustentada", "Tempo de reação", "Controle inibitório", "Declínio da atenção"],
    ageRange: "6-18 anos",
    duration: "8-12 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-red-100 text-red-800",
    gradient: "from-red-400 to-red-600",
    unlocked: true,
    condition: "TDAH",
    scientificBasis: "Baseado no Teste de Performance Contínua (CPT)"
  },
  {
    id: 'cognitive-flexibility',
    title: "Flexibilidade Cognitiva",
    category: "Diagnóstico • TEA",
    description: "Teste baseado no Wisconsin Card Sorting. Detecta rigidez cognitiva e dificuldades executivas típicas do TEA.",
    features: ["Mudança de regras", "Adaptabilidade", "Função executiva", "Perseveração"],
    ageRange: "8-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-indigo-100 text-indigo-800",
    gradient: "from-indigo-400 to-indigo-600",
    unlocked: true,
    condition: "TEA",
    scientificBasis: "Wisconsin Card Sorting Test (WCST)"
  },
  {
    id: 'phonological-processing',
    title: "Processamento Fonológico",
    category: "Diagnóstico • Dislexia",
    description: "Avalia habilidades de consciência fonológica. Principal indicador de risco para dificuldades de leitura.",
    features: ["Rimas", "Segmentação", "Síntese", "Manipulação fonêmica"],
    ageRange: "5-16 anos",
    duration: "6-10 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-teal-100 text-teal-800",
    gradient: "from-teal-400 to-teal-600",
    unlocked: true,
    condition: "Dislexia",
    scientificBasis: "Teste de Consciência Fonológica"
  }
];

export default function DiagnosticTests() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-card flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Acesso Restrito</h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Para acessar os testes diagnósticos, você precisa fazer login.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-card py-12">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-destructive to-orange-500 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Testes 
              <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
                Diagnósticos
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto text-balance mb-8">
            Avaliações científicas validadas para identificação precoce de TEA, TDAH e Dislexia. 
            Ferramentas profissionais baseadas em protocolos clínicos reconhecidos.
          </p>
          
          {/* Warning Notice */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-semibold mb-2">Importante:</p>
                    <p className="text-left">
                      Estes testes fornecem indicadores de risco, mas não constituem diagnóstico definitivo. 
                      Os resultados devem ser interpretados por profissionais qualificados e complementados 
                      com avaliação clínica completa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Diagnostic Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {diagnosticTests.map((test) => (
            <Card 
              key={test.id}
              className="p-8 border-0 shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group bg-card relative overflow-hidden"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${test.gradient} opacity-5`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <Badge className={`${test.color} font-semibold`}>
                    {test.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {test.status}
                  </Badge>
                </div>

                <h3 className="font-heading text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {test.title}
                </h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {test.description}
                </p>

                {/* Scientific Basis */}
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Base Científica:</p>
                  <p className="text-sm">{test.scientificBasis}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>{test.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{test.players}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Características Avaliadas
                  </h4>
                  {test.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <Link to={`/games/${test.id}`} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Iniciar Avaliação
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold">Como Funcionam os Testes</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Cada teste avalia funções cognitivas específicas</p>
              <p>• Algoritmos baseados em pesquisa científica</p>
              <p>• Resultados com indicadores de risco padronizados</p>
              <p>• Relatórios detalhados para profissionais</p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold">Próximos Passos</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Realize os testes em ambiente tranquilo</p>
              <p>• Compartilhe resultados com profissionais</p>
              <p>• Acesse o painel clínico para análise detalhada</p>
              <p>• Continue com jogos terapêuticos personalizados</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA to Clinical Dashboard */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-primary-glow/5">
            <CardContent>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Análise Profissional Completa
              </h3>
              <p className="text-muted-foreground mb-6">
                Acesse relatórios detalhados e ferramentas de análise no painel clínico
              </p>
              <Button size="lg" asChild>
                <Link to="/clinical" className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Acessar Painel Clínico
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}