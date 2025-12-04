-- Register memory-workload game in cognitive_games table
INSERT INTO public.cognitive_games (game_id, name, description, cognitive_domains, target_conditions, difficulty_levels, age_min, age_max, avg_duration_minutes, active)
VALUES (
  'memory-workload',
  'Memória de Trabalho',
  'Teste de memória de trabalho visual-espacial. O jogador deve memorizar e reproduzir sequências de cores em uma grade.',
  ARRAY['Working Memory', 'Visual-Spatial Processing', 'Attention'],
  ARRAY['ADHD', 'General'],
  5,
  6,
  18,
  10,
  true
)
ON CONFLICT (game_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cognitive_domains = EXCLUDED.cognitive_domains,
  target_conditions = EXCLUDED.target_conditions,
  active = true;