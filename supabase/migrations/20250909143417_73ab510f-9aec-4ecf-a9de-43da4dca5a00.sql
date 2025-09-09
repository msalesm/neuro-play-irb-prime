-- Remove duplicate entries in user_gamification table
DELETE FROM public.user_gamification
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.user_gamification
  GROUP BY user_id
);

-- Now add the unique constraint
ALTER TABLE public.user_gamification 
ADD CONSTRAINT user_gamification_user_id_unique UNIQUE (user_id);

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