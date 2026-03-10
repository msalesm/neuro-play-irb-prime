import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function generateInstitutionalPDF() {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.width;
  const now = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
  let y = 0;

  const addPage = () => { doc.addPage(); y = 25; };
  const checkPage = (need: number) => { if (y + need > 270) addPage(); };

  // ── PAGE 1: Cover ──────────────────────────────
  doc.setFillColor(58, 134, 255);
  doc.rect(0, 0, w, 55, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroPlay', 20, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Plataforma de Triagem e Desenvolvimento Cognitivo Infantil', 20, 42);
  doc.setFontSize(9);
  doc.text(`Documento institucional · ${now}`, 20, 50);

  y = 72;
  doc.setTextColor(20, 20, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Avalie, acompanhe e desenvolva habilidades', 20, y);
  y += 8;
  doc.text('cognitivas de crianças com dados e ciência.', 20, y);
  y += 16;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  const intro = doc.splitTextToSize(
    'O NeuroPlay utiliza jogos cognitivos e análise de dados para avaliar habilidades importantes para o aprendizado. ' +
    'A plataforma gera um índice cognitivo proprietário (NCI) que acompanha o desenvolvimento da criança ao longo do tempo, ' +
    'oferecendo relatórios para professores, escolas, profissionais e famílias.',
    170
  );
  doc.text(intro, 20, y);
  y += intro.length * 5 + 10;

  // Key benefits
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Benefícios Principais', 20, y);
  y += 10;

  const benefits: [string, string][] = [
    ['Triagem cognitiva em minutos', 'Avaliação gamificada rápida para turmas inteiras'],
    ['Acompanhamento longitudinal', 'Evolução cognitiva semana a semana com gráficos claros'],
    ['Relatórios automáticos', 'Dashboards para professores, diretores e famílias'],
    ['Intervenções baseadas em dados', 'Protocolos de exercícios sugeridos automaticamente'],
    ['LGPD Compliant', 'Dados seguros e em conformidade com a legislação brasileira'],
  ];

  doc.setFontSize(10);
  benefits.forEach(([title, desc]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(58, 134, 255);
    doc.text('●', 22, y);
    doc.setTextColor(20, 20, 30);
    doc.text(title, 28, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(desc, 28, y + 5);
    y += 14;
  });

  // ── PAGE 2: Problema & Solução ─────────────────
  addPage();
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('O Problema', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  const problem = doc.splitTextToSize(
    'Muitas dificuldades cognitivas infantis não são identificadas precocemente. ' +
    'Isso resulta em atraso na alfabetização, dificuldades de atenção, baixa confiança escolar e diagnóstico tardio. ' +
    'Escolas e famílias muitas vezes não possuem ferramentas para detectar sinais precoces.',
    170
  );
  doc.text(problem, 20, y);
  y += problem.length * 5 + 12;

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('A Solução NeuroPlay', 20, y);
  y += 10;

  const steps: [string, string][] = [
    ['1. Triagem Gamificada', 'Jogos cognitivos curtos avaliam atenção, memória, linguagem e funções executivas.'],
    ['2. Análise Cognitiva Automática', 'O sistema calcula o NeuroPlay Cognitive Index (NCI) com score 0-100.'],
    ['3. Recomendações de Intervenção', 'Protocolos de exercícios são sugeridos com base nos resultados.'],
    ['4. Acompanhamento da Evolução', 'Relatórios longitudinais mostram progresso real ao longo do tempo.'],
  ];

  doc.setFontSize(10);
  steps.forEach(([title, desc]) => {
    checkPage(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(58, 134, 255);
    doc.text(title, 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    const lines = doc.splitTextToSize(desc, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 8;
  });

  // ── PAGE 3: NCI ────────────────────────────────
  addPage();
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('NeuroPlay Cognitive Index (NCI)', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  const nciDesc = doc.splitTextToSize(
    'Índice cognitivo proprietário que combina 5 domínios para gerar um score único de 0 a 100. ' +
    'Permite monitorar o desenvolvimento cognitivo infantil de forma padronizada.',
    170
  );
  doc.text(nciDesc, 20, y);
  y += nciDesc.length * 5 + 10;

  // Table header
  doc.setFillColor(240, 243, 248);
  doc.rect(20, y - 4, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Domínio', 22, y);
  doc.text('Peso', 100, y);
  doc.text('Descrição', 120, y);
  y += 8;

  const domains: [string, string, string][] = [
    ['Atenção', '25%', 'Foco sustentado e seletivo'],
    ['Memória de Trabalho', '25%', 'Retenção e manipulação'],
    ['Linguagem', '20%', 'Processamento fonológico'],
    ['Função Executiva', '20%', 'Planejamento e inibição'],
    ['Cognição Social', '10%', 'Reconhecimento emocional'],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  domains.forEach(([name, weight, desc]) => {
    doc.text(name, 22, y);
    doc.text(weight, 100, y);
    doc.text(desc, 120, y);
    y += 7;
  });
  y += 8;

  // NCI Bands
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Classificação NCI', 20, y);
  y += 8;

  const bands: [string, string, number, number, number][] = [
    ['85-100', 'Avançado', 16, 185, 129],
    ['70-84', 'Desenvolvimento Saudável', 16, 185, 129],
    ['55-69', 'Atenção Recomendada', 245, 158, 11],
    ['40-54', 'Intervenção Sugerida', 249, 115, 22],
    ['0-39', 'Intervenção Urgente', 239, 68, 68],
  ];

  doc.setFontSize(10);
  bands.forEach(([range, label, r, g, b]) => {
    doc.setFillColor(r, g, b);
    doc.circle(25, y - 1.5, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text(range, 30, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(label, 55, y);
    y += 7;
  });

  // ── PAGE 4: Audiências & Ciência ───────────────
  addPage();
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Para Quem é o NeuroPlay', 20, y);
  y += 12;

  const audiences: [string, string][] = [
    ['Escolas', 'Triagem cognitiva em turmas, acompanhamento pedagógico, relatórios institucionais para diretores.'],
    ['Profissionais de Saúde', 'Psicólogos, fonoaudiólogos e terapeutas acompanham evolução com dados estruturados.'],
    ['Famílias', 'Pais recebem mini-relatórios sobre o desenvolvimento cognitivo dos filhos.'],
    ['Redes de Ensino', 'Gestão centralizada com comparação entre escolas e relatórios municipais.'],
  ];

  doc.setFontSize(10);
  audiences.forEach(([title, desc]) => {
    checkPage(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(58, 134, 255);
    doc.text(title, 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    const lines = doc.splitTextToSize(desc, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 10;
  });

  checkPage(50);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Dados e Ciência', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  const science = doc.splitTextToSize(
    'A plataforma registra eventos cognitivos detalhados durante cada atividade: tempo de reação, ' +
    'latência cognitiva, taxa de erro, sequência de tentativa e persistência.',
    170
  );
  doc.text(science, 20, y);
  y += science.length * 5 + 10;

  const metrics = [
    'Tempo de reação (ms)', 'Precisão por tentativa (%)', 'Latência cognitiva',
    'Taxa de persistência', 'Padrões de abandono', 'Sequência de tentativas',
  ];
  metrics.forEach((m) => {
    doc.setTextColor(58, 134, 255);
    doc.text('▸', 22, y);
    doc.setTextColor(100, 100, 120);
    doc.text(m, 28, y);
    y += 6;
  });

  // ── PAGE 5: Escala & Modelo ────────────────────
  addPage();
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Potencial de Escala', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFillColor(240, 243, 248);
  doc.rect(20, y - 4, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Fase', 22, y);
  doc.text('Escolas', 70, y);
  doc.text('Alunos', 120, y);
  y += 8;

  const scaleData: [string, string, string][] = [
    ['Fase Inicial', '50 escolas', '20.000 alunos'],
    ['Expansão', '500 escolas', '200.000 alunos'],
    ['Escala', '2.000 escolas', '800.000 alunos'],
    ['Meta', '+ uso familiar', '1.000.000+ alunos'],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  scaleData.forEach(([phase, schools, students]) => {
    doc.text(phase, 22, y);
    doc.text(schools, 70, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text(students, 120, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    y += 7;
  });

  y += 15;
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 30);
  doc.text('Modelo Freemium', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(58, 134, 255);
  doc.text('Plano Gratuito', 20, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  ['Jogos cognitivos básicos', 'Triagem inicial', 'Dashboard simples'].forEach((t) => {
    doc.text(`• ${t}`, 24, y); y += 6;
  });
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(58, 134, 255);
  doc.text('Plano Institucional', 20, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  ['Relatórios avançados e NCI completo', 'Comparação entre turmas e escolas', 'Acompanhamento longitudinal', 'Protocolos de intervenção'].forEach((t) => {
    doc.text(`• ${t}`, 24, y); y += 6;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 170);
    doc.text(
      `NeuroPlay · Plataforma de Neurodesenvolvimento Infantil · Página ${i} de ${totalPages}`,
      w / 2, 287,
      { align: 'center' }
    );
    doc.setDrawColor(58, 134, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 283, w - 20, 283);
  }

  doc.save(`NeuroPlay-Institucional-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
