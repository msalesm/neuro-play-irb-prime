-- Trigger para atualizar gamificação quando sessões terapêuticas são criadas
CREATE OR REPLACE FUNCTION public.update_gamification_on_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_data RECORD;
  stars_earned INTEGER := 5; -- Base stars per completed session
  experience_earned INTEGER;
BEGIN
  -- Only process completed sessions
  IF NEW.completion_status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Calculate experience and stars based on session type and duration
  experience_earned := stars_earned * 10;
  
  -- Bonus stars for longer sessions
  IF NEW.duration_minutes >= 10 THEN
    stars_earned := stars_earned + 2;
    experience_earned := experience_earned + 20;
  END IF;

  -- Insert or update user gamification
  INSERT INTO public.user_gamification (
    user_id, 
    total_stars, 
    experience_points, 
    level,
    last_activity_date,
    current_streak,
    longest_streak
  ) VALUES (
    NEW.user_id,
    stars_earned,
    experience_earned,
    1,
    CURRENT_DATE,
    1,
    1
  ) ON CONFLICT (user_id) DO UPDATE SET
    total_stars = user_gamification.total_stars + stars_earned,
    experience_points = user_gamification.experience_points + experience_earned,
    level = GREATEST(1, (user_gamification.experience_points + experience_earned) / 100 + 1),
    last_activity_date = CURRENT_DATE,
    current_streak = CASE 
      WHEN user_gamification.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
        THEN user_gamification.current_streak + 1
      WHEN user_gamification.last_activity_date = CURRENT_DATE 
        THEN user_gamification.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_gamification.longest_streak, 
      CASE 
        WHEN user_gamification.last_activity_date = CURRENT_DATE - INTERVAL '1 day' 
          THEN user_gamification.current_streak + 1
        WHEN user_gamification.last_activity_date = CURRENT_DATE 
          THEN user_gamification.current_streak
        ELSE 1
      END
    ),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create trigger for therapy sessions
DROP TRIGGER IF EXISTS on_therapy_session_completed ON public.therapy_sessions;
CREATE TRIGGER on_therapy_session_completed
  AFTER INSERT OR UPDATE ON public.therapy_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_gamification_on_session();

-- Create some initial achievements for the games
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, stars_reward) VALUES
('Primeira Respiração', 'Complete sua primeira sessão de respiração', '🌱', 'breathing_sessions', 1, 5),
('Mestre da Respiração', 'Complete 10 sessões de respiração', '🧘', 'breathing_sessions', 10, 20),
('Plantador Iniciante', 'Plante sua primeira árvore no Focus Forest', '🌱', 'focus_trees', 1, 5),
('Guardião da Floresta', 'Plante 50 árvores no Focus Forest', '🌲', 'focus_trees', 50, 25),
('Foco Diamante', 'Alcance 90% de precisão no Focus Forest', '💎', 'focus_accuracy', 90, 30),
('Sequência de Ouro', 'Mantenha uma sequência de 7 dias', '🔥', 'daily_streak', 7, 15),
('Explorador de Jogos', 'Jogue todos os jogos disponíveis', '🎮', 'games_played', 2, 10)
ON CONFLICT (name) DO NOTHING;