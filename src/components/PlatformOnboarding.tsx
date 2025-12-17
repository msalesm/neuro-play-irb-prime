import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTourAchievements } from '@/hooks/useTourAchievements';
import { TourAchievementModal } from './TourAchievementModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlatformOnboardingProps {
  pageName: string;
}

export function PlatformOnboarding({ pageName }: PlatformOnboardingProps) {
  const [run, setRun] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const location = useLocation();
  const { completeTour, isTourCompleted, refreshProgress } = useTourAchievements();
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);

  useEffect(() => {
    const tourKey = `tour_seen_${pageName}`;
    const seen = localStorage.getItem(tourKey);
    
    if (!seen && !isTourCompleted(pageName)) {
      // Delay to ensure DOM is fully loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setHasSeenTour(true);
  }, [pageName, isTourCompleted]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED) {
      setRun(false);
      localStorage.setItem(`tour_seen_${pageName}`, "true");
      setHasSeenTour(true);

      // Salvar conclusão no Supabase e verificar conquistas
      await completeTour(pageName);
      await checkForNewAchievements();
      toast.success('Tour completado! 🎉');
    }

    // Se o usuário pular o tour, apenas paramos a execução,
    // mas não marcamos como concluído nem salvamos no backend.
    if (status === STATUS.SKIPPED) {
      setRun(false);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar conquistas recém desbloqueadas
      const { data: recentAchievements } = await supabase
        .from('user_achievements')
        .select(`
          achievement_key,
          unlocked_at,
          achievements:achievements!inner(name, description, icon, rarity)
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('unlocked_at', { ascending: false })
        .limit(1);

      if (recentAchievements && recentAchievements.length > 0) {
        const latest = recentAchievements[0];
        // Verificar se foi desbloqueada recentemente (últimos 5 segundos)
        const unlockedTime = new Date(latest.unlocked_at).getTime();
        const now = Date.now();
        if (now - unlockedTime < 5000 && latest.achievements) {
          setUnlockedAchievement(latest.achievements);
          setShowAchievementModal(true);
        }
      }

      await refreshProgress();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const resetTour = () => {
    const tourKey = `tour_seen_${pageName}`;
    localStorage.removeItem(tourKey);
    setHasSeenTour(false);
    setRun(true);
  };

  // Define tours for different pages
  const tours: Record<string, Step[]> = {
    'dashboard-pais': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Bem-vindo ao Neuro IRB Prime! 🎉</h2>
            <p>Vamos fazer um tour rápido pelas principais funcionalidades desta página.</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="avatar-card"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Perfil da Criança 👤</h3>
            <p>Aqui você vê o avatar, nome e idade do seu filho. Clique em "Customizar Avatar" para personalizar!</p>
          </div>
        ),
      },
      {
        target: '[data-tour="emotional-checkin"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Check-in Emocional ❤️</h3>
            <p>Registre como seu filho está se sentindo hoje. É rápido e ajuda muito no acompanhamento!</p>
          </div>
        ),
      },
      {
        target: '[data-tour="current-planet"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Planeta Atual 🌍</h3>
            <p>Cada planeta representa uma área de desenvolvimento. Clique para explorar os jogos!</p>
          </div>
        ),
      },
      {
        target: '[data-tour="daily-mission"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Missão do Dia 🎯</h3>
            <p>Nossa IA recomenda o melhor jogo para hoje baseado no progresso do seu filho.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="quick-report"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Relatório Rápido 📊</h3>
            <p>Veja insights instantâneos sobre o progresso e áreas que precisam de atenção.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="stats"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Estatísticas 📈</h3>
            <p>Acompanhe o desempenho geral: sessões completadas, pontuação média e tempo de prática.</p>
          </div>
        ),
      },
    ],
    'therapeutic-chat': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Chat Terapêutico 💬</h2>
            <p>Converse com nossa IA para check-ins emocionais, coaching e suporte.</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="chat-messages"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Conversação 🗨️</h3>
            <p>Todas as conversas são salvas e analisadas para gerar insights comportamentais.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="quick-actions"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Ações Rápidas ⚡</h3>
            <p>Use estes botões para iniciar check-ins emocionais ou pedir sugestões de atividades.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="insights"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Insights Comportamentais 🧠</h3>
            <p>Nossa IA detecta padrões e gera recomendações automaticamente.</p>
          </div>
        ),
      },
    ],
    'sistema-planeta-azul': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Planeta Azul 🌌</h2>
            <p>Um universo gamificado para o desenvolvimento terapêutico!</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="planets"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">5 Planetas Temáticos 🪐</h3>
            <p>Cada planeta foca em uma área específica: TEA, TDAH, Dislexia, Emoções e Funções Executivas.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="progress"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Progresso Visual 📊</h3>
            <p>Veja quantos jogos foram completados em cada planeta!</p>
          </div>
        ),
      },
    ],
    'screening': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">TUNP - Triagem Unificada 🔍</h2>
            <p>Sistema completo de triagem para identificar necessidades específicas.</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="screening-cards"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">6 Dimensões Avaliadas 📋</h3>
            <p>TEA, TDAH, Dislexia, Discalculia, DLD e Perfil Sensorial.</p>
          </div>
        ),
      },
    ],
    'games': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Jogos Cognitivos 🎮</h2>
            <p>Catálogo completo de jogos terapêuticos para desenvolvimento cognitivo e emocional!</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="game-categories"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Categorias de Jogos 🎯</h3>
            <p>Navegue entre jogos básicos, avançados e especializados de acordo com as necessidades.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="game-card"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Informações do Jogo 📊</h3>
            <p>Cada jogo mostra duração, idade recomendada, habilidades desenvolvidas e status de desbloqueio.</p>
          </div>
        ),
      },
    ],
    'avatar-evolution': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Evolução do Avatar ⭐</h2>
            <p>Personalize e evolua seu avatar conforme progride na plataforma!</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="avatar-display"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Seu Avatar 👤</h3>
            <p>Veja seu avatar atual com todos os acessórios conquistados!</p>
          </div>
        ),
      },
      {
        target: '[data-tour="evolution-stats"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Estatísticas de Evolução 📈</h3>
            <p>Acompanhe seu nível, planetas completados e acessórios desbloqueados.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="accessories"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Acessórios 🎨</h3>
            <p>Equipar acessórios conquistados ao completar planetas e missões!</p>
          </div>
        ),
      },
    ],
    'therapist-dashboard': [
      {
        target: 'body',
        content: (
          <div>
            <h2 className="text-xl font-bold mb-2">Dashboard do Terapeuta 👨‍⚕️</h2>
            <p>Acompanhe a evolução clínica de seus pacientes de forma detalhada.</p>
          </div>
        ),
        placement: 'center',
      },
      {
        target: '[data-tour="patient-info"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Informações do Paciente 📋</h3>
            <p>Veja o perfil completo, avatar e condições diagnosticadas.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="clinical-tabs"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Abas Clínicas 📊</h3>
            <p>Navegue entre evolução, perfil cognitivo, alertas e PEI do paciente.</p>
          </div>
        ),
      },
      {
        target: '[data-tour="export-report"]',
        content: (
          <div>
            <h3 className="font-bold mb-2">Exportar Relatório 📄</h3>
            <p>Gere relatórios clínicos em PDF para compartilhar com outros profissionais.</p>
          </div>
        ),
      },
    ],
  };

  const steps = tours[pageName] || [];

  if (!steps.length) return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#005a70',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: 20,
          },
          buttonNext: {
            backgroundColor: '#005a70',
            borderRadius: 8,
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#666',
            marginRight: 10,
          },
          buttonSkip: {
            color: '#999',
          },
        }}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular',
        }}
      />
      
      {hasSeenTour && (
        <button
          onClick={resetTour}
          className="fixed bottom-6 right-6 z-50 bg-[#005a70] hover:bg-[#0a1e35] text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
          title="Refazer tour"
        >
          <span className="text-xl">❓</span>
        </button>
      )}

      <TourAchievementModal
        isOpen={showAchievementModal}
        achievement={unlockedAchievement}
        onClose={() => setShowAchievementModal(false)}
      />
    </>
  );
}
