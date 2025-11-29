-- Adicionar conquistas relacionadas aos tours da plataforma
INSERT INTO public.achievements (key, name, description, category, icon, required_value, rarity) VALUES
  ('tour_first', 'Explorador Iniciante', 'Complete seu primeiro tour da plataforma', 'exploration', '🎯', 1, 'common'),
  ('tour_dashboard', 'Mestre do Dashboard', 'Complete o tour do Dashboard dos Pais', 'exploration', '🏠', 1, 'common'),
  ('tour_chat', 'Comunicador', 'Complete o tour do Chat Terapêutico', 'exploration', '💬', 1, 'common'),
  ('tour_planets', 'Navegador Espacial', 'Complete o tour do Sistema Planeta Azul', 'exploration', '🌌', 1, 'rare'),
  ('tour_games', 'Jogador Informado', 'Complete o tour dos Jogos Cognitivos', 'exploration', '🎮', 1, 'common'),
  ('tour_avatar', 'Estilista Digital', 'Complete o tour da Evolução do Avatar', 'exploration', '⭐', 1, 'rare'),
  ('tour_therapist', 'Profissional Capacitado', 'Complete o tour do Dashboard do Terapeuta', 'exploration', '👨‍⚕️', 1, 'rare'),
  ('tour_master', 'Mestre Explorador', 'Complete todos os tours disponíveis na plataforma', 'exploration', '🏆', 7, 'legendary')
ON CONFLICT (key) DO NOTHING;

-- Criar tabela para rastrear progresso dos tours
CREATE TABLE IF NOT EXISTS public.tour_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tour_name)
);

-- Habilitar RLS
ALTER TABLE public.tour_completions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own tour completions"
  ON public.tour_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tour completions"
  ON public.tour_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tour_completions_user_id ON public.tour_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_completions_tour_name ON public.tour_completions(tour_name);

-- Função para verificar e conceder conquistas de tours
CREATE OR REPLACE FUNCTION public.check_tour_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_tours INTEGER;
  tour_map RECORD;
BEGIN
  -- Mapeamento de tours para conquistas
  FOR tour_map IN 
    SELECT * FROM (VALUES
      ('dashboard-pais', 'tour_dashboard'),
      ('therapeutic-chat', 'tour_chat'),
      ('sistema-planeta-azul', 'tour_planets'),
      ('games', 'tour_games'),
      ('avatar-evolution', 'tour_avatar'),
      ('therapist-dashboard', 'tour_therapist')
    ) AS t(tour, achievement)
  LOOP
    IF NEW.tour_name = tour_map.tour THEN
      -- Conceder conquista específica do tour
      INSERT INTO public.user_achievements (user_id, achievement_key, progress, completed, unlocked_at)
      VALUES (NEW.user_id, tour_map.achievement, 1, true, NOW())
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;
  END LOOP;

  -- Primeira conquista de tour
  SELECT COUNT(*) INTO total_tours
  FROM public.tour_completions
  WHERE user_id = NEW.user_id;

  IF total_tours = 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_key, progress, completed, unlocked_at)
    VALUES (NEW.user_id, 'tour_first', 1, true, NOW())
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END IF;

  -- Mestre Explorador - todos os tours
  IF total_tours >= 7 THEN
    INSERT INTO public.user_achievements (user_id, achievement_key, progress, completed, unlocked_at)
    VALUES (NEW.user_id, 'tour_master', 7, true, NOW())
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para verificar conquistas quando um tour é completado
DROP TRIGGER IF EXISTS trigger_check_tour_achievements ON public.tour_completions;
CREATE TRIGGER trigger_check_tour_achievements
  AFTER INSERT ON public.tour_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tour_achievements();