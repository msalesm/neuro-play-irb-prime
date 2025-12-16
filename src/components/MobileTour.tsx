import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useMobileTour } from '@/hooks/useMobileTour';

const tourSteps: Step[] = [
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Bem-vindo ao Neuro IRB Prime! 🎮</h2>
        <p className="text-sm text-muted-foreground">
          Vamos fazer um tour rápido pelos principais recursos da plataforma no mobile.
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-mobile-tour="menu-button"]',
    content: (
      <div>
        <h3 className="font-semibold mb-2">Menu Principal 🍔</h3>
        <p className="text-sm text-muted-foreground">
          Toque no menu sanduíche para acessar todas as funcionalidades: Planetas Terapêuticos, Avaliações, Configurações e muito mais!
        </p>
      </div>
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-mobile-tour="bottom-nav"]',
    content: (
      <div>
        <h3 className="font-semibold mb-2">Navegação Rápida ⚡</h3>
        <p className="text-sm text-muted-foreground">
          Use a barra inferior para acessar rapidamente: Sistema de Planetas, Jogos, Testes, Triagem e Aprendizado.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-mobile-tour="bottom-nav"] a:first-child',
    content: (
      <div>
        <h3 className="font-semibold mb-2">Sistema Planeta Azul 🌍</h3>
        <p className="text-sm text-muted-foreground">
          Explore os 5 planetas terapêuticos: Aurora (TEA), Vortex (TDAH), Lumen (Dislexia), Calm (Regulação Emocional) e Order (Funções Executivas).
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-mobile-tour="bottom-nav"] a:nth-child(2)',
    content: (
      <div>
        <h3 className="font-semibold mb-2">Jogos Cognitivos 🎯</h3>
        <p className="text-sm text-muted-foreground">
          Acesse todos os jogos terapêuticos organizados por categoria: atenção, memória, flexibilidade cognitiva e mais.
        </p>
      </div>
    ),
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-mobile-tour="floating-chat"]',
    content: (
      <div>
        <h3 className="font-semibold mb-2">Chat Terapêutico 💬</h3>
        <p className="text-sm text-muted-foreground">
          Converse com nossa IA terapêutica a qualquer momento! Tire dúvidas, receba orientações e acompanhamento emocional.
        </p>
      </div>
    ),
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Pronto para começar! 🚀</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Explore a plataforma e inicie a jornada terapêutica. Você pode rever este tour a qualquer momento nas Configurações.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Dica: Comece pelo Sistema Planeta Azul para ver as missões recomendadas!
        </p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
];

export function MobileTour() {
  const { runTour, completeTour, skipTour } = useMobileTour();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      completeTour();
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
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
  );
}
