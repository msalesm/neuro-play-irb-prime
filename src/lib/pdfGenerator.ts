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
