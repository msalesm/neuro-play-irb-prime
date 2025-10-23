import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GamePerformanceData, DiagnosticReport } from '@/types/cognitive-analysis';

export function useCognitiveAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const generateReport = async (
    performanceData: GamePerformanceData[],
    userAge?: number,
    userProfile?: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      console.log('Requesting cognitive analysis...', { 
        gamesCount: performanceData.length,
        userAge,
        userProfile 
      });

      const { data, error } = await supabase.functions.invoke('cognitive-analysis', {
        body: { 
          performanceData,
          userAge,
          userProfile
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar relatório');
      }

      console.log('Cognitive report generated successfully');
      setReport(data.report);
      
      toast.success('Relatório diagnóstico gerado com sucesso!');
      return data.report;

    } catch (error) {
      console.error('Error generating cognitive report:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          toast.error('Muitas requisições. Aguarde alguns instantes.');
        } else if (error.message.includes('402')) {
          toast.error('Créditos insuficientes. Contate o suporte.');
        } else {
          toast.error('Erro ao gerar relatório: ' + error.message);
        }
      } else {
        toast.error('Erro ao gerar relatório diagnóstico');
      }
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    report,
    generateReport,
  };
}
