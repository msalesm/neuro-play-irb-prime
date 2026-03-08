import type { Planeta } from '@/types/planeta';

export const planetas: Planeta[] = [
  {
    id: 'aurora',
    nome: 'TEA',
    diagnostico: 'TEA',
    cor: '#7C3AED', // Roxo para TEA
    descricao: 'Um planeta envolto em névoas sensoriais que se dissipam à medida que você domina a comunicação e o processamento sensorial',
    focos: [
      'Comunicação Social',
      'Processamento Sensorial',
      'Sequência e Rotina',
      'Reconhecimento Emocional'
    ],
    jogos: [
      {
        id: 'cosmic-sequence',
        nome: 'Sequência Cósmica',
        descricao: 'Observe e repita sequências de luzes - trabalha memória e padrões visuais',
        duracao: 5,
        dificuldade: 2,
        rota: '/games/cosmic-sequence',
        icone: '✨',
        completado: false,
        novo: true
      },
      {
        id: 'emotion-lab',
        nome: 'Laboratório de Emoções',
        descricao: 'Identifique e compreenda diferentes emoções através de expressões faciais',
        duracao: 10,
        dificuldade: 2,
        rota: '/games/emotion-lab',
        icone: '😊',
        completado: false
      },
      {
        id: 'social-scenarios',
        nome: 'Cenários Sociais',
        descricao: 'Navegue por situações sociais comuns e pratique respostas apropriadas',
        duracao: 15,
        dificuldade: 3,
        rota: '/games/social-scenarios',
        icone: '👥',
        completado: false
      },
      {
        id: 'sensory-flow',
        nome: 'Fluxo Sensorial',
        descricao: 'Regule estímulos sensoriais e encontre seu ponto de conforto',
        duracao: 12,
        dificuldade: 2,
        rota: '/games/sensory-flow',
        icone: '🌊',
        completado: false
      },
      {
        id: 'theory-of-mind',
        nome: 'Teoria da Mente',
        descricao: 'Compreenda perspectivas e pensamentos dos outros',
        duracao: 10,
        dificuldade: 3,
        rota: '/games/theory-of-mind',
        icone: '🧠',
        completado: false
      }
    ],
    recompensa: 'Dissipar a névoa sensorial e revelar auroras deslumbrantes',
    icone: '🌟',
    posicao: { x: 20, y: 50 },
    tamanho: 'grande',
    desbloqueado: true,
    progressoAtual: 0,
    totalMissoes: 5
  },
  {
    id: 'vortex',
    nome: 'TDAH',
    diagnostico: 'TDAH',
    cor: '#EF4444', // Vermelho para TDAH
    descricao: 'Um planeta em constante movimento onde você aprende a dominar a atenção, controlar impulsos e estabilizar o campo magnético',
    focos: [
      'Atenção Sustentada',
      'Controle Inibitório',
      'Planejamento e Organização',
      'Gestão do Tempo'
    ],
    jogos: [
      {
        id: 'tower-defense',
        nome: 'Torre de Defesa',
        descricao: 'Defenda sua base estrategicamente! Posicione torres e elimine ondas de invasores',
        duracao: 10,
        dificuldade: 3,
        rota: '/games/tower-defense',
        icone: '🏰',
        completado: false,
        novo: true
      },
      {
        id: 'stack-tower',
        nome: 'Torre Perfeita',
        descricao: 'Construa a torre mais alta praticando timing perfeito e controle de impulsos',
        duracao: 5,
        dificuldade: 2,
        rota: '/games/stack-tower',
        icone: '🏗️',
        completado: false,
        novo: true
      },
      {
        id: 'attention-sustained',
        nome: 'Missão Cronometrada',
        descricao: 'Complete tarefas mantendo foco por períodos crescentes - 6 fases progressivas',
        duracao: 8,
        dificuldade: 2,
        rota: '/games/attention-sustained-phases',
        icone: '⏱️',
        completado: false
      },
      {
        id: 'executive-processing',
        nome: 'Desvio de Impulsos',
        descricao: 'Pratique controle inibitório respondendo seletivamente - 6 fases progressivas',
        duracao: 10,
        dificuldade: 3,
        rota: '/games/executive-processing-phases',
        icone: '🎯',
        completado: false
      },
      {
        id: 'foco-rapido',
        nome: 'Foco Rápido',
        descricao: 'Melhore velocidade de processamento e atenção seletiva - 6 fases progressivas',
        duracao: 8,
        dificuldade: 2,
        rota: '/games/foco-rapido-phases',
        icone: '⚡',
        completado: false
      }
    ],
    recompensa: 'Estabilizar o campo magnético e controlar os vórtices de energia',
    icone: '🌀',
    posicao: { x: 50, y: 30 },
    tamanho: 'grande',
    desbloqueado: true,
    progressoAtual: 0,
    totalMissoes: 7
  },
  {
    id: 'lumen',
    nome: 'Dislexia',
    diagnostico: 'Dislexia',
    cor: '#F59E0B', // Dourado/Amarelo para Dislexia
    descricao: 'Um planeta obscurecido onde cada conquista fonológica ilumina novas regiões e revela palavras escondidas',
    focos: [
      'Consciência Fonológica',
      'Reconhecimento Visual',
      'Fluência de Leitura',
      'Discriminação de Sons'
    ],
    jogos: [
      {
        id: 'phonological-processing',
        nome: 'Labirinto de Sílabas',
        descricao: 'Navegue por labirintos identificando e combinando sílabas',
        duracao: 12,
        dificuldade: 2,
        rota: '/games/phonological-processing',
        icone: '🔤',
        completado: false
      },
      {
        id: 'caca-letras',
        nome: 'Caça-Palavras Auditivo',
        descricao: 'Encontre palavras através de pistas sonoras',
        duracao: 10,
        dificuldade: 2,
        rota: '/games/caca-letras',
        icone: '🔍',
        completado: false
      },
      {
        id: 'silaba-magica',
        nome: 'Sílaba Mágica',
        descricao: 'Combine sílabas para formar palavras e liberar magia',
        duracao: 10,
        dificuldade: 2,
        rota: '/games/silaba-magica',
        icone: '✨',
        completado: false
      },
      {
        id: 'contador-historias',
        nome: 'Contador de Histórias',
        descricao: 'Desenvolva fluência através de narrativas interativas',
        duracao: 15,
        dificuldade: 3,
        rota: '/games/contador-historias',
        icone: '📖',
        completado: false
      }
    ],
    recompensa: 'Iluminar todas as regiões obscuras e revelar a biblioteca galáctica',
    icone: '💡',
    posicao: { x: 80, y: 50 },
    tamanho: 'grande',
    desbloqueado: true,
    progressoAtual: 0,
    totalMissoes: 4
  },
  {
    id: 'calm',
    nome: 'Regulação Emocional',
    diagnostico: 'Regulação Emocional',
    cor: '#10B981', // Verde para calma
    descricao: 'Um planeta oceânico onde você aprende a regular emoções e estabilizar as marés internas através da respiração',
    focos: [
      'Autocontrole Emocional',
      'Técnicas de Respiração',
      'Reconhecimento Corporal',
      'Mindfulness'
    ],
    jogos: [
      {
        id: 'mindful-breath',
        nome: 'Respiração Guiada',
        descricao: 'Pratique técnicas de respiração para acalmar a mente',
        duracao: 5,
        dificuldade: 1,
        rota: '/games/mindful-breath',
        icone: '🫁',
        completado: false
      },
      {
        id: 'emotional-weather',
        nome: 'Clima Emocional',
        descricao: 'Identifique e regule suas emoções como padrões climáticos',
        duracao: 10,
        dificuldade: 2,
        rota: '/games/emotional-weather',
        icone: '🌤️',
        completado: false
      },
    ],
    recompensa: 'Estabilizar o oceano interior e criar um santuário de paz',
    icone: '🌊',
    posicao: { x: 50, y: 70 },
    tamanho: 'medio',
    desbloqueado: true,
    progressoAtual: 0,
    totalMissoes: 3
  },
  {
    id: 'order',
    nome: 'Funções Executivas',
    diagnostico: 'Funções Executivas',
    cor: '#3B82F6', // Azul para ordem
    descricao: 'Um planeta de engrenagens e órbitas onde organização e planejamento alinham os satélites do sistema',
    focos: [
      'Memória de Trabalho',
      'Organização',
      'Sequenciamento',
      'Planejamento Estratégico'
    ],
    jogos: [
      {
        id: 'memory-workload',
        nome: 'Carga de Memória',
        descricao: 'Treine sua memória de trabalho com desafios crescentes',
        duracao: 10,
        dificuldade: 3,
        rota: '/games/memory-workload',
        icone: '🧩',
        completado: false
      },
      {
        id: 'cognitive-flexibility',
        nome: 'Flexibilidade Cognitiva',
        descricao: 'Adapte-se rapidamente a novas regras e padrões',
        duracao: 10,
        dificuldade: 3,
        rota: '/games/cognitive-flexibility-phases',
        icone: '🔄',
        completado: false
      },
      {
        id: 'quebra-cabeca-magico',
        nome: 'Quebra-Cabeça de Planejamento',
        descricao: 'Resolva quebra-cabeças que exigem estratégia e sequência',
        duracao: 15,
        dificuldade: 3,
        rota: '/games/quebra-cabeca-magico',
        icone: '🎲',
        completado: false
      },
      {
        id: 'spatial-architect',
        nome: 'Arquiteto Espacial',
        descricao: 'Organize estruturas espaciais com precisão',
        duracao: 12,
        dificuldade: 3,
        rota: '/games/spatial-architect',
        icone: '🏗️',
        completado: false
      }
    ],
    recompensa: 'Alinhar todas as órbitas dos satélites em perfeita sincronia',
    icone: '⚙️',
    posicao: { x: 35, y: 20 },
    tamanho: 'medio',
    desbloqueado: true,
    progressoAtual: 0,
    totalMissoes: 4
  }
];