import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Gamepad2, Heart, CheckCircle, Target, Award, Sparkles, FileText, Users, BarChart3, BookOpen, Zap, Shield, Download, Video, ClipboardList, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Logo removed - using text brand
import heroImage from '@/assets/hero-children-learning.jpg';
import childFocused from '@/assets/child-focused-learning.jpg';
import groupTherapy from '@/assets/group-therapy-session.jpg';
import { generatePlatformPresentation } from '@/lib/platformPresentationGenerator';

export default function NeuroPlayMainLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Gradiente NeuroPlay */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#3A86FF] via-[#8338EC] to-[#3A86FF] shadow-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">NeuroPlay</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Sobre</a>
            <a href="#beneficios" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Benefícios</a>
            <a href="#funcionalidades" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Funcionalidades</a>
            <Button 
              onClick={() => navigate('/sistema-planeta-azul')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              🪐 Sistema Planeta Azul
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-[#3A86FF] hover:bg-white/90 font-semibold px-6"
            >
              Acessar Plataforma
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A86FF]/10 text-[#3A86FF] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              NeuroPlay - Aprendizado Cognitivo Interativo
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[#3A86FF] mb-6 leading-tight">
              NeuroPlay
              <br />
              <span className="text-[#8338EC]">porque cada mente é única</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Plataforma de jogos terapêuticos inteligentes para desenvolvimento cognitivo de crianças com TEA, TDAH e Dislexia. 
              Mais do que tecnologia, oferecemos cuidado, compromisso e resultado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                className="text-lg px-8 h-14 bg-gradient-to-r from-[#0a1e35] to-[#005a70] hover:opacity-90"
              >
                Começar Agora
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate('/sistema-planeta-azul')} 
                className="text-lg px-8 h-14 bg-gradient-to-r from-[#c7923e] to-[#d4a54f] hover:opacity-90 text-white"
              >
                🪐 Sistema Planeta Azul
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/games')} 
                className="text-lg px-8 h-14 border-[#005a70] text-[#005a70] hover:bg-[#005a70]/10"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Explorar Jogos
              </Button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            <img 
              src={heroImage} 
              alt="Crianças aprendendo com jogos educativos" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Sistema Planeta Azul - Destaque Especial */}
      <section className="py-20 bg-gradient-to-b from-[#0a1e35] via-[#005a70] to-[#0a1e35] relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden shadow-2xl hover-scale">
              <div className="h-2 bg-gradient-to-r from-[#c7923e] via-white to-[#c7923e]" />
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left side - Info */}
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c7923e]/20 text-[#c7923e] text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Novidade NeuroPlay 2.0
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                      Sistema Planeta Azul
                    </h2>
                    
                    <p className="text-white/80 text-lg leading-relaxed">
                      Explore universos terapêuticos interativos! Cada planeta representa um diagnóstico específico 
                      com jogos personalizados, missões e recompensas. Uma jornada gamificada de desenvolvimento cognitivo.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-8 h-8 rounded-full bg-[#c7923e]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-[#c7923e]" />
                        </div>
                        <span>5 Planetas temáticos (TEA, TDAH, Dislexia, Regulação, FE)</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-8 h-8 rounded-full bg-[#c7923e]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-[#c7923e]" />
                        </div>
                        <span>25+ jogos cognitivos adaptativos</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-8 h-8 rounded-full bg-[#c7923e]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-[#c7923e]" />
                        </div>
                        <span>Sistema de missões e recompensas</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button 
                        size="lg"
                        onClick={() => navigate('/sistema-planeta-azul')}
                        className="bg-[#c7923e] hover:bg-[#c7923e]/90 text-white font-semibold px-8"
                      >
                        🪐 Explorar Sistema Planeta Azul
                      </Button>
                      <Button 
                        size="lg"
                        variant="outline"
                        onClick={() => navigate('/dashboard-pais')}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Ver Dashboard
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Visual */}
                  <div className="relative">
                    <div className="relative w-full aspect-square max-w-sm mx-auto">
                      {/* Central sun/star */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c7923e] to-yellow-500 animate-pulse shadow-2xl" />
                      </div>
                      
                      {/* Orbiting planets */}
                      {[
                        { emoji: '🌟', color: '#7C3AED', delay: '0s', radius: '35%' },
                        { emoji: '🌀', color: '#EF4444', delay: '0.5s', radius: '45%' },
                        { emoji: '💡', color: '#F59E0B', delay: '1s', radius: '55%' },
                        { emoji: '🌊', color: '#10B981', delay: '1.5s', radius: '40%' },
                        { emoji: '⚙️', color: '#3B82F6', delay: '2s', radius: '50%' },
                      ].map((planet, idx) => (
                        <div
                          key={idx}
                          className="absolute inset-0 animate-[spin_10s_linear_infinite]"
                          style={{ animationDelay: planet.delay }}
                        >
                          <div
                            className="absolute left-1/2 top-0 w-16 h-16 -ml-8 rounded-full flex items-center justify-center text-2xl shadow-xl border-2 border-white/20"
                            style={{
                              backgroundColor: `${planet.color}80`,
                              transform: `translateY(${planet.radius})`,
                            }}
                          >
                            {planet.emoji}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prontuário Eletrônico e Teleconsulta - DESTAQUE CLÍNICO */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#005a70]/10 text-[#005a70] text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Infraestrutura Clínica Completa
            </div>
            <h2 className="text-4xl font-bold text-[#0a1e35] mb-6">
              Prontuário Eletrônico e Teleconsulta Integrada
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              O NeuroPlay vai além dos jogos terapêuticos. Oferecemos infraestrutura clínica completa 
              com prontuário eletrônico longitudinal e teleconsulta profissional integrada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Prontuário Eletrônico */}
            <Card className="border-2 border-[#005a70]/30 shadow-xl bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#0a1e35] to-[#005a70]" />
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-6">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0a1e35] mb-4">Prontuário Eletrônico</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Registro clínico completo e longitudinal do paciente com timeline integrada, 
                  avaliações estruturadas em 3 blocos (cognitivo, comportamental, socioemocional), 
                  histórico evolutivo e geração automática de relatórios.
                </p>
                <ul className="space-y-3">
                  {[
                    'Mapa cognitivo via visualização radar',
                    'Timeline de todas as ações clínicas',
                    'Avaliações em 3 blocos: cognitivo, comportamental e socioemocional',
                    'Relatórios automáticos com IA',
                    'Logs imutáveis para auditoria LGPD'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-[#005a70] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-[#0a1e35] to-[#005a70]"
                  onClick={() => navigate('/auth')}
                >
                  Acessar Prontuário
                </Button>
              </CardContent>
            </Card>

            {/* Teleconsulta Integrada */}
            <Card className="border-2 border-[#c7923e]/30 shadow-xl bg-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#c7923e] to-[#d4a54f]" />
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#c7923e] to-[#d4a54f] rounded-2xl flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0a1e35] mb-4">Teleconsulta com Neuro</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Vídeo WebRTC nativo com interface split-screen: consulta em vídeo de um lado, 
                  prontuário completo do paciente do outro. Anotações em tempo real, fechamento 
                  clínico obrigatório e plano de follow-up integrado.
                </p>
                <ul className="space-y-3">
                  {[
                    'Split-screen: vídeo + prontuário simultâneos',
                    'Acesso ao histórico completo durante sessão',
                    'Anotações em tempo real por bloco clínico',
                    'Fechamento obrigatório com sumário',
                    'Plano de follow-up integrado ao prontuário'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-[#c7923e] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-[#c7923e] to-[#d4a54f]"
                  onClick={() => navigate('/auth')}
                >
                  Agendar Teleconsulta
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Clínico */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="border-none shadow-lg bg-gradient-to-br from-[#0a1e35] to-[#005a70] text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-center">Fluxo Clínico Integrado</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: ClipboardList, label: 'Triagem', desc: 'Avaliação inicial' },
                    { icon: FileText, label: 'Prontuário', desc: 'Registro completo' },
                    { icon: Video, label: 'Teleconsulta', desc: 'Sessão integrada' },
                    { icon: Calendar, label: 'Follow-up', desc: 'Plano de ação' }
                  ].map((step, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-semibold text-sm">{step.label}</p>
                      <p className="text-xs text-white/70">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#0a1e35] leading-tight">
                Mais do que oferecer jogos,
                <span className="text-[#005a70]"> cuidamos de pessoas</span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                A plataforma NeuroPlay nasceu com um propósito claro: 
                transformar o desenvolvimento cognitivo de crianças através de tecnologia adaptativa e baseada em ciência.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Valorizamos as relações humanas e nos dedicamos a atender com excelência às diversas necessidades em saúde, 
                oferecendo soluções inteligentes e humanizadas para crianças com TEA, TDAH e Dislexia.
              </p>

              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#005a70]" />
                  <span className="text-gray-700 font-medium">Baseado em Ciência</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#005a70]" />
                  <span className="text-gray-700 font-medium">Adaptação por IA</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={childFocused} 
                alt="Criança concentrada em atividade educativa" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plataforma Completa - O que desenvolvemos */}
      <section id="funcionalidades" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#0a1e35] mb-6">
              Plataforma Completa para o Desenvolvimento Cognitivo
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              O NeuroPlay é uma plataforma clínica-terapêutica completa, 
              oferecendo tecnologia de ponta para crianças neurodiversas, seus pais e profissionais de saúde.
            </p>
          </div>

          {/* Módulos Principais */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">25+ Jogos Terapêuticos</h3>
                <p className="text-gray-600 mb-4">
                  Jogos cognitivos baseados em neurociência: memória, atenção sustentada, controle inibitório, 
                  flexibilidade cognitiva, consciência fonológica, timing e coordenação motora.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Torre Perfeita, Sequência Cósmica, Crystal Match</li>
                  <li>• Tower Defense, Space Shooter, Caça Foco</li>
                  <li>• Dificuldade adaptativa por IA</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Chatbot Terapêutico</h3>
                <p className="text-gray-600 mb-4">
                  Assistente de IA especializado em neurodiversidade com coaching parental, 
                  check-ins emocionais e detecção de padrões comportamentais.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Análise de sentimentos em tempo real</li>
                  <li>• Insights comportamentais automáticos</li>
                  <li>• Exportação de relatórios PDF</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Gamificação Avançada</h3>
                <p className="text-gray-600 mb-4">
                  Sistema completo de motivação com avatares evolutivos, badges de 5 níveis, 
                  streaks diários e recompensas personalizadas.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Avatar que evolui com progresso</li>
                  <li>• Missões diárias e semanais</li>
                  <li>• Sistema Planeta Azul com 5 planetas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Testes Diagnósticos</h3>
                <p className="text-gray-600 mb-4">
                  Triagem unificada TUNP para TEA, TDAH e Dislexia. 
                  Acesso universal sem necessidade de cadastro prévio.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• SNAP-IV e ASRS para TDAH</li>
                  <li>• Triagem para TEA</li>
                  <li>• Pré-indicadores de Dislexia</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Análise Preditiva</h3>
                <p className="text-gray-600 mb-4">
                  IA analisa padrões comportamentais para detecção precoce de crises, 
                  alertas preventivos e recomendações de intervenção.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Detecção de regressão cognitiva</li>
                  <li>• Alertas preventivos automáticos</li>
                  <li>• Relatórios clínicos com IA</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Jogos Cooperativos</h3>
                <p className="text-gray-600 mb-4">
                  Atividades multiplayer para pais e filhos com sincronização em tempo real 
                  e métricas de vínculo familiar.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Quebra-cabeça cooperativo</li>
                  <li>• Métricas de colaboração</li>
                  <li>• Fortalecimento do vínculo</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Histórias Sociais</h3>
                <p className="text-gray-600 mb-4">
                  Narrativas ilustradas passo a passo para ensinar rotinas diárias: 
                  escovar dentes, lavar mãos, tomar banho, ir ao médico.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Imagens e áudio integrados</li>
                  <li>• Adaptação por acessibilidade</li>
                  <li>• Telemetria de progresso</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Acessibilidade Clínica</h3>
                <p className="text-gray-600 mb-4">
                  5 presets de acessibilidade: TEA Baixa Sensorialidade, TDAH Foco, 
                  Baixa Visão, Deficiência Motora e padrão.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Ajuste de fonte e contraste</li>
                  <li>• Redução de movimento</li>
                  <li>• Feedback háptico configurável</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0a1e35] mb-3">Multi-Stakeholder</h3>
                <p className="text-gray-600 mb-4">
                  Dashboards especializados para pais, terapeutas, professores e administradores 
                  com controle de acesso baseado em roles.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Dashboard da Família</li>
                  <li>• Painel Clínico para Terapeutas</li>
                  <li>• Gestão de Turmas para Escolas</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Nossa Abordagem à Neurodiversidade */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#0a1e35] mb-4">
                Nossa Abordagem à <span className="text-[#005a70]">Neurodiversidade</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Celebramos a neurodiversidade e acreditamos que cada criança tem seu próprio ritmo e potencial único. 
                Nossa plataforma foi desenvolvida para atender especificamente três condições do neurodesenvolvimento:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-[#005a70]/20 shadow-lg bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a1e35] mb-3">TEA</h3>
                  <p className="text-sm font-semibold text-[#005a70] mb-3">Transtorno do Espectro Autista</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Jogos para desenvolvimento de habilidades sociais, processamento emocional, teoria da mente 
                    e comunicação. Ambiente controlado com ajustes sensoriais individualizados.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#005a70]/20 shadow-lg bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a1e35] mb-3">TDAH</h3>
                  <p className="text-sm font-semibold text-[#005a70] mb-3">Déficit de Atenção e Hiperatividade</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Treinamento de atenção sustentada, controle inibitório, memória de trabalho e função executiva. 
                    Sistema de recompensas imediatas e feedback constante.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#005a70]/20 shadow-lg bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a1e35] mb-3">Dislexia</h3>
                  <p className="text-sm font-semibold text-[#005a70] mb-3">Dificuldade de Leitura e Escrita</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Exercícios de consciência fonológica, processamento fonológico, reconhecimento de padrões 
                    e decodificação. Apresentação multissensorial adaptada.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Diferenciais da Nossa Abordagem */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-[#0a1e35] to-[#005a70] text-white">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold mb-6 text-center">Diferenciais da Nossa Abordagem</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Conformidade Legal (LGPD e Lei 14.254/21)</h4>
                      <p className="text-white/80 text-sm">
                        Plataforma desenvolvida em conformidade com a Lei Brasileira de Proteção de Dados e 
                        Lei Federal 14.254/21 que instituiu a Política Nacional de Prevenção de Dificuldades de Aprendizagem.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Brain className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Base Neurocientífica</h4>
                      <p className="text-white/80 text-sm">
                        Todos os jogos são fundamentados em evidências da neurociência cognitiva e validados 
                        por profissionais de saúde especializados em neurodesenvolvimento.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Target className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Adaptação Individual</h4>
                      <p className="text-white/80 text-sm">
                        IA analisa o desempenho em tempo real e ajusta automaticamente a dificuldade, 
                        estímulos sensoriais e tipo de feedback para cada criança.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Heart className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Abordagem Humanizada</h4>
                      <p className="text-white/80 text-sm">
                        Celebramos a neurodiversidade como uma variação natural. Nosso foco é desenvolver 
                        habilidades e fortalecer potenciais únicos de cada criança.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Download Button */}
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={generatePlatformPresentation}
                    size="lg"
                    className="bg-[#c7923e] text-white hover:bg-[#c7923e]/90 font-semibold"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Baixar Apresentação Institucional
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#0a1e35] mb-6">Nossa Missão</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              A cada dia levarmos a mais crianças e famílias o nosso atendimento especializado. 
              O NeuroPlay investe no que há de mais moderno em tecnologia educacional, 
              porém com o foco de valorizar cada criança e profissional que trabalha conosco.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="border-none shadow-lg hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#0a1e35] mb-2">15+</div>
                <div className="text-sm text-gray-600">Jogos Terapêuticos</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#0a1e35] mb-2">100%</div>
                <div className="text-sm text-gray-600">Baseado em Ciência</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#0a1e35] mb-2">IA</div>
                <div className="text-sm text-gray-600">Adaptação Inteligente</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0a1e35] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#0a1e35] mb-2">3</div>
                <div className="text-sm text-gray-600">Condições Atendidas</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios com Foto */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
              <img 
                src={groupTherapy} 
                alt="Sessão de terapia em grupo com crianças" 
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-[#0a1e35]">
                Tecnologia que
                <span className="text-[#005a70]"> transforma vidas</span>
              </h2>

              <div className="space-y-4">
                {[
                  { title: 'Personalização Inteligente', desc: 'Jogos que se adaptam automaticamente ao nível e necessidades de cada criança usando IA.' },
                  { title: 'Acompanhamento em Tempo Real', desc: 'Relatórios detalhados para pais e terapeutas acompanharem o progresso.' },
                  { title: 'Validação Científica', desc: 'Desenvolvido com base em neurociência e validado por profissionais da saúde.' },
                  { title: 'Ambiente Seguro', desc: 'Plataforma desenvolvida com foco em acessibilidade e segurança infantil.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#005a70]/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[#005a70]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0a1e35] mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-none shadow-2xl bg-gradient-to-br from-[#0a1e35] to-[#005a70] text-white overflow-hidden">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-6 text-white/90" />
              <h2 className="text-4xl font-bold mb-4">
                Comece a transformar o desenvolvimento do seu filho hoje
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Junte-se às famílias que já confiam no NeuroPlay para o desenvolvimento cognitivo de suas crianças.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-[#3A86FF] hover:bg-white/90 text-lg px-10 h-14 font-semibold"
              >
                Criar Conta Gratuita
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#3A86FF] via-[#8338EC] to-[#3A86FF] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-white" />
              <span className="text-sm text-white/80">© 2024 NeuroPlay. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-6 text-sm text-white/80">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
