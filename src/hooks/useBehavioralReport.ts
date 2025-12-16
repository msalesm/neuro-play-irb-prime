import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface BehavioralReport {
  conversations: any[];
  insights: any[];
  checkIns: any[];
}

export function useBehavioralReport(childProfileId?: string) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const fetchReportData = async (): Promise<BehavioralReport | null> => {
    if (!user) return null;

    try {
      // Fetch conversations
      let conversationsQuery = supabase
        .from('chat_conversations')
        .select('*, chat_messages(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (childProfileId) {
        conversationsQuery = conversationsQuery.eq('child_profile_id', childProfileId);
      }

      const { data: conversations, error: convError } = await conversationsQuery;
      if (convError) throw convError;

      // Fetch insights
      let insightsQuery = supabase
        .from('behavioral_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (childProfileId) {
        insightsQuery = insightsQuery.eq('child_profile_id', childProfileId);
      }

      const { data: insights, error: insightsError } = await insightsQuery;
      if (insightsError) throw insightsError;

      // Fetch emotional check-ins
      let checkInsQuery = supabase
        .from('emotional_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: false });

      if (childProfileId) {
        checkInsQuery = checkInsQuery.eq('child_profile_id', childProfileId);
      }

      const { data: checkIns, error: checkInsError } = await checkInsQuery;
      if (checkInsError) throw checkInsError;

      return {
        conversations: conversations || [],
        insights: insights || [],
        checkIns: checkIns || [],
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erro ao buscar dados do relatório');
      return null;
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const data = await fetchReportData();
      if (!data) {
        setGenerating(false);
        return;
      }

      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - 2 * margin);
        lines.forEach((line: string) => {
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += fontSize * 0.5;
        });
        yPos += 5;
      };

      // Header
      doc.setFillColor(10, 30, 53); // IRB Petrol color
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('NeuroPlay IRB Prime', margin, 25);
      doc.setFontSize(12);
      doc.text('Relatório Comportamental Terapêutico', margin, 33);
      
      doc.setTextColor(0, 0, 0);
      yPos = 55;

      // Date
      addText(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 10, false);
      yPos += 5;

      // Summary Section
      addText('RESUMO EXECUTIVO', 14, true);
      addText(`Total de Conversas: ${data.conversations.length}`, 10, false);
      addText(`Total de Insights Comportamentais: ${data.insights.length}`, 10, false);
      addText(`Total de Check-ins Emocionais: ${data.checkIns.length}`, 10, false);
      yPos += 10;

      // Insights Section
      if (data.insights.length > 0) {
        addText('INSIGHTS COMPORTAMENTAIS', 14, true);
        
        data.insights.forEach((insight, index) => {
          addText(`${index + 1}. ${insight.title}`, 11, true);
          addText(`Tipo: ${insight.insight_type} | Severidade: ${insight.severity}`, 9, false);
          addText(`Descrição: ${insight.description}`, 10, false);
          
          if (insight.supporting_data?.recommended_actions) {
            addText('Ações Recomendadas:', 10, true);
            insight.supporting_data.recommended_actions.forEach((action: string) => {
              addText(`• ${action}`, 9, false);
            });
          }
          
          addText(`Data: ${new Date(insight.created_at).toLocaleDateString('pt-BR')}`, 9, false);
          yPos += 5;
        });
      }

      // Emotional Check-ins Section
      if (data.checkIns.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }
        
        addText('CHECK-INS EMOCIONAIS', 14, true);
        
        data.checkIns.slice(0, 10).forEach((checkIn, index) => {
          addText(`${index + 1}. ${new Date(checkIn.scheduled_for).toLocaleDateString('pt-BR')}`, 11, true);
          
          if (checkIn.mood_rating) {
            addText(`Humor: ${checkIn.mood_rating}/10`, 10, false);
          }
          
          if (checkIn.emotions_detected && checkIn.emotions_detected.length > 0) {
            addText(`Emoções: ${checkIn.emotions_detected.join(', ')}`, 10, false);
          }
          
          if (checkIn.notes) {
            addText(`Notas: ${checkIn.notes}`, 10, false);
          }
          
          yPos += 3;
        });
      }

      // Conversations Summary
      if (data.conversations.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }
        
        addText('HISTÓRICO DE CONVERSAS', 14, true);
        addText(`Total de ${data.conversations.length} conversas registradas`, 10, false);
        
        data.conversations.slice(0, 5).forEach((conv, index) => {
          addText(`${index + 1}. ${conv.title || 'Conversa'}`, 11, true);
          addText(`Data: ${new Date(conv.created_at).toLocaleDateString('pt-BR')}`, 9, false);
          addText(`Mensagens: ${conv.chat_messages?.length || 0}`, 9, false);
          
          if (conv.sentiment_score) {
            addText(`Score de Sentimento: ${conv.sentiment_score.toFixed(2)}`, 9, false);
          }
          
          if (conv.behavioral_tags && conv.behavioral_tags.length > 0) {
            addText(`Tags: ${conv.behavioral_tags.join(', ')}`, 9, false);
          }
          
          yPos += 3;
        });
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${totalPages} | Neuro IRB Prime | Relatório Confidencial`,
          doc.internal.pageSize.width / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `relatorio-comportamental-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setGenerating(false);
    }
  };

  return {
    generatePDF,
    generating,
  };
}
