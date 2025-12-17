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
      
      // Get child IDs this user has access to (as parent or therapist)
      let childIds: string[] = [];
      
      // Get children as parent
      const { data: parentChildren } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', user.id);
      
      if (parentChildren) {
        childIds = parentChildren.map(c => c.id);
      }
      
      // Get children via child_access (for therapists)
      const { data: accessChildren } = await supabase
        .from('child_access')
        .select('child_id')
        .eq('professional_id', user.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved');
      
      if (accessChildren) {
        childIds = [...new Set([...childIds, ...accessChildren.map(a => a.child_id)])];
      }
      
      let query = supabase
        .from('clinical_reports')
        .select('*')
        .order('generated_date', { ascending: false });

      // Filter by specific userId if provided, otherwise by accessible children/user
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (!isAdmin && childIds.length > 0) {
        // Include reports for user's accessible children + their own user_id
        query = query.or(`user_id.eq.${user.id},user_id.in.(${childIds.join(',')})`);
      } else if (!isAdmin) {
        query = query.eq('user_id', user.id);
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

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao chamar função de relatório');
      }

      if (!data) {
        throw new Error('Resposta vazia do servidor');
      }

      if (data.status === 'error') {
        if (data.message?.includes('Nenhum dado encontrado')) {
          toast.error('Nenhuma sessão de jogo encontrada', {
            description: data.suggestion || 'Complete alguns jogos primeiro para gerar um relatório.'
          });
        } else {
          toast.error('Erro ao gerar relatório', {
            description: data.message || 'Tente novamente mais tarde.'
          });
        }
        return null;
      }

      toast.success('Relatório gerado com sucesso!', {
        description: data.warning ? 'Análise parcial' : 'Análise de IA incluída'
      });

      await loadReports();
      return data.data || data;
    } catch (error: any) {
      console.error('Error generating report:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      
      // Check for specific error types
      if (errorMessage.includes('Nenhum dado') || errorMessage.includes('No data')) {
        toast.error('Nenhum dado encontrado', {
          description: 'Complete alguns jogos de diagnóstico primeiro.'
        });
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('Sessão expirada', {
          description: 'Faça login novamente.'
        });
      } else {
        toast.error('Erro ao gerar relatório', {
          description: errorMessage
        });
      }
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
