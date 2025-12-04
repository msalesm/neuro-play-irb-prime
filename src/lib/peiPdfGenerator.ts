import jsPDF from 'jspdf';

interface PEIGoal {
  id: string;
  area: string;
  objective: string;
  strategies: string[];
  timeline: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
}

interface PEIAccommodation {
  id: string;
  type: string;
  description: string;
  context: string;
}

interface StudentInfo {
  name: string;
  age?: number;
  grade?: string;
  shift?: string;
  institution?: string;
}

interface BNCCSkill {
  code: string;
  knowledgeObject: string;
  skill: string;
}

interface PEIReportData {
  studentInfo: StudentInfo;
  classification: string;
  totalScore: number;
  goals: PEIGoal[];
  accommodations: PEIAccommodation[];
  strategies: string[];
  orientations: string;
  bnccSkills?: BNCCSkill[];
  progressNotes?: any[];
}

export function generatePEIPdf(data: PEIReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 15;

  const primaryColor: [number, number, number] = [10, 30, 53]; // #0a1e35
  const secondaryColor: [number, number, number] = [0, 90, 112]; // #005a70
  const accentColor: [number, number, number] = [199, 146, 62]; // #c7923e
  const grayColor: [number, number, number] = [100, 100, 100];
  const lightGray: [number, number, number] = [240, 240, 240];
  const darkGray: [number, number, number] = [50, 50, 50];

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, x, y);
      y += fontSize * 0.4;
    });
  };

  // Helper to draw table header
  const drawTableHeader = (headers: { text: string; width: number }[], bgColor: [number, number, number]) => {
    let x = margin;
    doc.setFillColor(...bgColor);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach(header => {
      doc.text(header.text, x + 2, y);
      x += header.width;
    });
    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  };

  // Helper to draw section header
  const drawSectionHeader = (text: string, bgColor: [number, number, number] = secondaryColor) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(...bgColor);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  };

  // === HEADER ===
  // Date
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  const currentDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(currentDate, pageWidth - margin, y, { align: 'right' });
  y += 8;

  // Institution name
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(data.studentInfo.institution || 'NeuroPlay IRB Prime', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Title
  doc.setFontSize(14);
  doc.setTextColor(...darkGray);
  doc.text('PLANO DE ENSINO INDIVIDUALIZADO (PEI)', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // === GENERAL CLASSIFICATION BAR ===
  doc.setFillColor(...lightGray);
  doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  doc.text(`Classificação Geral: `, margin + 2, y);
  doc.setFont('helvetica', 'bold');
  doc.text(data.classification, margin + 40, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pontuação Geral: `, pageWidth / 2 + 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.totalScore), pageWidth / 2 + 60, y);
  y += 12;

  // === STUDENT INFO TABLE ===
  const studentHeaders = [
    { text: 'Aluno', width: 90 },
    { text: 'Idade', width: 25 },
    { text: 'Ano', width: 25 },
    { text: 'Turno', width: 40 }
  ];
  drawTableHeader(studentHeaders, primaryColor);

  // Student data row
  doc.setFillColor(255, 255, 255);
  doc.setFontSize(9);
  let x = margin;
  doc.text(data.studentInfo.name || 'Não informado', x + 2, y);
  x += 90;
  doc.text(String(data.studentInfo.age || '-'), x + 2, y);
  x += 25;
  doc.text(data.studentInfo.grade || '-', x + 2, y);
  x += 25;
  doc.text(data.studentInfo.shift || '-', x + 2, y);
  y += 12;

  // === GOALS SECTION ===
  if (data.goals.length > 0) {
    data.goals.forEach((goal, goalIndex) => {
      // Goal header bar
      drawSectionHeader(goal.area, secondaryColor);

      // Classification and score for this goal
      doc.setFillColor(...lightGray);
      doc.rect(margin, y - 4, (pageWidth - margin * 2) / 2, 8, 'F');
      doc.rect(margin + (pageWidth - margin * 2) / 2, y - 4, (pageWidth - margin * 2) / 2, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      const statusLabel = goal.status === 'active' ? 'Em progresso' : goal.status === 'completed' ? 'Concluído' : 'Pendente';
      doc.text(`Classificação: ${statusLabel}`, margin + 5, y);
      doc.text(`Progresso: ${goal.progress}%`, pageWidth / 2 + 20, y);
      y += 10;

      // Objective
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.setFont('helvetica', 'bold');
      doc.text('Objetivo: ', margin, y);
      doc.setFont('helvetica', 'normal');
      const objectiveText = doc.splitTextToSize(goal.objective, pageWidth - margin * 2 - 20);
      objectiveText.forEach((line: string) => {
        doc.text(line, margin + 18, y);
        y += 4;
      });
      y += 4;

      // BNCC Skills table (if available for this goal area)
      if (data.bnccSkills && data.bnccSkills.length > 0) {
        const bnccHeaders = [
          { text: 'Código BNCC', width: 35 },
          { text: 'Objeto de Conhecimento', width: 55 },
          { text: 'Habilidade', width: 90 }
        ];
        drawTableHeader(bnccHeaders, primaryColor);

        const filteredSkills = data.bnccSkills.slice(0, 3); // Max 3 skills per goal
        filteredSkills.forEach(skill => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(8);
          x = margin;
          doc.text(skill.code, x + 2, y);
          x += 35;
          
          const knowledgeLines = doc.splitTextToSize(skill.knowledgeObject, 50);
          const skillLines = doc.splitTextToSize(skill.skill, 85);
          const maxLines = Math.max(knowledgeLines.length, skillLines.length);
          
          knowledgeLines.forEach((line: string, i: number) => {
            doc.text(line, x + 2, y + (i * 3.5));
          });
          x += 55;
          
          skillLines.forEach((line: string, i: number) => {
            doc.text(line, x + 2, y + (i * 3.5));
          });
          
          y += maxLines * 3.5 + 4;
        });
        y += 4;
      }

      // Strategies section
      if (goal.strategies.length > 0) {
        drawSectionHeader('Estratégias', [100, 100, 100]);
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        goal.strategies.forEach(strategy => {
          if (y > pageHeight - 25) {
            doc.addPage();
            y = 20;
          }
          doc.text(`● ${strategy}`, margin + 5, y);
          y += 5;
        });
        y += 4;
      }

      // Timeline
      if (goal.timeline) {
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(`Prazo: ${goal.timeline}`, margin, y);
        y += 8;
      }

      y += 4;
    });
  }

  // === ACCOMMODATIONS SECTION ===
  if (data.accommodations.length > 0) {
    drawSectionHeader('Acomodações Pedagógicas', secondaryColor);
    
    data.accommodations.forEach(acc => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`● ${acc.type}`, margin + 5, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray);
      const descLines = doc.splitTextToSize(acc.description, pageWidth - margin * 2 - 15);
      descLines.forEach((line: string) => {
        doc.text(line, margin + 10, y);
        y += 4;
      });
      if (acc.context) {
        doc.setTextColor(...grayColor);
        doc.setFontSize(8);
        doc.text(`Contexto: ${acc.context}`, margin + 10, y);
        y += 6;
      }
      y += 2;
    });
    y += 4;
  }

  // === GENERAL STRATEGIES SECTION ===
  if (data.strategies.length > 0) {
    drawSectionHeader('Estratégias Gerais', secondaryColor);
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    data.strategies.forEach(strategy => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }
      doc.text(`● ${strategy}`, margin + 5, y);
      y += 5;
    });
    y += 4;
  }

  // === ORIENTATIONS SECTION ===
  if (data.orientations) {
    drawSectionHeader('Orientações', secondaryColor);
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    const orientationLines = doc.splitTextToSize(data.orientations, pageWidth - margin * 2 - 5);
    orientationLines.forEach((line: string) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin + 5, y);
      y += 4;
    });
    y += 8;
  }

  // === OBSERVATION BOX ===
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('Observação:', margin, y);
  doc.setFont('helvetica', 'italic');
  const observationText = 'Para cada ano, adapte as atividades/estratégias para o nível de complexidade e autonomia esperado, sempre vinculando à habilidade BNCC do respectivo ano e mantendo o foco no desenvolvimento integral do aluno.';
  const obsLines = doc.splitTextToSize(observationText, pageWidth - margin * 2 - 25);
  obsLines.forEach((line: string, i: number) => {
    doc.text(line, margin + 28, y + (i * 4));
  });
  y += obsLines.length * 4 + 10;

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    doc.text('by NeuroPlay IRB Prime 2025', pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  const fileName = `PEI-${data.studentInfo.name?.replace(/\s+/g, '-') || 'Aluno'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Helper function to get classification label based on score
export function getClassificationLabel(score: number): string {
  if (score >= 9) return 'Muito acima do esperado';
  if (score >= 7) return 'Acima do esperado';
  if (score >= 5) return 'Dentro do esperado';
  if (score >= 3) return 'Abaixo do esperado';
  return 'Muito abaixo do esperado';
}

// Default BNCC skills for different areas
export function getDefaultBNCCSkills(area: string): BNCCSkill[] {
  const skillsMap: Record<string, BNCCSkill[]> = {
    'Consciência Fonológica': [
      { code: 'EF01LP28', knowledgeObject: 'Consciência fonológica', skill: 'Comparar palavras identificando semelhanças e diferenças entre sons de sílabas iniciais, mediais e finais.' },
      { code: 'EF01LP38', knowledgeObject: 'Elementos constitutivos do discurso poético em versos: estratos fônico e semântico', skill: 'Reconhecer, em textos versificados, rimas, sonoridades, jogos de palavras, palavras, expressões, comparações, relacionando-as com sensações e associações.' },
      { code: 'EF01LP41', knowledgeObject: 'Processos de criação', skill: 'Recitar parlendas, quadras, quadrinhas e poemas, com entonação e emotividade.' }
    ],
    'Atenção': [
      { code: 'EF01LP01', knowledgeObject: 'Leitura de textos', skill: 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página.' },
      { code: 'EF01LP02', knowledgeObject: 'Leitura de textos', skill: 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética.' },
      { code: 'EF01LP03', knowledgeObject: 'Construção do sistema alfabético', skill: 'Observar escritas convencionais, comparando-as às suas produções escritas, percebendo semelhanças e diferenças.' }
    ],
    'Linguagem': [
      { code: 'EF01LP04', knowledgeObject: 'Conhecimento do alfabeto', skill: 'Distinguir as letras do alfabeto de outros sinais gráficos.' },
      { code: 'EF01LP05', knowledgeObject: 'Compreensão em leitura', skill: 'Identificar a função social de textos que circulam em campos da vida social.' },
      { code: 'EF01LP06', knowledgeObject: 'Leitura de textos', skill: 'Segmentar oralmente palavras em sílabas.' }
    ],
    'Social': [
      { code: 'EF01LP15', knowledgeObject: 'Características da conversação espontânea', skill: 'Agrupar palavras pelo critério de aproximação de significado (semanticamente).' },
      { code: 'EF01LP16', knowledgeObject: 'Forma de composição do texto', skill: 'Ler e compreender em colaboração com os colegas e com a ajuda do professor.' },
      { code: 'EF01LP17', knowledgeObject: 'Edição de textos', skill: 'Planejar e produzir, em colaboração com os colegas e com a ajuda do professor, listas, agendas.' }
    ],
    'Memória': [
      { code: 'EF01MA01', knowledgeObject: 'Contagem de rotina', skill: 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas.' },
      { code: 'EF01MA02', knowledgeObject: 'Quantificação de elementos', skill: 'Contar de maneira exata ou aproximada, utilizando diferentes estratégias.' },
      { code: 'EF01MA03', knowledgeObject: 'Leitura e escrita de números', skill: 'Estimar e comparar quantidades de objetos de dois conjuntos, por estimativa.' }
    ]
  };

  return skillsMap[area] || skillsMap['Atenção'];
}
