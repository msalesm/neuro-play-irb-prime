/**
 * Hook: useReportEngine
 * 
 * Connects the core report-engine to real data via useBehavioralProfile.
 * Provides role-filtered report generation and PDF export.
 */

import { useState, useCallback } from 'react';
import { useUserRole } from './useUserRole';
import { useBehavioralProfile } from './useBehavioralProfile';
import { generateReport, getAvailableReportTypes, type ReportConfig, type GeneratedReport, type ReportType } from '@/core/report-engine';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useReportEngine(childId: string, childName: string) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { data: profile, isLoading: profileLoading } = useBehavioralProfile(childId);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [generating, setGenerating] = useState(false);

  const availableTypes = getAvailableReportTypes(role || 'parent');

  const generate = useCallback(async (type: ReportType, periodStart: string, periodEnd: string) => {
    if (!profile) {
      toast.error('Perfil comportamental ainda não disponível');
      return null;
    }

    setGenerating(true);
    try {
      const config: ReportConfig = {
        type,
        childId,
        childName,
        periodStart,
        periodEnd,
        generatedBy: user?.id || 'system',
        role: role || 'parent',
      };

      const result = generateReport(config, profile);
      setReport(result);
      toast.success('Relatório gerado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [profile, childId, childName, user, role]);

  return {
    report,
    generating,
    profileLoading,
    availableTypes,
    generate,
    hasProfile: !!profile,
  };
}
