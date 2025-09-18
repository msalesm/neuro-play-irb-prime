import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock, ClipboardCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const diagnosticTests = [
  {
    id: 'memory-workload',
    title: "Teste de Memória de Trabalho",
    category: "Diagnóstico • TDAH",
    description: "Avalie sua capacidade de reter e manipular informações na memória de trabalho.",
    features: ["Sequência numérica", "Span de dígitos", "Manipulação mental", "Capacidade limitada"],
    ageRange: "6-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-purple-600",
    unlocked: true,
    condition: "TDAH",
    scientificBasis: "Teste de Span de Dígitos (WISC-V)"
  },
  {
    id: 'theory-of-mind',
    title: "Teoria da Mente",
    category: "Diagnóstico • TEA",
    description: "Teste sua capacidade de compreender pensamentos e sentimentos dos outros.",
    features: ["Falsa crença", "Perspectiva visual", "Compreensão social", "Empatia cognitiva"],
    ageRange: "4-16 anos",
    duration: "15-20 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-cyan-100 text-cyan-800",
    gradient: "from-cyan-400 to-cyan-600",
    unlocked: true,
    condition: "TEA",
    scientificBasis: "Teste de Sally-Anne e variações"
  },
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
  },
  {
    id: 'executive-processing',
    title: "Processamento Executivo",
    category: "Diagnóstico • TDAH/TEA",
    description: "Avalia funções executivas através do teste Torre de Londres. Identifica dificuldades de planejamento e organização.",
    features: ["Planejamento", "Organização", "Controle inibitório", "Flexibilidade mental"],
    ageRange: "8-18 anos",
    duration: "12-18 min",
    players: "1 jogador",
    status: "Diagnóstico",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-purple-600",
    unlocked: true,
    condition: "TDAH/TEA",
    scientificBasis: "Torre de Londres - Teste clássico de funções executivas"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 text-white py-12 pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/25">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">
              Testes 
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Diagnósticos
              </span>
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-4xl mx-auto text-balance mb-8">
            Avaliações científicas validadas para identificação precoce de TEA, TDAH e Dislexia. 
            Ferramentas profissionais baseadas em protocolos clínicos reconhecidos.
          </p>
          
          {/* Warning Notice */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="backdrop-blur-sm bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-100">
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
              className="p-8 border-white/20 backdrop-blur-sm bg-white/10 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group relative overflow-hidden"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${test.gradient} opacity-20`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <Badge className="bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white border-0 shadow-lg font-semibold">
                    {test.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    {test.status}
                  </Badge>
                </div>

                <h3 className="font-heading text-2xl font-bold mb-4 text-white group-hover:text-red-200 transition-colors">
                  {test.title}
                </h3>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {test.description}
                </p>

                {/* Scientific Basis */}
                <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white/80 mb-1">Base Científica:</p>
                  <p className="text-sm text-white/70">{test.scientificBasis}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Target className="h-4 w-4" />
                    <span>{test.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Users className="h-4 w-4" />
                    <span>{test.players}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-white/80">
                    Características Avaliadas
                  </h4>
                  {test.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-white/70">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-red-500/25 transition-all duration-300"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-6 backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold text-white">Como Funcionam os Testes</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Cada teste avalia funções cognitivas específicas</p>
              <p>• Algoritmos baseados em pesquisa científica</p>
              <p>• Resultados com indicadores de risco padronizados</p>
              <p>• Relatórios detalhados para profissionais</p>
            </CardContent>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold text-white">Próximos Passos</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Realize os testes em ambiente tranquilo</p>
              <p>• Compartilhe resultados com profissionais</p>
              <p>• Acesse o painel clínico para análise detalhada</p>
              <p>• Continue com jogos terapêuticos personalizados</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA to Clinical Dashboard */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-white/20">
            <CardContent>
              <h3 className="font-heading text-2xl font-bold mb-4 text-white">
                Análise Profissional Completa
              </h3>
              <p className="text-white/70 mb-6">
                Acesse relatórios detalhados e ferramentas de análise no painel clínico
              </p>
              <Button 
                size="lg" 
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
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