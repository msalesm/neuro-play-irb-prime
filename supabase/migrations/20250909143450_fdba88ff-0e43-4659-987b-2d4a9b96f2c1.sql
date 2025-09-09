-- Remove duplicate entries using row_number
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.user_gamification
)
DELETE FROM public.user_gamification
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.user_gamification 
ADD CONSTRAINT user_gamification_user_id_unique UNIQUE (user_id);

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