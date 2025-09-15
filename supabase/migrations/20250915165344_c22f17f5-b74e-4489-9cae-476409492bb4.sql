-- Criar tabela para relacionar educadores e estudantes
CREATE TABLE public.educator_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  educator_id UUID NOT NULL,
  student_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(educator_id, student_id)
);

-- Enable RLS
ALTER TABLE public.educator_students ENABLE ROW LEVEL SECURITY;

-- Policies para educator_students
CREATE POLICY "Educators can manage their students" 
ON public.educator_students 
FOR ALL 
USING (auth.uid() = educator_id)
WITH CHECK (auth.uid() = educator_id);

CREATE POLICY "Students can view their educators" 
ON public.educator_students 
FOR SELECT 
USING (auth.uid() = student_id);

-- Adicionar campos extras para learning_sessions para coleta de dados mais rica
ALTER TABLE public.learning_sessions 
ADD COLUMN IF NOT EXISTS reaction_times JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS error_patterns JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS attention_metrics JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS stress_indicators JSONB DEFAULT '{}'::jsonb;

-- Criar tabela de notificações para admins/educadores
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policies para admin_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.admin_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar função para notificar educadores sobre progresso dos alunos
CREATE OR REPLACE FUNCTION public.notify_educators_about_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  educator_record RECORD;
  session_record RECORD;
BEGIN
  -- Buscar informações da sessão
  SELECT ls.*, lt.cognitive_category, up.name as student_name
  INTO session_record
  FROM learning_sessions ls
  JOIN learning_trails lt ON ls.trail_id = lt.id
  LEFT JOIN user_profiles up ON ls.user_id = up.id
  WHERE ls.id = NEW.id;

  -- Notificar educadores se houver padrões preocupantes
  IF (NEW.performance_data->>'accuracy')::numeric < 50 OR 
     array_length(NEW.struggles_detected, 1) > 3 THEN
    
    FOR educator_record IN 
      SELECT es.educator_id 
      FROM educator_students es 
      WHERE es.student_id = NEW.user_id
    LOOP
      INSERT INTO admin_notifications (user_id, type, title, message, data)
      VALUES (
        educator_record.educator_id,
        'student_needs_attention',
        'Estudante precisa de atenção',
        format('O estudante %s está com dificuldades em %s', 
               COALESCE(session_record.student_name, 'Sem nome'), 
               session_record.cognitive_category),
        jsonb_build_object(
          'student_id', NEW.user_id,
          'session_id', NEW.id,
          'accuracy', NEW.performance_data->>'accuracy',
          'struggles', NEW.struggles_detected
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para notificações automáticas
CREATE TRIGGER notify_educators_on_session_complete
  AFTER INSERT ON public.learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_educators_about_student_progress();

-- Criar função para obter estatísticas de estudantes para educadores
CREATE OR REPLACE FUNCTION public.get_educator_students_stats(educator_uuid UUID)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  total_sessions INTEGER,
  avg_accuracy NUMERIC,
  total_xp INTEGER,
  last_session_date TIMESTAMP WITH TIME ZONE,
  needs_attention BOOLEAN,
  progress_trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.student_id,
    COALESCE(up.name, 'Sem nome') as student_name,
    COUNT(ls.id)::INTEGER as total_sessions,
    ROUND(AVG((ls.performance_data->>'accuracy')::numeric), 2) as avg_accuracy,
    SUM(lt.total_xp)::INTEGER as total_xp,
    MAX(ls.created_at) as last_session_date,
    (AVG((ls.performance_data->>'accuracy')::numeric) < 60 OR 
     COUNT(CASE WHEN array_length(ls.struggles_detected, 1) > 2 THEN 1 END) > 2
    ) as needs_attention,
    CASE 
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 80 THEN 'excellent'
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 70 THEN 'good'
      WHEN AVG((ls.performance_data->>'accuracy')::numeric) >= 60 THEN 'average'
      ELSE 'needs_improvement'
    END as progress_trend
  FROM educator_students es
  LEFT JOIN user_profiles up ON es.student_id = up.id
  LEFT JOIN learning_sessions ls ON es.student_id = ls.user_id
  LEFT JOIN learning_trails lt ON es.student_id = lt.user_id
  WHERE es.educator_id = educator_uuid
  GROUP BY es.student_id, up.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;