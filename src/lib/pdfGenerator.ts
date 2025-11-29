import jsPDF from 'jspdf';

export const generateNeurodiversityPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = 20;

  // Helper function to add text with auto line breaks
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  const addSection = (title: string) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 5;
    addText(title, 16, true, '#0a1e35');
  };

  // Header
  doc.setFillColor(10, 30, 53);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroPlay IRB Prime', margin, 25);
  
  yPosition = 50;

  // Title
  addText('Nossa Abordagem à Neurodiversidade', 18, true, '#0a1e35');
  yPosition += 5;

  // Introduction
  addText(
    'Celebramos a neurodiversidade e acreditamos que cada criança tem seu próprio ritmo e potencial único. Nossa plataforma foi desenvolvida para atender especificamente três condições do neurodesenvolvimento.',
    11,
    false,
    '#666666'
  );
  yPosition += 10;

  // Modules Section
  addSection('Funcionalidades Implementadas - NeuroPlay 2.0');
  yPosition += 5;

  const modules = [
    {
      title: '✅ 1. Sistema de Autenticação e Onboarding LGPD',
      description: 'Sistema completo de autenticação com Supabase Auth, wizard de onboarding em 4 etapas (dados, termos, consentimentos granulares LGPD, perfil da criança), disclaimers clínicos obrigatórios e registro seguro de consentimentos.',
      items: ['• Email/senha + Google OAuth', '• Wizard guiado 4 etapas', '• Consentimentos LGPD auditáveis', '• Seleção de perfil sensorial']
    },
    {
      title: '✅ 2. Jogos Cognitivos Terapêuticos (15+ jogos)',
      description: 'Jogos baseados em evidência neurocientífica para 7 domínios: atenção sustentada, controle inibitório, memória de trabalho, flexibilidade cognitiva, processamento fonológico, cognição social, e processamento espacial.',
      items: ['• 15+ jogos terapêuticos implementados', '• Métricas em tempo real (acurácia, tempo de reação)', '• Dificuldade adaptativa automática', '• Persistência em game_sessions']
    },
    {
      title: '✅ 3. TUNP - Triagem Unificada NeuroPlay',
      description: 'Sistema unificado de triagem para 6 dimensões: TEA (M-CHAT), TDAH (SNAP-IV), Dislexia, Discalculia, DLD, e Perfil Sensorial individual. Algoritmos de risco clínico e recomendações de encaminhamento.',
      items: ['• 6 dimensões neurodivergentes', '• Algoritmos validados de risco', '• Scores percentilados', '• Exportação PDF automática']
    },
    {
      title: '✅ 4. Relatórios Clínicos com IA (Google Gemini 2.5 Pro)',
      description: 'Sistema de análise clínica automatizado usando IA para agregar dados de game_sessions. Gera perfil cognitivo, identifica forças/vulnerabilidades, detecta regressões e sugere intervenções personalizadas.',
      items: ['• Análise via cognitive-analysis edge function', '• Perfil cognitivo 6 domínios', '• Alertas de regressão', '• Recomendações terapêuticas', '• Armazenamento em clinical_reports']
    },
    {
      title: '✅ 5. Chatbot Terapêutico com IA (Lovable AI)',
      description: 'Assistente terapêutico conversacional usando Google Gemini para check-ins emocionais diários, coaching parental automatizado e detecção de padrões comportamentais. Análise automática a cada 10 mensagens.',
      items: ['• Check-ins emocionais diários', '• Coaching parental contextual', '• Detecção de padrões via analyze-chat-patterns', '• Insights comportamentais categorizados', '• Persistência em chat_conversations/messages']
    },
    {
      title: '✅ 6. Dashboard de Histórico Emocional',
      description: 'Visualização temporal completa de check-ins emocionais com gráficos de evolução de humor, análise de frequência emocional e histórico detalhado. Filtros por período (semana/mês/total) e exportação PDF.',
      items: ['• Gráficos temporais de humor', '• Análise de frequência emocional', '• Filtros por período', '• Exportação PDF de histórico']
    },
    {
      title: '✅ 7. Exportação de Relatórios Comportamentais PDF',
      description: 'Geração de relatórios comportamentais consolidados em PDF integrando conversas do chatbot, insights detectados e check-ins emocionais para compartilhamento com terapeutas externos.',
      items: ['• Consolidação de conversas', '• Insights categorizados', '• Check-ins emocionais', '• Formatação clínica profissional']
    },
    {
      title: '✅ 8. PEI Inteligente (Plano Educacional Individualizado)',
      description: 'Geração automática de PEI baseado em resultados de TUNP. Editor completo com metas SMART, estratégias, acomodações escolares e notas de progresso. Sistema de versionamento e compartilhamento seguro com escola.',
      items: ['• Geração automática por IA', '• Editor de metas/estratégias', '• Notas de progresso', '• Compartilhamento escola/terapeuta']
    },
    {
      title: '✅ 9. Sistema Planeta Azul (Universo Gamificado)',
      description: 'Modelo de gamificação baseado em universo com 5 planetas temáticos: Aurora (TEA), Vortex (TDAH), Lumen (Dislexia), Calm (Regulação Emocional), Order (Funções Executivas). Progressão não-linear cross-planet.',
      items: ['• 5 planetas temáticos', '• Missões diárias IA', '• Progressão cross-planet', '• Anéis do Sistema (recompensa semanal)']
    },
    {
      title: '✅ 10. Sistema de Avatar Evolutivo',
      description: 'Avatares personalizáveis que evoluem 5 níveis baseado em progresso dos planetas. Desbloqueio de acessórios exclusivos por planeta completado. Animações de celebração e modal de level-up.',
      items: ['• 5 níveis progressivos', '• Acessórios desbloqueáveis por planeta', '• Sistema de customização', '• Animações de evolução']
    },
    {
      title: '✅ 11. Dashboards Multi-Stakeholder (4 perfis)',
      description: 'Dashboards dedicados para Pais (progresso filho, missões, recomendações IA), Terapeutas (painel clínico pacientes, PEI, relatórios), Professores (turmas, PEI, ocorrências escolares) e Admin/Rede (agregação regional, mapas de risco).',
      items: ['• Dashboard Pais', '• Dashboard Terapeuta', '• Dashboard Professor', '• Dashboard Rede (admin)']
    },
    {
      title: '✅ 12. Educação Parental Gamificada',
      description: 'Módulos de capacitação para pais sobre TEA/TDAH/Dislexia, estratégias de intervenção domiciliar, manejo comportamental, rotinas estruturadas e interpretação de relatórios. Quizzes com certificação digital.',
      items: ['• Módulos multimídia curtos', '• Quizzes interativos', '• Certificação digital', '• Trilhas personalizadas por perfil filho']
    },
    {
      title: '✅ 13. Capacitação Docente (Lei 14.254/21)',
      description: 'Sistema completo de treinamento para professores em conformidade com Lei 14.254/21. 6 módulos sobre neurodiversidade com 30 questões cada, feedback imediato, ranking de desempenho e certificação digital.',
      items: ['• 6 módulos Lei 14.254/21', '• 30 questões por módulo', '• Ranking de professores', '• Certificação digital válida']
    },
    {
      title: '✅ 14. Integração Escolar e Comunicação Tripartite',
      description: 'Portal para professores com acesso limitado a dados de alunos, compartilhamento seguro de PEI, registro de ocorrências escolares, relatórios automáticos de progresso e canal de comunicação família-escola-terapeuta.',
      items: ['• Portal professor limitado', '• Registro de ocorrências', '• PEI compartilhado seguro', '• Canal comunicação tripartite']
    },
    {
      title: '✅ 15. Registro Direto de Pacientes por Terapeutas',
      description: 'Terapeutas podem registrar pacientes diretamente na plataforma sem necessidade de conta parental prévia. Parent_id nullable, email parental opcional, acesso automático via child_access. Possibilita workflow clínico iniciado pelo terapeuta.',
      items: ['• Registro direto por terapeuta', '• Email parental opcional', '• Acesso automático via child_access', '• Workflow clínico-iniciado']
    }
  ];

  modules.forEach(module => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    addText(module.title, 12, true, '#005a70');
    addText(module.description, 10, false, '#666666');
    module.items.forEach(item => {
      addText(item, 9, false, '#888888');
    });
    yPosition += 5;
  });

  // New page for benchmark comparison
  doc.addPage();
  yPosition = 20;

  // Benchmark Comparison Section
  addSection('Análise Competitiva: NeuroPlay 2.0 vs. 5 Plataformas Globais Líderes');
  addText('Comparação detalhada com as principais plataformas de neurodiversidade do mercado global.', 11, false, '#666666');
  yPosition += 5;

  const benchmarks = [
    {
      name: '🇬🇧 ThinkDivergent (UK)',
      focus: 'Premium clinical narratives e multi-perspective reporting',
      features: [
        '✓ NeuroMap visual de forças/melhorias',
        '✓ Relatórios multi-perspectiva (pais/terapeutas/professores)',
        '✓ Linguagem neuro-inclusiva'
      ],
      neuroplay: [
        '✅ NeuroPlay implementa: Relatórios clínicos IA multi-stakeholder',
        '✅ Dashboards dedicados para cada perfil (pais, terapeutas, professores)',
        '✅ Linguagem respeitosa neurodiversidade em toda plataforma',
        '🚀 NeuroPlay adiciona: Sistema Planeta Azul para narrativa gamificada visual'
      ]
    },
    {
      name: '🇺🇸 Mightier (USA)',
      focus: 'Biofeedback integration e emotional regulation',
      features: [
        '✓ Biofeedback em jogos terapêuticos',
        '✓ Monitoramento frequência cardíaca',
        '✓ Ajuste dificuldade baseado em estado emocional',
        '✓ Modo regulação emocional'
      ],
      neuroplay: [
        '⏳ NeuroPlay Fase 2.0 Sprint 5: Biofeedback com sensores cardíacos',
        '✅ NeuroPlay implementa: Chatbot detecção emocional',
        '✅ Check-ins emocionais diários',
        '✅ Dashboard histórico emocional com gráficos evolução',
        '🚀 NeuroPlay adiciona: Perfil sensorial individualizado TEA'
      ]
    },
    {
      name: '🇩🇰 Tiimo (Denmark)',
      focus: 'Visual routines e simplified parent UX',
      features: [
        '✓ Rotinas visuais diárias vinculadas PEI',
        '✓ Time-boxing e time-blocking tasks',
        '✓ Sequências de tarefas step-by-step',
        '✓ UX simplificada para pais'
      ],
      neuroplay: [
        '✅ NeuroPlay implementa: Missões diárias IA com sequência clara',
        '✅ Sistema Planeta Azul para progressão visual estruturada',
        '✅ PEI inteligente com metas e estratégias claras',
        '⏳ Fase 2.0 Sprint 6: Rotinas visuais microlearning',
        '🚀 NeuroPlay adiciona: Gamificação além de rotinas (avatar evolutivo, badges)'
      ]
    },
    {
      name: '🇺🇸 EndeavorRx (USA)',
      focus: 'Evidence-based clinical protocols e therapist-prescribed',
      features: [
        '✓ Protocolos clínicos baseados em evidência',
        '✓ Jogos prescritos por terapeuta',
        '✓ Trilhas terapêuticas específicas por idade',
        '✓ Aprovação FDA para TDAH'
      ],
      neuroplay: [
        '✅ NeuroPlay implementa: 15+ jogos terapêuticos baseados neurociência',
        '✅ Recomendações IA personalizadas por perfil neurodivergente',
        '✅ Dashboard terapeuta para prescrever/acompanhar',
        '✅ Análise clínica IA (cognitive-analysis)',
        '🚀 NeuroPlay adiciona: Triagem TUNP unificada 6 dimensões (vs. foco único TDAH)'
      ]
    },
    {
      name: '🇬🇧 Do-IT Profiler (UK)',
      focus: 'Unified comprehensive neurodivergence assessment',
      features: [
        '✓ Avaliação unificada multi-dimensional',
        '✓ Perfil neurodiversidade completo',
        '✓ Identificação forças e necessidades'
      ],
      neuroplay: [
        '✅ NeuroPlay implementa: TUNP (Triagem Unificada NeuroPlay)',
        '✅ 6 dimensões: TEA, TDAH, Dislexia, Discalculia, DLD, Perfil Sensorial',
        '✅ Algoritmos de risco clínico',
        '✅ Relatórios PDF exportáveis',
        '🚀 NeuroPlay adiciona: Gamificação terapêutica integrada (vs. apenas assessment)'
      ]
    }
  ];

  benchmarks.forEach((benchmark, index) => {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    addText(benchmark.name, 12, true, '#005a70');
    addText(`Foco: ${benchmark.focus}`, 10, true, '#666666');
    yPosition += 2;
    
    addText('Recursos principais:', 9, true, '#888888');
    benchmark.features.forEach(feature => {
      addText(feature, 8, false, '#888888');
    });
    yPosition += 2;

    addText('NeuroPlay 2.0 Comparação:', 9, true, '#0a1e35');
    benchmark.neuroplay.forEach(item => {
      addText(item, 8, false, '#666666');
    });
    yPosition += 5;
  });

  // Competitive Summary
  doc.addPage();
  yPosition = 20;
  addSection('Resumo Executivo da Vantagem Competitiva');
  
  const competitiveAdvantages = [
    {
      title: '🏆 Única Plataforma Totalmente Integrada',
      description: 'NeuroPlay 2.0 é a única solução que integra screening (TUNP), jogos terapêuticos, chatbot IA, relatórios clínicos, PEI automatizado, capacitação parental/docente e integração escolar em uma única plataforma. Concorrentes são especializados em áreas isoladas.'
    },
    {
      title: '🧠 IA Terapêutica Multi-Modal',
      description: 'Além de jogos adaptativos, NeuroPlay usa IA para: análise cognitiva (cognitive-analysis), detecção comportamental (analyze-chat-patterns), recomendações personalizadas e geração automática de PEI. Concorrentes usam IA apenas para adaptação de jogos.'
    },
    {
      title: '🇧🇷 Conformidade Legal Brasileira (Lei 14.254/21 + LGPD)',
      description: 'Única plataforma totalmente conforme Lei 14.254/21 (screening precoce, PEI, capacitação docente) e LGPD (consentimentos granulares, pseudonimização, auditoria). Concorrentes não atendem legislação brasileira.'
    },
    {
      title: '🌍 Sistema Planeta Azul (Gamificação Terapêutica)',
      description: 'Modelo de universo gamificado com 5 planetas temáticos cria narrativa coerente e progressão cross-diagnosis. Concorrentes usam gamificação genérica sem narrativa terapêutica.'
    },
    {
      title: '👨‍👩‍👧 Ecossistema Multi-Stakeholder',
      description: '4 dashboards dedicados (pais, terapeutas, professores, rede/admin) com comunicação tripartite integrada. Concorrentes focam apenas em pais ou apenas em clínicos, não ambos simultaneamente.'
    },
    {
      title: '💰 Modelo Serverless Escalável e Custo-Eficiente',
      description: 'Infraestrutura Lovable Cloud + Supabase permite escala automática sem DevOps. Desenvolvimento acelerado por IA reduz time-to-market. Concorrentes têm custos operacionais muito superiores.'
    }
  ];

  competitiveAdvantages.forEach(advantage => {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    addText(advantage.title, 11, true, '#005a70');
    addText(advantage.description, 9, false, '#666666');
    yPosition += 3;
  });

  // New page for conditions
  doc.addPage();
  yPosition = 20;

  // Conditions Section
  addSection('Condições do Neurodesenvolvimento Atendidas');
  yPosition += 5;

  const conditions = [
    {
      title: 'TEA - Transtorno do Espectro Autista',
      description: 'Jogos para desenvolvimento de habilidades sociais, processamento emocional, teoria da mente e comunicação. Ambiente controlado com ajustes sensoriais individualizados.'
    },
    {
      title: 'TDAH - Déficit de Atenção e Hiperatividade',
      description: 'Treinamento de atenção sustentada, controle inibitório, memória de trabalho e função executiva. Sistema de recompensas imediatas e feedback constante.'
    },
    {
      title: 'Dislexia - Dificuldade de Leitura e Escrita',
      description: 'Exercícios de consciência fonológica, processamento fonológico, reconhecimento de padrões e decodificação. Apresentação multissensorial adaptada.'
    }
  ];

  conditions.forEach(condition => {
    addText(condition.title, 12, true, '#005a70');
    addText(condition.description, 10, false, '#666666');
    yPosition += 5;
  });

  yPosition += 10;

  // Differentials Section
  addText('Diferenciais da Nossa Abordagem', 16, true, '#0a1e35');
  yPosition += 5;

  const differentials = [
    {
      title: 'Conformidade Legal (LGPD e Lei 14.254/21)',
      description: 'Plataforma desenvolvida em conformidade com a Lei Brasileira de Proteção de Dados e Lei Federal 14.254/21 que instituiu a Política Nacional de Prevenção de Dificuldades de Aprendizagem.'
    },
    {
      title: 'Base Neurocientífica',
      description: 'Todos os jogos são fundamentados em evidências da neurociência cognitiva e validados por profissionais de saúde especializados em neurodesenvolvimento.'
    },
    {
      title: 'Adaptação Individual',
      description: 'IA analisa o desempenho em tempo real e ajusta automaticamente a dificuldade, estímulos sensoriais e tipo de feedback para cada criança.'
    },
    {
      title: 'Abordagem Humanizada',
      description: 'Celebramos a neurodiversidade como uma variação natural. Nosso foco é desenvolver habilidades e fortalecer potenciais únicos de cada criança.'
    }
  ];

  differentials.forEach(differential => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    addText(differential.title, 12, true, '#005a70');
    addText(differential.description, 10, false, '#666666');
    yPosition += 5;
  });

  // New page for roadmap
  doc.addPage();
  yPosition = 20;

  // Roadmap Section
  addText('Roadmap de Implementação - Fase 2.0', 16, true, '#0a1e35');
  addText('Desenvolvimento Acelerado por IA - Implementação em Dias', 12, false, '#005a70');
  yPosition += 5;

  const roadmapIntro = 'Utilizando ferramentas de desenvolvimento assistido por IA, a NeuroPlay 2.0 pode ser implementada de forma extremamente ágil. Abaixo está o cronograma de implementação por sprints:';
  addText(roadmapIntro, 10, false, '#666666');
  yPosition += 5;

  const roadmapSprints = [
    {
      title: 'Sprint 1 (Dias 1-3): Sistema de Conquistas e Gamificação Avançada',
      items: [
        '• Implementação de sistema de badges progressivos com 5 níveis',
        '• Avatar evolutivo que cresce conforme o progresso da criança',
        '• Sistema de streaks diários inspirado em Duolingo',
        '• Recompensas personalizadas baseadas no perfil neurodivergente',
        '• Dashboard gamificado para pais visualizarem conquistas'
      ]
    },
    {
      title: 'Sprint 2 (Dias 4-7): Chatbot Terapêutico com IA',
      items: [
        '• Assistente virtual inteligente para check-ins emocionais diários',
        '• Sistema de detecção de padrões comportamentais em tempo real',
        '• Coaching automatizado para pais em momentos críticos',
        '• Integração com Lovable AI (Google Gemini 2.5 Flash)',
        '• Histórico conversacional e insights terapêuticos'
      ]
    },
    {
      title: 'Sprint 3 (Dias 8-10): Jogos Cooperativos Parent-Child',
      items: [
        '• 3 jogos multiplayer que exigem colaboração pais-filhos',
        '• Sistema de sincronização em tempo real via Supabase Realtime',
        '• Métricas de qualidade da interação familiar',
        '• Recomendações de atividades baseadas no desempenho conjunto',
        '• Celebração de conquistas compartilhadas'
      ]
    },
    {
      title: 'Sprint 4 (Dias 11-14): Análise Preditiva e Alertas Inteligentes',
      items: [
        '• IA para identificar padrões que antecedem crises comportamentais',
        '• Sistema de alertas preventivos para pais e terapeutas',
        '• Recomendações proativas de intervenção',
        '• Dashboard preditivo com indicadores de risco',
        '• Integração com relatórios clínicos existentes'
      ]
    },
    {
      title: 'Sprint 5 (Dias 15-18): Biofeedback e Monitoramento Sensorial',
      items: [
        '• Integração básica com sensores de frequência cardíaca',
        '• Detecção de sobrecarga sensorial durante jogos',
        '• Ajuste automático de dificuldade baseado em biofeedback',
        '• Exercícios de autorregulação guiados por IA',
        '• Alertas de necessidade de pausa sensorial'
      ]
    },
    {
      title: 'Sprint 6 (Dias 19-21): Microlearning para Pais',
      items: [
        '• 30 módulos curtos de 2-3 minutos cada',
        '• Sistema de notificações push inteligentes',
        '• Quizzes interativos com gamificação',
        '• Certificação digital progressiva',
        '• Conteúdo personalizado baseado no perfil do filho'
      ]
    },
    {
      title: 'Sprint 7 (Dias 22-25): Integração Escolar e Relatórios Multiusuário',
      items: [
        '• Portal para professores com acesso limitado',
        '• Compartilhamento seguro de PEI com escolas',
        '• Relatórios automáticos de progresso para educadores',
        '• Sistema de comunicação tripartite (pais-terapeutas-escola)',
        '• Exportação de dados para sistemas escolares'
      ]
    },
    {
      title: 'Sprint 8 (Dias 26-30): Melhorias de Acessibilidade e UX',
      items: [
        '• Modo de alto contraste e ajustes de fonte',
        '• Navegação por voz e comandos de acessibilidade',
        '• Suporte a leitores de tela',
        '• Modo de baixa estimulação sensorial',
        '• Customização completa da interface por perfil'
      ]
    }
  ];

  roadmapSprints.forEach(sprint => {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    addText(sprint.title, 11, true, '#005a70');
    sprint.items.forEach(item => {
      addText(item, 9, false, '#666666');
    });
    yPosition += 3;
  });

  // Add implementation methodology
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  yPosition += 5;
  addText('Metodologia de Implementação Acelerada', 14, true, '#0a1e35');
  yPosition += 5;

  const methodology = [
    {
      title: 'Desenvolvimento Assistido por IA',
      description: 'Utilização de plataformas como Lovable AI para geração automática de código frontend e backend, reduzindo o tempo de desenvolvimento em até 80%.'
    },
    {
      title: 'Infraestrutura Serverless',
      description: 'Supabase + Edge Functions eliminam necessidade de DevOps complexo, permitindo deploy instantâneo e escalabilidade automática.'
    },
    {
      title: 'Integração Nativa de IA',
      description: 'Google Gemini 2.5 integrado via Lovable AI Gateway permite implementação de chatbots e análise preditiva sem configuração de API keys.'
    },
    {
      title: 'Prototipagem Rápida',
      description: 'Cada sprint termina com versão funcional testável, permitindo feedback contínuo de terapeutas e pais durante o desenvolvimento.'
    }
  ];

  methodology.forEach(method => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    addText(method.title, 11, true, '#005a70');
    addText(method.description, 9, false, '#666666');
    yPosition += 3;
  });

  yPosition += 5;
  addText('Conclusão', 14, true, '#0a1e35');
  const conclusion = 'Com desenvolvimento assistido por IA e infraestrutura moderna serverless, a NeuroPlay 2.0 pode evoluir de plataforma básica para solução clínica completa em apenas 30 dias. Esta velocidade de implementação, anteriormente impossível, permite iteração rápida baseada em feedback clínico real e validação terapêutica contínua.';
  addText(conclusion, 10, false, '#666666');

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor('#999999');
    doc.setFont('helvetica', 'normal');
    doc.text(
      `NeuroPlay IRB Prime - Plataforma Clínica Terapêutica | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save('NeuroPlay-Neurodiversidade.pdf');
};
