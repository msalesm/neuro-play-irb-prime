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
  videoUrl?: string;
  videoTitle?: string;
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
        .from('teacher_training' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      const formattedTrainings: TrainingModule[] = (data || []).map((training: any) => ({
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
      const existing = trainings.find(
        (t) => t.moduleName === moduleName && t.status === 'em_andamento'
      );
      if (existing) return existing.id;

      const { data, error } = await supabase
        .from('teacher_training' as any)
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
      return (data as any).id;
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
        .from('teacher_training' as any)
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
      if (certificateUrl) {
        toast.success('Capacitação concluída! Certificado gerado.');
      } else {
        toast.success('Capacitação concluída! Certificado em processamento.');
      }
      return true;
    } catch (error) {
      console.error('Error completing training:', error);
      toast.error('Erro ao concluir capacitação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (trainingId: string, score: number): Promise<string | null> => {
    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user!.id)
        .single();

      const training = trainings.find(t => t.id === trainingId);
      const teacherName = profile?.full_name || user!.email || 'Professor(a)';
      const moduleName = training?.moduleName || 'Módulo';
      const completionDate = new Date().toLocaleDateString('pt-BR');

      const certificateHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Certificado - ${moduleName}</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 40px; background: #f8f6f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .certificate { background: white; border: 3px solid #1a365d; padding: 60px; max-width: 800px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .certificate h1 { color: #1a365d; font-size: 28px; margin-bottom: 10px; }
  .certificate h2 { color: #2d3748; font-size: 20px; font-weight: normal; margin-bottom: 30px; }
  .name { font-size: 32px; color: #1a365d; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 20px 0; }
  .module { font-size: 18px; color: #4a5568; margin: 15px 0; }
  .score { font-size: 16px; color: #2d3748; margin: 10px 0; }
  .date { font-size: 14px; color: #718096; margin-top: 30px; }
  .id { font-size: 10px; color: #a0aec0; margin-top: 20px; }
</style></head>
<body>
  <div class="certificate">
    <h1>🏆 Certificado de Conclusão</h1>
    <h2>NeuroPLAY — Capacitação Docente</h2>
    <p>Certificamos que</p>
    <p class="name">${teacherName}</p>
    <p class="module">concluiu com êxito o módulo</p>
    <p class="name" style="font-size: 24px;">${moduleName}</p>
    <p class="score">Pontuação: ${score}%</p>
    <p class="date">${completionDate}</p>
    <p class="id">ID: ${trainingId}</p>
  </div>
</body></html>`;

      const blob = new Blob([certificateHtml], { type: 'text/html' });
      const fileName = `certificate-${trainingId}.html`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, blob, { contentType: 'text/html', upsert: true });

      if (uploadError) {
        console.error('Error uploading certificate:', uploadError);
        return null;
      }

      const { data: publicUrl } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error generating certificate:', error);
      return null;
    }
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
