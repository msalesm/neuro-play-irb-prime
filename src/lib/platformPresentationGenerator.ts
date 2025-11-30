import jsPDF from 'jspdf';

export const generatePlatformPresentation = () => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add text with automatic page breaks
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        // Add footer with page number
        const pageNum = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    
    yPosition += 3;
  };

  const addSection = (title: string) => {
    yPosition += 8;
    doc.setFillColor(10, 30, 53); // Primary color
    doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 12;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(11);
    doc.text('•', margin + 2, yPosition);
    const lines = doc.splitTextToSize(text, maxWidth - 8);
    lines.forEach((line: string, index: number) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin + 8, yPosition);
      yPosition += 5.5;
    });
    yPosition += 1;
  };

  const addDashboardIllustration = (title: string, description: string) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    // Title
    doc.setFillColor(0, 90, 112);
    doc.rect(margin, yPosition, maxWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, yPosition + 6.5);
    yPosition += 15;

    // Dashboard mockup box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPosition, maxWidth, 50, 2, 2, 'FD');
    
    // Add dashboard elements visualization
    doc.setFillColor(10, 30, 53);
    doc.roundedRect(margin + 5, yPosition + 5, maxWidth - 10, 8, 1, 1, 'F');
    
    // Simulated chart/graph elements
    doc.setFillColor(0, 90, 112);
    doc.rect(margin + 5, yPosition + 16, 35, 28, 'F');
    doc.setFillColor(199, 146, 62);
    doc.rect(margin + 43, yPosition + 16, 35, 28, 'F');
    doc.setFillColor(10, 30, 53);
    doc.rect(margin + 81, yPosition + 16, 35, 28, 'F');
    
    // Add text elements
    doc.setFillColor(220, 220, 220);
    doc.rect(margin + 120, yPosition + 16, maxWidth - 125, 4, 'F');
    doc.rect(margin + 120, yPosition + 23, maxWidth - 135, 4, 'F');
    doc.rect(margin + 120, yPosition + 30, maxWidth - 140, 4, 'F');

    yPosition += 55;

    // Description
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(description, maxWidth);
    descLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  };

  const addGameCard = (title: string, planet: string, description: string, skills: string, color: [number, number, number]) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 70) {
      doc.addPage();
      yPosition = 20;
    }

    // Game card container
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, yPosition, maxWidth, 60, 2, 2, 'FD');

    // Game visual mockup (left side)
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin + 3, yPosition + 3, 50, 54, 2, 2, 'F');
    
    // Game icon/logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 28, yPosition + 20, 8, 'F');
    
    // Text content (right side)
    const textStartX = margin + 58;
    const textWidth = maxWidth - 61;

    // Title
    doc.setTextColor(10, 30, 53);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, textStartX, yPosition + 8);

    // Planet tag
    doc.setFontSize(9);
    doc.setTextColor(0, 90, 112);
    doc.text(planet, textStartX, yPosition + 14);

    // Description
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(description, textWidth);
    let descY = yPosition + 20;
    descLines.slice(0, 3).forEach((line: string) => {
      doc.text(line, textStartX, descY);
      descY += 4.5;
    });

    // Skills worked
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Habilidades: ' + skills, textStartX, yPosition + 55);

    yPosition += 65;
    doc.setTextColor(0, 0, 0);
  };

  // Header with logo placeholder
  doc.setFillColor(10, 30, 53);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroPlay 2.0', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma Clínica Terapêutica Adaptativa', pageWidth / 2, 28, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  yPosition = 50;

  // Introduction
  addText('Este documento apresenta a plataforma NeuroPlay 2.0, uma solução clínica completa desenvolvida em parceria com IRB Prime para acompanhamento terapêutico de crianças neurodivergentes (TEA, TDAH, Dislexia).', 11, false);
  
  yPosition += 5;

  // Vision and Mission
  addSection('VISÃO E MISSÃO');
  addText('Transformar a terapia em uma experiência gamificada, personalizada e baseada em evidências científicas, oferecendo suporte completo para crianças, pais e profissionais de saúde.', 11, false);

  // Benefits Section
  addSection('BENEFÍCIOS PRINCIPAIS');
  
  addBullet('Gamificação Terapêutica: Jogos cognitivos validados cientificamente que transformam intervenções clínicas em experiências envolventes e motivadoras');
  addBullet('Inteligência Artificial: Sistema de recomendações personalizadas, ajuste automático de dificuldade e análise preditiva de crises comportamentais');
  addBullet('Acompanhamento Completo: Dashboards especializados para pais, terapeutas e gestores com métricas clínicas em tempo real');
  addBullet('Triagem Unificada (TUNP): Avaliação integrada de TEA, TDAH, Dislexia, Discalculia, DLD e perfil sensorial em uma única plataforma');
  addBullet('Relatórios Clínicos: Geração automática de relatórios terapêuticos detalhados com insights de IA e recomendações de intervenção');
  addBullet('Chatbot Terapêutico: Assistente de IA para suporte emocional, orientação parental e detecção de padrões comportamentais');
  addBullet('Conformidade Legal: Plataforma em conformidade com LGPD e Lei 14.254/21 (triagem precoce e PEI)');

  // Functionalities Section
  addSection('FUNCIONALIDADES PRINCIPAIS');

  addText('1. SISTEMA PLANETA AZUL', 12, true, [0, 90, 112]);
  addText('Universo gamificado com 5 planetas temáticos, cada um focado em uma área terapêutica específica:', 11);
  addBullet('Planeta Aurora (TEA): Jogos de comunicação social, teoria da mente e processamento emocional');
  addBullet('Planeta Vortex (TDAH): Jogos de atenção sustentada, controle inibitório e funções executivas');
  addBullet('Planeta Lumen (Dislexia): Jogos de consciência fonológica, decodificação e processamento visual');
  addBullet('Planeta Calm (Regulação Emocional): Biofeedback, mindfulness e técnicas de autorregulação');
  addBullet('Planeta Order (Funções Executivas): Planejamento, organização e flexibilidade cognitiva');

  yPosition += 3;

  addText('2. JOGOS COGNITIVOS ADAPTATIVOS', 12, true, [0, 90, 112]);
  addBullet('Sistema de fases progressivas com dificuldade adaptativa baseada em desempenho');
  addBullet('Feedback imediato com insights terapêuticos personalizados');
  addBullet('Coleta automática de métricas: tempo de reação, precisão, padrões de erro, atenção sustentada');
  addBullet('Modo de acessibilidade com ajustes sensoriais para cada perfil individual');

  yPosition += 3;

  // Games Gallery Section
  addSection('GALERIA DE JOGOS TERAPÊUTICOS');

  addGameCard(
    '🎯 Torre Perfeita',
    'Planeta Vortex (TDAH)',
    'Jogo de empilhamento que desenvolve atenção sustentada, timing preciso e controle de impulsos. A criança deve empilhar blocos em movimento no momento exato, trabalhando coordenação motora fina e concentração.',
    'Atenção, Controle Inibitório, Timing, Coordenação Motora',
    [174, 233, 232] // cyan/turquoise for Vortex
  );

  addGameCard(
    '💎 Crystal Match',
    'Planeta Vortex (TDAH)',
    'Jogo de combinação tipo match-3 que estimula reconhecimento de padrões, tomada de decisão rápida e atenção visual. Sistema de combos e cascatas incentiva planejamento estratégico e flexibilidade cognitiva.',
    'Atenção Visual, Padrões, Decisão Rápida, Planejamento',
    [138, 180, 248] // blue for Vortex
  );

  addGameCard(
    '✨ Sequência Cósmica',
    'Planeta Aurora (TEA)',
    'Jogo de memória sequencial tipo Simon Says que fortalece memória visual, atenção auditiva e sequenciamento. Inclui feedback musical e visual adaptado para crianças com perfil sensorial específico.',
    'Memória Visual, Sequenciamento, Padrões, Atenção Auditiva',
    [203, 166, 247] // purple for Aurora
  );

  yPosition += 3;

  addText('3. TRIAGEM UNIFICADA NEUROPLAY (TUNP)', 12, true, [0, 90, 112]);
  addBullet('Avaliação integrada de 6 dimensões neurodesenvolvimentais em um único processo');
  addBullet('Algoritmos de identificação de risco com cálculo automático de percentis e escores');
  addBullet('Geração de relatórios com recomendações clínicas e indicação de encaminhamento');
  addBullet('Exportação em PDF para compartilhamento com equipe multidisciplinar');

  yPosition += 3;

  addText('4. CHATBOT TERAPÊUTICO COM IA', 12, true, [0, 90, 112]);
  addBullet('Assistente de IA contextualizado por idade e perfil da criança');
  addBullet('Check-ins emocionais programados para monitoramento longitudinal');
  addBullet('Detecção automática de padrões comportamentais e insights clínicos');
  addBullet('Orientação parental personalizada com estratégias terapêuticas práticas');
  addBullet('Análise de sentimento em tempo real para ajuste de tom e resposta empática');

  yPosition += 3;

  addText('5. SISTEMA DE CONQUISTAS E AVATARES', 12, true, [0, 90, 112]);
  addBullet('5 níveis de badges progressivos vinculados a marcos terapêuticos');
  addBullet('Avatares evolutivos que crescem com o progresso da criança');
  addBullet('Sistema de streaks diários para engajamento consistente');
  addBullet('Missões semanais cross-planet para estimulação multidimensional');
  addBullet('Anéis do Sistema Azul como moeda de progressão de longo prazo');

  yPosition += 3;

  addText('6. ANÁLISE PREDITIVA E ALERTAS', 12, true, [0, 90, 112]);
  addBullet('Detecção precoce de regressões cognitivas e padrões de risco');
  addBullet('Alertas preventivos para pais e terapeutas antes de crises comportamentais');
  addBullet('Indicadores de vulnerabilidade baseados em histórico de sessões');
  addBullet('Recomendações proativas de intervenção terapêutica');

  // Dashboards Section
  addSection('DASHBOARDS ESPECIALIZADOS - ILUSTRAÇÕES');

  addDashboardIllustration(
    '📊 DASHBOARD DOS PAIS',
    'Interface intuitiva para acompanhamento diário: visão geral do progresso dos filhos, missões diárias recomendadas pela IA, histórico semanal de jogadas, acesso aos jogos mais indicados, integração com chatbot terapêutico e gráficos de evolução emocional/cognitiva.'
  );

  addDashboardIllustration(
    '🏥 DASHBOARD DO TERAPEUTA',
    'Painel clínico completo: lista de pacientes com indicadores visuais de atenção, painéis com 4 abas (Evolução, Perfil Cognitivo, Alertas, PEI), gráficos temporais por domínio cognitivo, detecção de regressões, geração de relatórios com IA e exportação de dados clínicos.'
  );

  addDashboardIllustration(
    '🎓 DASHBOARD DO PROFESSOR',
    'Interface educacional: gestão de turmas e alunos com indicadores de risco, visualização de PEI (Plano Educacional Individualizado), registro de ocorrências escolares, geração de relatórios pedagógicos e módulos de capacitação docente gamificados.'
  );

  addDashboardIllustration(
    '🏛️ DASHBOARD DE REDE (GESTOR)',
    'Painel administrativo: gestão de escolas e licenças por região, indicadores cognitivos agregados por diagnóstico, mapas de risco preditivo geográfico, relatórios de rede para órgãos públicos, logs de auditoria LGPD e estatísticas de engajamento.'
  );

  // Continue with additional sections
  addSection('PÚBLICO-ALVO');
  
  addText('CRIANÇAS (4-17 anos)', 11, true);
  addBullet('Experiência gamificada com feedback imediato e recompensas');
  addBullet('Personalização sensorial baseada no perfil individual');
  addBullet('Progressão adaptativa respeitando ritmo de desenvolvimento');

  yPosition += 2;

  addText('PAIS E RESPONSÁVEIS', 11, true);
  addBullet('Educação parental estruturada sobre neurodiversidade');
  addBullet('Acompanhamento diário do progresso terapêutico');
  addBullet('Orientação de IA para atividades em casa e rotinas');
  addBullet('Atividades cooperativas para fortalecer vínculo parental');

  yPosition += 2;

  addText('TERAPEUTAS E PSICÓLOGOS', 11, true);
  addBullet('Ferramentas clínicas para avaliação e acompanhamento');
  addBullet('Relatórios automatizados com insights de IA');
  addBullet('Gestão de múltiplos pacientes em painel unificado');
  addBullet('Integração com IRB Prime para continuidade de cuidado');

  yPosition += 2;

  addText('ESCOLAS E REDES DE ENSINO', 11, true);
  addBullet('Capacitação docente sobre Lei 14.254/21 e neurodiversidade');
  addBullet('Gestão de PEI digital e acompanhamento pedagógico');
  addBullet('Comunicação escola-família facilitada');
  addBullet('Indicadores de rede para gestão pública');

  // Technology Section
  addSection('TECNOLOGIAS E ARQUITETURA');
  
  addBullet('Frontend: React + TypeScript + Vite + Tailwind CSS');
  addBullet('Backend: Arquitetura serverless escalável com PostgreSQL');
  addBullet('Inteligência Artificial: Modelos avançados de linguagem e análise preditiva');
  addBullet('Edge Functions serverless para lógica de negócio e análise cognitiva');
  addBullet('Row Level Security (RLS) para isolamento de dados por usuário e role');
  addBullet('Sistema de autenticação multi-role (pais, terapeutas, professores, gestores)');
  addBullet('Armazenamento seguro de arquivos e relatórios clínicos');
  addBullet('Aplicação nativa via Capacitor para iOS e Android');

  // Compliance Section
  addSection('CONFORMIDADE LEGAL E ÉTICA');
  
  addBullet('LGPD: Pseudonimização de dados, consentimento granular, acesso baseado em roles');
  addBullet('Lei 14.254/21: Triagem precoce, PEI digital, capacitação de professores');
  addBullet('Disclaimers Clínicos: IA realiza triagem, não diagnóstico. Recomenda avaliação profissional');
  addBullet('Auditoria: Logs completos de acesso e modificação para conformidade');
  addBullet('Segurança: Políticas de segurança robustas, funções seguras e validação de entrada');

  // Differentials Section
  addSection('DIFERENCIAIS COMPETITIVOS');
  
  addBullet('Única plataforma brasileira que integra triagem, gamificação terapêutica, IA e multi-stakeholder');
  addBullet('Partnership clínico com IRB Prime garantindo validação terapêutica');
  addBullet('Sistema Planeta Azul: narrativa gamificada clinicamente estruturada');
  addBullet('Chatbot terapêutico com calibração por faixa etária e contexto familiar');
  addBullet('Análise preditiva de crises comportamentais para intervenção preventiva');
  addBullet('Dashboards especializados para cada stakeholder (não genéricos)');
  addBullet('Conformidade total com legislação brasileira (LGPD + Lei 14.254/21)');
  addBullet('Arquitetura white-label multi-tenant para escalabilidade em redes públicas');

  // Roadmap Section
  addSection('ROADMAP E EXPANSÃO');
  
  addBullet('Fase 1 (Concluída): Infraestrutura clínica, triagem, jogos cognitivos, dashboards básicos');
  addBullet('Fase 2.0 (Concluída): Gamificação avançada, chatbot terapêutico, análise preditiva, atividades cooperativas');
  addBullet('Fase 3 (Em andamento): Aplicativo nativo iOS/Android, biofeedback integrado, expansão de jogos');
  addBullet('Fase 4 (Planejamento): Integração com wearables, telemetria avançada, API pública para parceiros');
  addBullet('Fase 5 (Visão): Expansão internacional, certificação FDA/ANVISA, parcerias com sistemas de saúde públicos');

  // Contact Section
  addSection('CONTATO E PARCERIA');
  
  addText('Para mais informações sobre a plataforma NeuroPlay 2.0 ou oportunidades de parceria com IRB Prime:', 11);
  yPosition += 3;
  addText('IRB Prime Care', 11, true);
  addText('Website: irbprimecare.com.br', 11);
  addText('Email: contato@irbprimecare.com.br', 11);
  
  yPosition += 8;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  addText('Documento gerado automaticamente pela plataforma NeuroPlay 2.0', 9);
  addText(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 9);

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  doc.save('NeuroPlay-Apresentacao-Completa.pdf');
};
