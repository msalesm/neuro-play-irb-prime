import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GamePerformanceData, BehavioralProfile } from '@/types/cognitive-analysis';
import { generateBehavioralProfile } from '@/services/cognitive-engine';

export function useCognitiveAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<BehavioralProfile | null>(null);

  const generateReport = async (
    performanceData: GamePerformanceData[],
    userAge?: number,
    ageGroup?: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      console.log('Generating behavioral profile...', { 
        gamesCount: performanceData.length,
        userAge,
        ageGroup 
      });

      // Determine age group from age if not provided
      let resolvedAgeGroup = ageGroup || '7-9';
      if (!ageGroup && userAge) {
        if (userAge <= 6) resolvedAgeGroup = '4-6';
        else if (userAge <= 9) resolvedAgeGroup = '7-9';
        else if (userAge <= 12) resolvedAgeGroup = '10-12';
        else if (userAge <= 15) resolvedAgeGroup = '13-15';
        else resolvedAgeGroup = '16+';
      }

      // Use deterministic engine - NO AI dependency for score calculation
      const profile = generateBehavioralProfile(
        'current-user',
        performanceData,
        resolvedAgeGroup
      );

      console.log('Behavioral profile generated successfully');
      setReport(profile);
      
      toast.success('Perfil comportamental gerado com sucesso!');
      return profile;

    } catch (error) {
      console.error('Error generating behavioral profile:', error);
      toast.error('Erro ao gerar perfil comportamental');
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
