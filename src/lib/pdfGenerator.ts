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
  addText('Módulos Principais da Plataforma', 16, true, '#0a1e35');
  yPosition += 5;

  const modules = [
    {
      title: '1. Jogos Cognitivos Terapêuticos',
      description: 'Atividades lúdicas baseadas em neurociência para desenvolvimento cognitivo, social e emocional. Sistema adaptativo de dificuldade e métricas de desempenho em tempo real.',
      items: ['• 7 categorias cognitivas', '• Dificuldade adaptativa por IA', '• Perfil sensorial personalizado']
    },
    {
      title: '2. Testes Diagnósticos Clínicos',
      description: 'Digitalização de testes clínicos autorizados para triagem de TEA (M-CHAT), TDAH (SNAP-IV) e Dislexia. Fluxo guiado com algoritmos de identificação de risco.',
      items: ['• Testes validados clinicamente', '• Algoritmos de risco', '• Exportação em PDF']
    },
    {
      title: '3. Relatórios Clínicos com IA',
      description: 'Análise inteligente que agrega dados de jogos e testes para gerar insights clínicos. Perfil cognitivo, padrões comportamentais e recomendações personalizadas.',
      items: ['• Perfil cognitivo completo', '• Detecção de padrões', '• Alertas de regressão']
    },
    {
      title: '4. Educação para Pais',
      description: 'Módulo completo de alfabetização terapêutica: compreensão de TEA/TDAH/Dislexia, estratégias de intervenção domiciliar, manejo comportamental e interpretação de relatórios.',
      items: ['• Vídeos curtos e práticos', '• Quizzes e certificados', '• Trilhas personalizadas']
    },
    {
      title: '5. PEI Inteligente',
      description: 'Plano Educacional Individualizado gerado por IA com base nos resultados de triagem. Define metas, estratégias, acomodações e acompanhamento de progresso.',
      items: ['• Geração automática por IA', '• Metas personalizadas', '• Notas de progresso']
    },
    {
      title: '6. Dashboard Clínico',
      description: 'Interface profissional para terapeutas e profissionais de saúde com visão completa do progresso, histórico de sessões e recomendações de intervenção.',
      items: ['• Controle de acesso baseado em roles', '• Métricas agregadas', '• Integração IRB Prime']
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

  // New page for conditions
  doc.addPage();
  yPosition = 20;

  // Conditions Section
  addText('Condições do Neurodesenvolvimento Atendidas', 16, true, '#0a1e35');
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
