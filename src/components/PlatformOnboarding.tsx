import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

interface PlatformOnboardingProps {
  pageName: string;
}

export function PlatformOnboarding({ pageName }: PlatformOnboardingProps) {
  const [run, setRun] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const tourKey = `tour_seen_${pageName}`;
    const seen = localStorage.getItem(tourKey);
    
    if (!seen) {
      // Delay to ensure DOM is loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setHasSeenTour(true);
  }, [pageName]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status as string)) {
      setRun(false);
      localStorage.setItem(`tour_seen_${pageName}`, 'true');
      setHasSeenTour(true);
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
            <h2 className="text-xl font-bold mb-2">Bem-vindo ao NeuroPlay! 🎉</h2>
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
            <h2 className="text-xl font-bold mb-2">Sistema Planeta Azul 🌌</h2>
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
    </>
  );
}
