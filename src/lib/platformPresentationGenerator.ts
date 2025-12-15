import jsPDF from 'jspdf';

export const generatePlatformPresentation = () => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = 25;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    
    yPosition += 3;
  };

  const addSection = (title: string) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 25;
    }
    yPosition += 8;
    doc.setFillColor(10, 30, 53);
    doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 12;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('•', margin + 2, yPosition);
    const lines = doc.splitTextToSize(text, maxWidth - 10);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 25;
      }
      doc.text(line, margin + 8, yPosition);
      yPosition += 5;
    });
    yPosition += 1;
  };

  const addSubtitle = (text: string) => {
    yPosition += 3;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 90, 112);
    doc.text(text, margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;
  };

  // ===== CAPA =====
  doc.setFillColor(10, 30, 53);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroPlay', pageWidth / 2, 80, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Diagnóstico, cuidado e desenvolvimento humano', pageWidth / 2, 100, { align: 'center' });
  doc.text('em uma única plataforma.', pageWidth / 2, 110, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(199, 146, 62);
  doc.text('APRESENTAÇÃO INSTITUCIONAL', pageWidth / 2, 140, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Plataforma operacional | 6 fases implementadas', pageWidth / 2, 160, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ===== PÁGINA 2: O QUE É =====
  doc.addPage();
  yPosition = 25;
  
  addSection('O QUE É A NEUROPLAY');
  addText('A NeuroPlay é uma plataforma digital integrada que conecta diagnóstico, acompanhamento clínico e desenvolvimento cognitivo em um único ambiente.', 11);
  yPosition += 3;
  addText('Criada para profissionais, instituições e governos que precisam de dados confiáveis, processos claros e escala operacional.', 11);
  yPosition += 5;
  addText('Nada de atividades soltas. Nada de soluções fragmentadas.', 11, true);

  // ===== O QUE ENTREGA =====
  addSection('O QUE A PLATAFORMA ENTREGA');
  addBullet('Diagnóstico estruturado e contínuo com avaliações padronizadas');
  addBullet('Prontuário eletrônico completo do paciente');
  addBullet('Teleconsulta integrada com split-screen clínico');
  addBullet('Relatórios cognitivos e comportamentais automatizados');
  addBullet('Histórico evolutivo longitudinal com timeline integrada');
  addBullet('Acompanhamento familiar e institucional multi-stakeholder');
  addBullet('Arquitetura preparada para integrações e APIs externas');
  addBullet('Gestão operacional com filas, SLA e métricas de performance');

  // ===== PARA QUEM É =====
  addSection('PARA QUEM É');
  
  addSubtitle('Clínicas e Profissionais');
  addText('Diagnóstico, prontuário, teleconsulta e relatórios em um único fluxo integrado.', 10);
  
  addSubtitle('Escolas e Instituições');
  addText('Acompanhamento contínuo, dados claros e integração com famílias.', 10);
  
  addSubtitle('Governo e Setor Público');
  addText('Plataforma auditável, escalável e preparada para políticas públicas.', 10);
  
  addSubtitle('Operadoras e Parceiros');
  addText('Infraestrutura digital pronta para integração e white-label.', 10);

  // ===== EVOLUÇÃO POR FASES =====
  doc.addPage();
  yPosition = 25;
  
  addSection('EVOLUÇÃO: 6 FASES IMPLEMENTADAS');
  addText('A NeuroPlay foi desenvolvida em seis fases progressivas. Todas operam de forma integrada, formando uma plataforma sólida e pronta para uso institucional.', 11);
  yPosition += 5;

  // FASE 1-2
  addSubtitle('FASES 1-2: INFRAESTRUTURA CLÍNICA');
  addBullet('Sistema de autenticação multi-role (pais, terapeutas, professores, gestores, pacientes adultos)');
  addBullet('Onboarding com consentimento LGPD e wizard de perfil');
  addBullet('Triagem Unificada NeuroPlay (TUNP) - 6 dimensões neurodesenvolvimentais');
  addBullet('Prontuário eletrônico com timeline clínica');
  addBullet('Dashboards especializados por role (pais, terapeutas, professores, rede)');
  addBullet('Sistema Planeta Azul com jogos terapêuticos cognitivos');
  addBullet('Histórias sociais ilustradas com acessibilidade');
  addBullet('Chatbot terapêutico com IA contextualizada por idade');
  addBullet('Análise preditiva de regressões comportamentais');
  addBullet('Check-ins emocionais com captura facial via Google Vision API');
  addBullet('Presets de acessibilidade clínica (TEA, TDAH, baixa visão, motor)');

  // FASE 3
  addSubtitle('FASE 3: INTEROPERABILIDADE E API');
  addBullet('Gestão de API Keys com permissões granulares');
  addBullet('Sistema de Webhooks configuráveis para integrações');
  addBullet('Logs de sincronização de dados externos');
  addBullet('Rate limiting e controle de uso de API');
  addBullet('Validação e hash seguro de chaves');
  addBullet('Dashboard de monitoramento de integrações');

  // FASE 4
  addSubtitle('FASE 4: ESCALA OPERACIONAL');
  addBullet('Gestão de filas dinâmicas por risco (baixo/moderado/alto)');
  addBullet('Configurações de SLA por instituição');
  addBullet('Distribuição automática de carga entre profissionais');
  addBullet('Escalação automática de casos críticos');
  addBullet('Gestão de turnos e passagem de plantão');
  addBullet('Agenda de disponibilidade profissional');
  addBullet('Métricas de performance operacional (tempo médio, volume, satisfação)');
  addBullet('Alertas operacionais automáticos');

  doc.addPage();
  yPosition = 25;

  // FASE 5
  addSubtitle('FASE 5: FATURAMENTO E CONTRATOS');
  addBullet('Gestão de contratos institucionais com ciclo de vida completo');
  addBullet('Emendas contratuais rastreáveis');
  addBullet('Geração automática de invoices com numeração sequencial');
  addBullet('Status de pagamento e acompanhamento financeiro');
  addBullet('Integração com Stripe para processamento de pagamentos');
  addBullet('Dashboard financeiro com visão consolidada');

  // FASE 6
  addSubtitle('FASE 6: EVIDÊNCIA E IMPACTO');
  addBullet('Medição de outcomes clínicos longitudinais');
  addBullet('Cálculo de efetividade de intervenções por tipo');
  addBullet('Relatórios de impacto automatizados');
  addBullet('Métricas de baseline vs. follow-up');
  addBullet('Taxa de melhoria e NPS por período');
  addBullet('Dashboard de evidências para stakeholders');
  addBullet('Exportação de dados para auditoria');

  // ===== FUNCIONALIDADES CORE =====
  addSection('FUNCIONALIDADES CORE');
  
  addSubtitle('Prontuário Eletrônico Unificado');
  addBullet('Mapa cognitivo via radar visualization');
  addBullet('Timeline integrada de todas as ações clínicas');
  addBullet('Avaliações em 3 blocos: Cognitivo, Comportamental, Socioemocional');
  addBullet('Histórico emocional com progressão temporal');
  addBullet('Inteligência de rotina com correlações comportamentais');
  addBullet('Geração de relatórios IA mensais/trimestrais');

  addSubtitle('Teleconsulta Integrada');
  addBullet('WebRTC nativo para vídeo peer-to-peer');
  addBullet('Split-screen: vídeo + prontuário em tempo real');
  addBullet('Anotações clínicas durante sessão');
  addBullet('Histórico do paciente acessível durante consulta');
  addBullet('Fechamento obrigatório com sumário clínico');
  addBullet('Plano de follow-up estruturado');

  addSubtitle('IA Terapêutica');
  addBullet('Chatbot contextualizado por idade e perfil');
  addBullet('Detecção de padrões comportamentais');
  addBullet('Recomendações personalizadas de jogos');
  addBullet('Análise emocional via captura facial');
  addBullet('Insights preditivos de regressão');

  // ===== ARQUITETURA =====
  doc.addPage();
  yPosition = 25;
  
  addSection('ARQUITETURA TÉCNICA');
  addBullet('Frontend: React + TypeScript + Vite + Tailwind CSS');
  addBullet('Backend: Supabase (PostgreSQL + Edge Functions)');
  addBullet('IA: Google Gemini, OpenAI GPT, Google Cloud Vision');
  addBullet('Vídeo: WebRTC nativo');
  addBullet('Mobile: Capacitor (iOS/Android)');
  addBullet('Segurança: RLS policies, SECURITY DEFINER functions, JWT auth');
  addBullet('Multi-tenant: Isolamento por instituição');
  addBullet('White-label ready');

  // ===== CONFORMIDADE =====
  addSection('CONFORMIDADE');
  addBullet('LGPD: Pseudonimização, consentimento granular, direito ao esquecimento');
  addBullet('Lei 14.254/21: Triagem precoce, PEI digital, capacitação docente');
  addBullet('Auditoria: Logs imutáveis de todas as ações clínicas');
  addBullet('Disclaimers: IA realiza triagem, não diagnóstico definitivo');
  addBullet('RLS: Isolamento de dados por role e instituição');

  // ===== DIFERENCIAIS =====
  addSection('DIFERENCIAIS COMPETITIVOS');
  addBullet('Única plataforma brasileira que integra diagnóstico + prontuário + teleconsulta + IA');
  addBullet('Arquitetura pronta para escala governamental e institucional');
  addBullet('6 fases completas: não é MVP, é produto operacional');
  addBullet('Dashboards especializados por stakeholder');
  addBullet('Gestão operacional com SLA e filas dinâmicas');
  addBullet('Medição de outcomes e evidência de impacto nativa');
  addBullet('Conformidade total com legislação brasileira');

  // ===== ENCERRAMENTO =====
  addSection('CONTATO');
  yPosition += 3;
  addText('NeuroPlay é infraestrutura digital para diagnóstico e desenvolvimento humano.', 12, true);
  addText('Não é um experimento. É um sistema pronto.', 11);
  yPosition += 8;
  addText('Para demonstrações e parcerias institucionais:', 11);
  addText('contato@neuroplay.com.br', 11, true, [0, 90, 112]);
  
  yPosition += 15;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  addText('Documento gerado automaticamente pela plataforma NeuroPlay', 9);
  addText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 9);

  // Adicionar rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) { // Pula a capa
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('NeuroPlay | Apresentação Institucional', margin, pageHeight - 10);
    doc.text(`${i}/${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  doc.save('NeuroPlay-Apresentacao-Institucional.pdf');
};
