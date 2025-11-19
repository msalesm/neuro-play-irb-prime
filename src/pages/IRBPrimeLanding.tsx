import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Gamepad2, Heart, CheckCircle, Target, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import irbPrimeLogoWhite from '@/assets/irb-prime-logo-white.png';
import heroImage from '@/assets/hero-children-learning.jpg';
import childFocused from '@/assets/child-focused-learning.jpg';
import groupTherapy from '@/assets/group-therapy-session.jpg';

export default function IRBPrimeLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Gradiente Azul IRB */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#0a1e35] via-[#004a5a] to-[#005a70] shadow-lg">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <img src={irbPrimeLogoWhite} alt="IRB Prime Care" className="h-14 hover-scale" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Sobre</a>
            <a href="#beneficios" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Benefícios</a>
            <a href="#funcionalidades" className="text-white/90 hover:text-white transition-colors text-sm font-medium">Funcionalidades</a>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-[#0a1e35] hover:bg-white/90 font-semibold px-6"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#005a70]/10 text-[#005a70] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              IRB Prime Care - Excelência em Saúde
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[#0a1e35] mb-6 leading-tight">
              NeuroPlay
              <br />
              <span className="text-[#005a70]">por que você merece sempre o melhor</span>
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
                A plataforma NeuroPlay, desenvolvida em parceria com a IRB Prime Care, nasceu com um propósito claro: 
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

      {/* Nossa Missão */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-[#0a1e35] mb-6">Nossa Missão</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              A cada dia levarmos a mais crianças e famílias o nosso atendimento especializado. 
              A NeuroPlay IRB Prime Care investe no que há de mais moderno em tecnologia educacional, 
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
                Junte-se às famílias que já confiam na tecnologia IRB Prime Care para o desenvolvimento cognitivo de suas crianças.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-[#0a1e35] hover:bg-white/90 text-lg px-10 h-14 font-semibold"
              >
                Criar Conta Gratuita
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0a1e35] via-[#004a5a] to-[#005a70] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={irbPrimeLogoWhite} alt="IRB Prime Care" className="h-10" />
              <span className="text-sm text-white/80">© 2024 IRB Prime Care. Todos os direitos reservados.</span>
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
