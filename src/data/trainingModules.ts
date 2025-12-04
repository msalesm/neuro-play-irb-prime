import type { ModuleDefinition } from '@/hooks/useTeacherTraining';

export const trainingModules: ModuleDefinition[] = [
  {
    id: 'tdah-um-jeito-especial',
    name: 'TDAH: Um Jeito Especial',
    description: 'Compreenda o Transtorno de Déficit de Atenção e Hiperatividade de forma acolhedora',
    icon: '⚡',
    color: 'from-orange-500 to-amber-500',
    duration: '15 min',
    videoUrl: '/videos/tdah-um-jeito-especial.mp4',
    videoTitle: 'TDAH: Um Jeito Especial de Ser',
    topics: [
      'O que é TDAH',
      'Desatenção, hiperatividade e impulsividade',
      'Pontos fortes de pessoas com TDAH',
      'Estratégias de apoio e inclusão',
    ],
    questions: [
      {
        id: 1,
        question: 'O que significa TDAH?',
        options: [
          'Transtorno de Déficit de Atenção e Hiperatividade',
          'Transtorno do Desenvolvimento e Aprendizagem Humana',
          'Técnica de Diagnóstico e Avaliação Hospitalar',
          'Terapia de Desenvolvimento e Habilidades',
        ],
        correct: 0,
        explanation:
          'TDAH significa Transtorno de Déficit de Atenção e Hiperatividade, uma condição neurobiológica que afeta a atenção, o controle de impulsos e a regulação da atividade.',
      },
      {
        id: 2,
        question: 'Quais são as três principais características do TDAH?',
        options: [
          'Tristeza, ansiedade e medo',
          'Desatenção, hiperatividade e impulsividade',
          'Dificuldade de leitura, escrita e matemática',
          'Agressividade, isolamento e timidez',
        ],
        correct: 1,
        explanation:
          'As três características principais do TDAH são desatenção (dificuldade de manter foco), hiperatividade (excesso de atividade motora) e impulsividade (agir sem pensar).',
      },
      {
        id: 3,
        question: 'Pessoas com TDAH podem ter pontos fortes?',
        options: [
          'Não, TDAH só traz dificuldades',
          'Sim, como criatividade, energia e pensamento fora da caixa',
          'Apenas se forem tratadas com medicação',
          'Somente na vida adulta',
        ],
        correct: 1,
        explanation:
          'Pessoas com TDAH frequentemente apresentam pontos fortes como criatividade, energia, capacidade de hiperfoco em áreas de interesse e pensamento inovador.',
      },
      {
        id: 4,
        question: 'Como podemos ajudar uma criança com TDAH na escola?',
        options: [
          'Deixando-a fazer o que quiser',
          'Criando rotinas claras, dividindo tarefas e oferecendo feedback frequente',
          'Isolando-a dos colegas',
          'Exigindo que fique sempre quieta',
        ],
        correct: 1,
        explanation:
          'Estratégias eficazes incluem rotinas estruturadas, dividir tarefas em passos menores, oferecer feedback positivo frequente e permitir movimentação adequada.',
      },
      {
        id: 5,
        question: 'TDAH é resultado de má educação ou falta de disciplina?',
        options: [
          'Sim, é culpa dos pais',
          'Não, é uma condição neurobiológica com base genética',
          'Depende da criança',
          'Sim, é falta de limites',
        ],
        correct: 1,
        explanation:
          'TDAH é uma condição neurobiológica com forte componente genético. Não é causado por má educação ou falta de disciplina, embora o ambiente possa influenciar a expressão dos sintomas.',
      },
    ],
  },
  {
    id: 'tea-um-jeito-unico',
    name: 'TEA: Um Jeito Único',
    description: 'Compreenda o Transtorno do Espectro Autista de forma acolhedora e inclusiva',
    icon: '💙',
    color: 'from-blue-600 to-indigo-600',
    duration: '15 min',
    videoUrl: '/videos/tea-um-jeito-unico.mp4',
    videoTitle: 'TEA: Um Jeito Único de Ser',
    topics: [
      'O que é o Transtorno do Espectro Autista',
      'Características e singularidades',
      'Formas de apoio e inclusão',
      'Comunicação e interação social',
    ],
    questions: [
      {
        id: 1,
        question: 'O que significa TEA?',
        options: [
          'Transtorno Emocional Agudo',
          'Transtorno do Espectro Autista',
          'Terapia Especial Aplicada',
          'Técnica de Ensino Adaptado',
        ],
        correct: 1,
        explanation:
          'TEA significa Transtorno do Espectro Autista, uma condição neurológica que afeta o desenvolvimento e a forma como a pessoa percebe e interage com o mundo.',
      },
      {
        id: 2,
        question: 'Qual é uma característica comum em pessoas com TEA?',
        options: [
          'Todas têm dificuldade de aprendizagem',
          'Todas são iguais em suas características',
          'Cada pessoa com TEA é única e apresenta características próprias',
          'Todas têm deficiência intelectual',
        ],
        correct: 2,
        explanation:
          'O autismo é um espectro, o que significa que cada pessoa com TEA é única e apresenta características, habilidades e desafios próprios.',
      },
      {
        id: 3,
        question: 'Como podemos apoiar uma criança com TEA?',
        options: [
          'Tratando-a de forma diferente dos outros',
          'Respeitando seu tempo, rotinas e formas de comunicação',
          'Forçando interações sociais',
          'Ignorando suas necessidades especiais',
        ],
        correct: 1,
        explanation:
          'O apoio adequado inclui respeitar o tempo da criança, manter rotinas previsíveis e valorizar suas formas únicas de comunicação e expressão.',
      },
      {
        id: 4,
        question: 'O autismo é uma doença que precisa de cura?',
        options: [
          'Sim, todas as pessoas com autismo precisam ser curadas',
          'Não, o autismo é uma forma diferente de ser e perceber o mundo',
          'Depende da gravidade do caso',
          'Somente em crianças pequenas',
        ],
        correct: 1,
        explanation:
          'O autismo não é uma doença, mas uma condição neurológica. Pessoas com TEA têm uma forma única de ser e perceber o mundo, que deve ser respeitada e valorizada.',
      },
      {
        id: 5,
        question: 'O que significa inclusão de pessoas com TEA?',
        options: [
          'Colocá-las em salas separadas',
          'Acolher, respeitar diferenças e promover participação em todos os ambientes',
          'Tratá-las como se não tivessem nenhuma necessidade especial',
          'Apenas incluí-las em atividades específicas',
        ],
        correct: 1,
        explanation:
          'Inclusão verdadeira significa acolher a pessoa com TEA, respeitar suas diferenças e promover sua participação plena em todos os ambientes e atividades.',
      },
    ],
  },
  {
    id: 'identificacao-precoce',
    name: 'Identificação Precoce',
    description: 'Reconhecer sinais de Dislexia, TDAH e TEA em sala de aula',
    icon: '🔍',
    color: 'from-blue-500 to-cyan-500',
    duration: '30 min',
    topics: [
      'Sinais de alerta por faixa etária',
      'Diferenciação entre transtornos',
      'Quando e como encaminhar',
      'Observação sistemática',
    ],
    questions: [
      {
        id: 1,
        question: 'Qual é um sinal comum de dislexia em crianças em idade escolar?',
        options: [
          'Dificuldade persistente em associar sons a letras',
          'Hiperatividade constante',
          'Dificuldade em fazer contato visual',
          'Movimentos repetitivos',
        ],
        correct: 0,
        explanation:
          'A dificuldade em associar sons a letras (consciência fonológica) é um dos principais sinais de dislexia.',
      },
      {
        id: 2,
        question: 'Em qual idade é recomendado iniciar a triagem para TDAH?',
        options: [
          'Apenas após os 10 anos',
          'A partir dos 4-5 anos',
          'Somente na adolescência',
          'Apenas na vida adulta',
        ],
        correct: 1,
        explanation:
          'A triagem pode começar a partir dos 4-5 anos, quando comportamentos de desatenção e hiperatividade persistentes ficam mais evidentes.',
      },
      {
        id: 3,
        question: 'Qual característica NÃO é típica do TEA?',
        options: [
          'Dificuldade em comunicação social',
          'Comportamentos repetitivos',
          'Dificuldade específica em matemática',
          'Sensibilidade sensorial alterada',
        ],
        correct: 2,
        explanation:
          'Dificuldade específica em matemática não é uma característica definidora do TEA, embora possa estar presente em alguns casos.',
      },
      {
        id: 4,
        question: 'O que fazer ao identificar sinais de alerta em um aluno?',
        options: [
          'Ignorar, pois pode ser apenas fase',
          'Documentar observações e comunicar à coordenação e família',
          'Fazer o diagnóstico você mesmo',
          'Esperar pelo menos 2 anos antes de agir',
        ],
        correct: 1,
        explanation:
          'É essencial documentar as observações e comunicar à coordenação pedagógica e à família para encaminhamento adequado.',
      },
      {
        id: 5,
        question: 'Qual a diferença principal entre TDAH e hiperatividade comum?',
        options: [
          'Não há diferença',
          'TDAH é persistente, intenso e prejudica o funcionamento',
          'TDAH só afeta crianças',
          'Hiperatividade comum é mais grave',
        ],
        correct: 1,
        explanation:
          'TDAH se caracteriza por sintomas persistentes, intensos e que causam prejuízo significativo no funcionamento diário.',
      },
    ],
  },
  {
    id: 'abordagem-pedagogica',
    name: 'Abordagem Pedagógica',
    description: 'Estratégias e adaptações para incluir todos os estudantes',
    icon: '📚',
    color: 'from-green-500 to-emerald-500',
    duration: '45 min',
    topics: [
      'Adaptações curriculares',
      'Estratégias de ensino diferenciadas',
      'Tecnologias assistivas',
      'Avaliação adaptada',
    ],
    questions: [
      {
        id: 1,
        question: 'Qual estratégia é mais eficaz para alunos com dislexia?',
        options: [
          'Apenas aumentar o tempo de prova',
          'Usar recursos multissensoriais e visuais',
          'Reduzir o conteúdo pela metade',
          'Separar em sala especial',
        ],
        correct: 1,
        explanation:
          'Recursos multissensoriais (visual, auditivo, tátil) ajudam na decodificação e compreensão de texto.',
      },
      {
        id: 2,
        question: 'Como organizar o ambiente de sala para alunos com TDAH?',
        options: [
          'Ambiente estimulante com muitos cartazes',
          'Ambiente estruturado, previsível e com poucos estímulos visuais',
          'Deixar totalmente livre para escolherem',
          'Isolá-los dos demais alunos',
        ],
        correct: 1,
        explanation:
          'Um ambiente estruturado, com rotinas claras e poucos estímulos distratores favorece a atenção e organização.',
      },
      {
        id: 3,
        question: 'O que é um PEI (Plano Educacional Individualizado)?',
        options: [
          'Um plano de aula genérico',
          'Documento que descreve objetivos, estratégias e adaptações específicas',
          'Apenas um relatório de notas',
          'Um diagnóstico médico',
        ],
        correct: 1,
        explanation:
          'O PEI é um documento que especifica objetivos, estratégias pedagógicas e adaptações necessárias para cada estudante.',
      },
      {
        id: 4,
        question: 'Qual tecnologia assistiva pode ajudar alunos com dislexia?',
        options: [
          'Apenas calculadoras',
          'Leitores de texto (text-to-speech)',
          'Somente jogos recreativos',
          'Nenhuma tecnologia ajuda',
        ],
        correct: 1,
        explanation:
          'Leitores de texto convertem texto escrito em áudio, auxiliando na compreensão e reduzindo o esforço de decodificação.',
      },
      {
        id: 5,
        question: 'Como avaliar um aluno com TEA de forma justa?',
        options: [
          'Usar apenas provas escritas tradicionais',
          'Não avaliar para não estressar',
          'Usar múltiplos formatos (oral, prático, portfólio)',
          'Dar sempre nota máxima',
        ],
        correct: 2,
        explanation:
          'Avaliações diversificadas permitem que o aluno demonstre conhecimento através de diferentes formatos, considerando suas habilidades.',
      },
    ],
  },
  {
    id: 'encaminhamentos',
    name: 'Encaminhamentos Intersetoriais',
    description: 'Trabalho integrado com saúde, assistência social e família',
    icon: '🤝',
    color: 'from-purple-500 to-pink-500',
    duration: '35 min',
    topics: [
      'Rede de apoio intersetorial',
      'Comunicação com profissionais de saúde',
      'Envolvimento da família',
      'Fluxos de encaminhamento',
    ],
    questions: [
      {
        id: 1,
        question: 'Quando encaminhar um aluno para avaliação multidisciplinar?',
        options: [
          'Apenas quando reprovado',
          'Ao identificar sinais persistentes que impactam aprendizagem',
          'Nunca, a escola deve resolver sozinha',
          'Só após 5 anos de dificuldades',
        ],
        correct: 1,
        explanation:
          'Sinais persistentes que impactam a aprendizagem ou desenvolvimento devem ser encaminhados precocemente para avaliação especializada.',
      },
      {
        id: 2,
        question: 'Qual o papel da família no processo de apoio ao aluno?',
        options: [
          'Família não deve participar',
          'Apenas assinar documentos',
          'Parceira ativa: informar, colaborar e reforçar estratégias',
          'Responsável única pelo problema',
        ],
        correct: 2,
        explanation:
          'A família é parceira essencial, colaborando com informações, reforçando estratégias e participando ativamente do processo.',
      },
      {
        id: 3,
        question: 'O que significa trabalho intersetorial?',
        options: [
          'Trabalhar apenas com a direção escolar',
          'Integração entre educação, saúde e assistência social',
          'Responsabilizar apenas a área da saúde',
          'Trabalhar isoladamente',
        ],
        correct: 1,
        explanation:
          'Trabalho intersetorial envolve integração entre diferentes setores (educação, saúde, assistência) para atendimento integral.',
      },
      {
        id: 4,
        question: 'Como comunicar preocupações à família de forma adequada?',
        options: [
          'Enviar mensagem genérica',
          'Conversa empática, com exemplos concretos e foco em soluções',
          'Apenas listar problemas sem propostas',
          'Evitar falar sobre dificuldades',
        ],
        correct: 1,
        explanation:
          'Comunicação empática, com exemplos concretos e foco em soluções e parceria, facilita o engajamento da família.',
      },
      {
        id: 5,
        question: 'Qual profissional pode fazer diagnóstico de TDAH?',
        options: [
          'Apenas o professor',
          'Médico (neurologista, psiquiatra) ou psicólogo',
          'Coordenador pedagógico',
          'Assistente social',
        ],
        correct: 1,
        explanation:
          'O diagnóstico de TDAH é clínico e deve ser realizado por médico (neurologista, psiquiatra) ou psicólogo.',
      },
    ],
  },
];
