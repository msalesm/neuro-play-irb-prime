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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-secondary/20 text-secondary",
    gradient: "from-secondary/60 to-secondary",
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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-accent/20 text-accent-foreground",
    gradient: "from-accent/60 to-accent",
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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-destructive/20 text-destructive",
    gradient: "from-destructive/60 to-destructive",
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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-primary/20 text-primary",
    gradient: "from-primary/60 to-primary",
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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-accent/20 text-accent-foreground",
    gradient: "from-accent/60 to-accent",
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
    duration: "~5 min",
    players: "1 jogador",
    status: "Observação",
    color: "bg-secondary/20 text-secondary",
    gradient: "from-secondary/60 to-secondary",
    unlocked: true,
    condition: "TDAH/TEA",
    scientificBasis: "Torre de Londres - Teste clássico de funções executivas"
  }
];

export default function DiagnosticTests() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,30%,8%)] via-[hsl(0,50%,15%)] to-[hsl(220,30%,8%)] text-primary-foreground py-12 pb-32 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-4 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-warning/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-destructive to-warning rounded-2xl flex items-center justify-center shadow-2xl shadow-destructive/25">
              <ClipboardCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground">
              Atividades de 
              <span className="bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
                Observação Comportamental
              </span>
            </h1>
          </div>
          <p className="text-xl text-primary-foreground/70 max-w-4xl mx-auto text-balance mb-8">
            Atividades baseadas em protocolos científicos para observação de padrões comportamentais 
            em áreas cognitivas específicas. Não constituem diagnóstico clínico.
          </p>
          
          {/* Warning Notice */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="backdrop-blur-sm bg-warning/10 border-warning/30">
              <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-warning-foreground">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {diagnosticTests.map((test) => (
            <Card 
              key={test.id}
              className="p-4 border-primary-foreground/20 backdrop-blur-sm bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-all duration-300 hover:shadow-xl hover:shadow-destructive/20 hover:-translate-y-1 group relative overflow-hidden"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${test.gradient} opacity-20`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-gradient-to-r from-destructive/80 to-warning/80 text-primary-foreground border-0 shadow-lg font-semibold text-xs">
                    {test.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    {test.status}
                  </Badge>
                </div>

                <h3 className="font-heading text-lg font-bold mb-2 text-primary-foreground group-hover:text-destructive/80 transition-colors">
                  {test.title}
                </h3>

                <p className="text-primary-foreground/70 mb-3 leading-relaxed text-sm line-clamp-2">
                  {test.description}
                </p>

                {/* Scientific Basis */}
                <div className="mb-3 p-2 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold text-primary-foreground/80 mb-0.5">Base Científica:</p>
                  <p className="text-xs text-primary-foreground/70">{test.scientificBasis}</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-4 text-xs text-primary-foreground/70">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3 w-3" />
                    <span>{test.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold text-success">{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span>{test.players}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-xs uppercase tracking-wide text-primary-foreground/80 mb-2">
                    Características
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {test.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-primary-foreground/10 px-2 py-0.5 rounded-full text-primary-foreground/70">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-destructive to-warning hover:from-destructive/90 hover:to-warning/90 text-primary-foreground border-0 shadow-lg hover:shadow-destructive/25 transition-all duration-300 text-sm py-2"
                  asChild
                >
                  <Link to={test.id.includes('-phases') ? `/games/${test.id}` : `/games/${test.id}`} className="flex items-center gap-2 justify-center">
                    <Play className="h-3 w-3" />
                    Iniciar
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-6 backdrop-blur-sm bg-primary-foreground/10 border-primary-foreground/20">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold text-primary-foreground">Como Funcionam as Atividades</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-primary-foreground/70">
              <p>• Cada atividade observa funções cognitivas específicas</p>
              <p>• Baseadas em protocolos de pesquisa científica</p>
              <p>• Resultados mostram padrões comportamentais observados</p>
              <p>• Relatórios para interpretação profissional</p>
            </CardContent>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-primary-foreground/10 border-primary-foreground/20">
            <CardHeader>
              <h3 className="font-heading text-xl font-bold text-primary-foreground">Próximos Passos</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-primary-foreground/70">
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