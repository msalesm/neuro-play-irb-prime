import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Target, Lock, ClipboardCheck, AlertTriangle, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const diagnosticTests = [
  {
    id: 'memory-workload',
    title: "Observação de Memória de Trabalho",
    category: "Observação • Atenção",
    description: "Observe padrões de retenção e manipulação de informações na memória de trabalho.",
    features: ["Sequência numérica", "Span de dígitos", "Manipulação mental", "Capacidade limitada"],
    ageRange: "6-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-purple-600",
    unlocked: true,
    condition: "TDAH",
    scientificBasis: "Teste de Span de Dígitos (WISC-V)"
  },
  {
    id: 'theory-of-mind',
    title: "Teoria da Mente",
    category: "Observação • Social",
    description: "Observe padrões de compreensão de pensamentos e sentimentos dos outros.",
    features: ["Falsa crença", "Perspectiva visual", "Compreensão social", "Empatia cognitiva"],
    ageRange: "4-16 anos",
    duration: "15-20 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-cyan-100 text-cyan-800",
    gradient: "from-cyan-400 to-cyan-600",
    unlocked: true,
    condition: "TEA",
    scientificBasis: "Teste de Sally-Anne e variações"
  },
  {
    id: 'attention-sustained-phases',
    title: "Observação de Atenção Sustentada",
    category: "Observação • Atenção",
    description: "Observe padrões de capacidade de manter atenção focada durante períodos prolongados.",
    features: ["Vigilância sustentada", "Tempo de reação", "Controle inibitório", "Declínio da atenção"],
    ageRange: "6-18 anos",
    duration: "8-12 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-red-100 text-red-800",
    gradient: "from-red-400 to-red-600",
    unlocked: true,
    condition: "TDAH",
    scientificBasis: "Baseado no Teste de Performance Contínua (CPT)"
  },
  {
    id: 'cognitive-flexibility-phases',
    title: "Flexibilidade Cognitiva",
    category: "Observação • Executiva",
    description: "Atividade baseada no Wisconsin Card Sorting para observar padrões de adaptação e flexibilidade cognitiva.",
    features: ["Mudança de regras", "Adaptabilidade", "Função executiva", "Perseveração"],
    ageRange: "8-18 anos",
    duration: "10-15 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-indigo-100 text-indigo-800",
    gradient: "from-indigo-400 to-indigo-600",
    unlocked: true,
    condition: "TEA",
    scientificBasis: "Wisconsin Card Sorting Test (WCST)"
  },
  {
    id: 'phonological-processing',
    title: "Processamento Fonológico",
    category: "Observação • Linguagem",
    description: "Observe padrões de habilidades de consciência fonológica e processamento de sons da fala.",
    features: ["Rimas", "Segmentação", "Síntese", "Manipulação fonêmica"],
    ageRange: "5-16 anos",
    duration: "6-10 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-teal-100 text-teal-800",
    gradient: "from-teal-400 to-teal-600",
    unlocked: true,
    condition: "Dislexia",
    scientificBasis: "Teste de Consciência Fonológica"
  },
  {
    id: 'executive-processing-phases',
    title: "Processamento Executivo",
    category: "Observação • Executiva",
    description: "Atividade baseada na Torre de Londres para observar padrões de planejamento e organização.",
    features: ["Planejamento", "Organização", "Controle inibitório", "Flexibilidade mental"],
    ageRange: "8-18 anos",
    duration: "12-18 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-purple-100 text-purple-800",
    gradient: "from-purple-400 to-purple-600",
    unlocked: true,
    condition: "TDAH/TEA",
    scientificBasis: "Torre de Londres - Teste clássico de funções executivas"
  }
];

export default function DiagnosticTests() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 text-white py-12 pb-32 relative overflow-hidden">
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
              Atividades de 
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Observação Comportamental
              </span>
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-4xl mx-auto text-balance mb-8">
            Atividades baseadas em protocolos científicos para observação de padrões comportamentais 
            em áreas cognitivas específicas. Não constituem diagnóstico clínico.
          </p>
          
          {/* Warning Notice */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="backdrop-blur-sm bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-100">
                      <p className="font-semibold mb-2">⚠️ Importante: Não é diagnóstico clínico</p>
                      <p className="text-left mb-2">
                        Estas atividades observam <strong>padrões comportamentais</strong> durante tarefas específicas, 
                        mas <strong>NÃO constituem diagnóstico</strong> de qualquer condição.
                      </p>
                      <p className="text-left">
                        Os resultados devem ser interpretados <strong>exclusivamente por profissionais qualificados</strong> 
                        (psicólogos, neurologistas, psicopedagogos) e complementados com avaliação clínica completa.
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
              <h3 className="font-heading text-xl font-bold text-white">Como Funcionam as Atividades</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Cada atividade observa funções cognitivas específicas</p>
              <p>• Baseadas em protocolos de pesquisa científica</p>
              <p>• Resultados mostram padrões comportamentais observados</p>
              <p>• Relatórios para interpretação profissional</p>
            </CardContent>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold text-white">Próximos Passos</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>• Realize as atividades em ambiente tranquilo</p>
              <p>• Compartilhe relatórios com profissionais qualificados</p>
              <p>• Acesse o painel de observação para análise detalhada</p>
              <p>• Continue com atividades terapêuticas personalizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA to Clinical Dashboard */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 backdrop-blur-sm bg-gradient-to-br from-primary/10 to-primary/5 border-border">
            <CardContent>
              <h3 className="font-heading text-2xl font-bold mb-4 text-foreground">
                Relatórios Clínicos
              </h3>
              <p className="text-muted-foreground mb-6">
                Acesse todos os relatórios clínicos, análises de IA e histórico de avaliações
              </p>
              <Button 
                size="lg" 
                asChild
              >
                <Link to="/reports" className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ver Relatórios
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}