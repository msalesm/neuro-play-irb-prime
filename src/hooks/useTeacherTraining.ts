import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TrainingModule {
  id: string;
  userId: string;
  moduleName: string;
  status: 'em_andamento' | 'concluido';
  score: number;
  certificateUrl: string | null;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  topics: string[];
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function useTeacherTraining() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrainings();
    }
  }, [user]);

  const fetchTrainings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parent_training')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      const formattedTrainings: TrainingModule[] = (data || []).map((training) => ({
        id: training.id,
        userId: training.user_id,
        moduleName: training.module_name,
        status: training.status as 'em_andamento' | 'concluido',
        score: training.score,
        certificateUrl: training.certificate_url,
        startedAt: training.started_at,
        completedAt: training.completed_at,
        updatedAt: training.updated_at,
      }));

      setTrainings(formattedTrainings);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      toast.error('Erro ao carregar capacitações');
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async (moduleName: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      // Check if already started
      const existing = trainings.find(
        (t) => t.moduleName === moduleName && t.status === 'em_andamento'
      );
      if (existing) {
        return existing.id;
      }

      const { data, error } = await supabase
        .from('parent_training')
        .insert({
          user_id: user.id,
          module_name: moduleName,
          status: 'em_andamento',
          score: 0,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTrainings();
      return data.id;
    } catch (error) {
      console.error('Error starting training:', error);
      toast.error('Erro ao iniciar capacitação');
      return null;
    }
  };

  const completeTraining = async (trainingId: string, score: number) => {
    if (!user) return false;

    setLoading(true);
    try {
      const certificateUrl = await generateCertificate(trainingId, score);

      const { error } = await supabase
        .from('parent_training')
        .update({
          status: 'concluido',
          score,
          certificate_url: certificateUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', trainingId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTrainings();
      toast.success('Capacitação concluída! Certificado gerado.');
      return true;
    } catch (error) {
      console.error('Error completing training:', error);
      toast.error('Erro ao concluir capacitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (trainingId: string, score: number): Promise<string> => {
    // In production, this would call an edge function to generate a PDF certificate
    // For now, we'll return a placeholder URL
    return `https://certificates.neuroplay.edu/certificate-${trainingId}.pdf`;
  };

  const getTrainingByModule = (moduleName: string): TrainingModule | undefined => {
    return trainings.find((t) => t.moduleName === moduleName);
  };

  const getCompletedModules = (): TrainingModule[] => {
    return trainings.filter((t) => t.status === 'concluido');
  };

  const getTotalScore = (): number => {
    const completedTrainings = getCompletedModules();
    if (completedTrainings.length === 0) return 0;
    return Math.round(
      completedTrainings.reduce((sum, t) => sum + t.score, 0) / completedTrainings.length
    );
  };

  return {
    trainings,
    loading,
    startTraining,
    completeTraining,
    getTrainingByModule,
    getCompletedModules,
    getTotalScore,
    fetchTrainings,
  };
}
