import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

interface ClinicalReport {
  id: string;
  user_id: string;
  report_type: string;
  generated_date: string;
  report_period_start: string;
  report_period_end: string;
  summary_insights: string;
  detailed_analysis: any;
  progress_indicators: any;
  intervention_recommendations: any;
  alert_flags: any;
  generated_by_ai: boolean;
  reviewed_by_professional: boolean;
}

export const useClinicalReports = (userId?: string) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, userId, isAdmin]);

  const loadReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('clinical_reports')
        .select('*')
        .order('generated_date', { ascending: false });

      // Se não é admin, filtra pelo userId fornecido ou do usuário atual
      if (!isAdmin) {
        query = query.eq('user_id', userId || user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (params: {
    startDate: string;
    endDate: string;
    reportType: 'comprehensive' | 'cognitive' | 'behavioral';
  }) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      toast.error('Usuário não encontrado');
      return null;
    }

    setGenerating(true);
    try {
      toast.info('Gerando relatório clínico com análise de IA...');

      const { data, error } = await supabase.functions.invoke('generate-clinical-report', {
        body: {
          userId: targetUserId,
          startDate: params.startDate,
          endDate: params.endDate,
          reportType: params.reportType
        }
      });

      if (error) throw error;

      if (data.status === 'error') {
        if (data.message?.includes('Nenhum dado encontrado')) {
          toast.error('Nenhuma sessão de jogo encontrada', {
            description: data.suggestion || 'Complete alguns jogos primeiro para gerar um relatório.'
          });
        } else {
          toast.error('Erro ao gerar relatório', {
            description: data.message
          });
        }
        return null;
      }

      toast.success('Relatório gerado com sucesso!', {
        description: 'Análise de IA incluída'
      });

      await loadReports();
      return data.data;
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório', {
        description: error.message
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return {
    reports,
    loading,
    generating,
    generateReport,
    reload: loadReports
  };
};
