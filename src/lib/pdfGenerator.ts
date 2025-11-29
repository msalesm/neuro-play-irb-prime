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
  addText('Nossa Abordagem a Neurodiversidade', 18, true, '#0a1e35');
  yPosition += 5;

  // Introduction
  addText(
    'Celebramos a neurodiversidade e acreditamos que cada crianca tem seu proprio ritmo e potencial unico. Nossa plataforma foi desenvolvida para atender especificamente tres condicoes do neurodesenvolvimento.',
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
      title: '1. Sistema de Autenticacao e Onboarding LGPD',
      description: 'Sistema completo de autenticacao com Supabase Auth, wizard de onboarding em 4 etapas (dados, termos, consentimentos granulares LGPD, perfil da crianca), disclaimers clinicos obrigatorios e registro seguro de consentimentos.',
      items: ['Email/senha + Google OAuth', 'Wizard guiado 4 etapas', 'Consentimentos LGPD auditaveis', 'Selecao de perfil sensorial']
    },
    {
      title: '2. Jogos Cognitivos Terapeuticos (15+ jogos)',
      description: 'Jogos baseados em evidencia neurocientifica para 7 dominios: atencao sustentada, controle inibitorios, memoria de trabalho, flexibilidade cognitiva, processamento fonologico, cognicao social, e processamento espacial.',
      items: ['15+ jogos terapeuticos implementados', 'Metricas em tempo real (acuracia, tempo de reacao)', 'Dificuldade adaptativa automatica', 'Persistencia em game_sessions']
    },
    {
      title: '3. TUNP - Triagem Unificada NeuroPlay',
      description: 'Sistema unificado de triagem para 6 dimensoes: TEA (M-CHAT), TDAH (SNAP-IV), Dislexia, Discalculia, DLD, e Perfil Sensorial individual. Algoritmos de risco clinico e recomendacoes de encaminhamento.',
      items: ['6 dimensoes neurodivergentes', 'Algoritmos validados de risco', 'Scores percentilados', 'Exportacao PDF automatica']
    },
    {
      title: '4. Relatorios Clinicos com IA (Google Gemini 2.5 Pro)',
      description: 'Sistema de analise clinica automatizado usando IA para agregar dados de game_sessions. Gera perfil cognitivo, identifica forcas/vulnerabilidades, detecta regressoes e sugere intervencoes personalizadas.',
      items: ['Analise via cognitive-analysis edge function', 'Perfil cognitivo 6 dominios', 'Alertas de regressao', 'Recomendacoes terapeuticas', 'Armazenamento em clinical_reports']
    },
    {
      title: '5. Chatbot Terapeutico com IA (Lovable AI)',
      description: 'Assistente terapeutico conversacional usando Google Gemini para check-ins emocionais diarios, coaching parental automatizado e deteccao de padroes comportamentais. Analise automatica a cada 10 mensagens.',
      items: ['Check-ins emocionais diarios', 'Coaching parental contextual', 'Deteccao de padroes via analyze-chat-patterns', 'Insights comportamentais categorizados', 'Persistencia em chat_conversations/messages']
    },
    {
      title: '6. Dashboard de Historico Emocional',
      description: 'Visualizacao temporal completa de check-ins emocionais com graficos de evolucao de humor, analise de frequencia emocional e historico detalhado. Filtros por periodo (semana/mes/total) e exportacao PDF.',
      items: ['Graficos temporais de humor', 'Analise de frequencia emocional', 'Filtros por periodo', 'Exportacao PDF de historico']
    },
    {
      title: '7. Exportacao de Relatorios Comportamentais PDF',
      description: 'Geracao de relatorios comportamentais consolidados em PDF integrando conversas do chatbot, insights detectados e check-ins emocionais para compartilhamento com terapeutas externos.',
      items: ['Consolidacao de conversas', 'Insights categorizados', 'Check-ins emocionais', 'Formatacao clinica profissional']
    },
    {
      title: '8. PEI Inteligente (Plano Educacional Individualizado)',
      description: 'Geracao automatica de PEI baseado em resultados de TUNP. Editor completo com metas SMART, estrategias, acomodacoes escolares e notas de progresso. Sistema de versionamento e compartilhamento seguro com escola.',
      items: ['Geracao automatica por IA', 'Editor de metas/estrategias', 'Notas de progresso', 'Compartilhamento escola/terapeuta']
    },
    {
      title: '9. Sistema Planeta Azul (Universo Gamificado)',
      description: 'Modelo de gamificacao baseado em universo com 5 planetas tematicos: Aurora (TEA), Vortex (TDAH), Lumen (Dislexia), Calm (Regulacao Emocional), Order (Funcoes Executivas). Progressao nao-linear cross-planet.',
      items: ['5 planetas tematicos', 'Missoes diarias IA', 'Progressao cross-planet', 'Aneis do Sistema (recompensa semanal)']
    },
    {
      title: '10. Sistema de Avatar Evolutivo',
      description: 'Avatares personalizaveis que evoluem 5 niveis baseado em progresso dos planetas. Desbloqueio de acessorios exclusivos por planeta completado. Animacoes de celebracao e modal de level-up.',
      items: ['5 niveis progressivos', 'Acessorios desbloqueaveis por planeta', 'Sistema de customizacao', 'Animacoes de evolucao']
    },
    {
      title: '11. Dashboards Multi-Stakeholder (4 perfis)',
      description: 'Dashboards dedicados para Pais (progresso filho, missoes, recomendacoes IA), Terapeutas (painel clinico pacientes, PEI, relatorios), Professores (turmas, PEI, ocorrencias escolares) e Admin/Rede (agregacao regional, mapas de risco).',
      items: ['Dashboard Pais', 'Dashboard Terapeuta', 'Dashboard Professor', 'Dashboard Rede (admin)']
    },
    {
      title: '12. Educacao Parental Gamificada',
      description: 'Modulos de capacitacao para pais sobre TEA/TDAH/Dislexia, estrategias de intervencao domiciliar, manejo comportamental, rotinas estruturadas e interpretacao de relatorios. Quizzes com certificacao digital.',
      items: ['Modulos multimidia curtos', 'Quizzes interativos', 'Certificacao digital', 'Trilhas personalizadas por perfil filho']
    },
    {
      title: '13. Capacitacao Docente (Lei 14.254/21)',
      description: 'Sistema completo de treinamento para professores em conformidade com Lei 14.254/21. 6 modulos sobre neurodiversidade com 30 questoes cada, feedback imediato, ranking de desempenho e certificacao digital.',
      items: ['6 modulos Lei 14.254/21', '30 questoes por modulo', 'Ranking de professores', 'Certificacao digital valida']
    },
    {
      title: '14. Integracao Escolar e Comunicacao Tripartite',
      description: 'Portal para professores com acesso limitado a dados de alunos, compartilhamento seguro de PEI, registro de ocorrencias escolares, relatorios automaticos de progresso e canal de comunicacao familia-escola-terapeuta.',
      items: ['Portal professor limitado', 'Registro de ocorrencias', 'PEI compartilhado seguro', 'Canal comunicacao tripartite']
    },
    {
      title: '15. Registro Direto de Pacientes por Terapeutas',
      description: 'Terapeutas podem registrar pacientes diretamente na plataforma sem necessidade de conta parental previa. Parent_id nullable, email parental opcional, acesso automatico via child_access. Possibilita workflow clinico iniciado pelo terapeuta.',
      items: ['Registro direto por terapeuta', 'Email parental opcional', 'Acesso automatico via child_access', 'Workflow clinico-iniciado']
    },
    {
      title: '16. Onboarding Interativo Guiado',
      description: 'Sistema de tours guiados em todas as principais telas da plataforma usando react-joyride. Tours personalizados por tipo de usuario (pais, terapeutas, professores) com destaque visual em elementos-chave e dicas contextuais.',
      items: ['Tours guiados por pagina', 'Highlights visuais', 'Dicas contextuais', 'Controle de visualizacao (localStorage)']
    },
    {
      title: '17. Manual Completo da Plataforma',
      description: 'Documentacao interativa com guia de inicio rapido, FAQs organizadas por funcionalidade, solucao de problemas comuns e melhores praticas de uso. Formato accordion com busca e navegacao facilitada.',
      items: ['Guia de inicio rapido', 'FAQs por funcionalidade', 'Solucao de problemas', 'Melhores praticas']
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
      addText('- ' + item, 9, false, '#888888');
    });
    yPosition += 5;
  });

  // Conditions Section
  doc.addPage();
  yPosition = 20;
  addSection('Condicoes do Neurodesenvolvimento Atendidas');
  yPosition += 5;

  const conditions = [
    {
      title: 'TEA - Transtorno do Espectro Autista',
      description: 'Jogos para desenvolvimento de habilidades sociais, processamento emocional, teoria da mente e comunicacao. Ambiente controlado com ajustes sensoriais individualizados.'
    },
    {
      title: 'TDAH - Deficit de Atencao e Hiperatividade',
      description: 'Treinamento de atencao sustentada, controle inibitorios, memoria de trabalho e funcao executiva. Sistema de recompensas imediatas e feedback constante.'
    },
    {
      title: 'Dislexia - Dificuldade de Leitura e Escrita',
      description: 'Exercicios de consciencia fonologica, processamento fonologico, reconhecimento de padroes e decodificacao. Apresentacao multissensorial adaptada.'
    }
  ];

  conditions.forEach(condition => {
    addText(condition.title, 12, true, '#005a70');
    addText(condition.description, 10, false, '#666666');
    yPosition += 5;
  });

  yPosition += 5;

  // Differentials Section
  addSection('Diferenciais da Nossa Abordagem');
  yPosition += 5;

  const differentials = [
    {
      title: 'Conformidade Legal (LGPD e Lei 14.254/21)',
      description: 'Plataforma desenvolvida em conformidade com a Lei Brasileira de Protecao de Dados e Lei Federal 14.254/21 que instituiu a Politica Nacional de Prevencao de Dificuldades de Aprendizagem.'
    },
    {
      title: 'Base Neurocientifica',
      description: 'Todos os jogos sao fundamentados em evidencias da neurociencia cognitiva e validados por profissionais de saude especializados em neurodesenvolvimento.'
    },
    {
      title: 'Adaptacao Individual',
      description: 'IA analisa o desempenho em tempo real e ajusta automaticamente a dificuldade, estimulos sensoriais e tipo de feedback para cada crianca.'
    },
    {
      title: 'Abordagem Humanizada',
      description: 'Celebramos a neurodiversidade como uma variacao natural. Nosso foco e desenvolver habilidades e fortalecer potenciais unicos de cada crianca.'
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

  yPosition += 10;
  addSection('Conclusao');
  const conclusion = 'A NeuroPlay 2.0 em parceria com IRB Prime representa uma plataforma clinica-terapeutica completa para atendimento de criancas neurodivergentes. Integrando triagem unificada (TUNP), jogos terapeuticos baseados em evidencia, analise clinica com IA, chatbot terapeutico, dashboards multi-stakeholder e conformidade legal brasileira (LGPD e Lei 14.254/21), a plataforma oferece uma solucao unica no mercado para familias, terapeutas e instituicoes educacionais.';
  addText(conclusion, 10, false, '#666666');

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor('#999999');
    doc.setFont('helvetica', 'normal');
    doc.text(
      `NeuroPlay IRB Prime - Plataforma Clinica Terapeutica | Pagina ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save('NeuroPlay-Neurodiversidade.pdf');
};
