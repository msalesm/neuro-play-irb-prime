-- Register Tower Defense game in cognitive_games table
INSERT INTO cognitive_games (
  game_id,
  name,
  description,
  cognitive_domains,
  target_conditions,
  difficulty_levels,
  age_min,
  age_max,
  avg_duration_minutes,
  active
) VALUES (
  'tower-defense',
  'Torre de Defesa',
  'Defenda sua base estrategicamente! Posicione torres para eliminar ondas de invasores. Desenvolve planejamento estratégico, atenção sustentada e tomada de decisão rápida.',
  ARRAY['Atenção Sustentada', 'Planejamento Estratégico', 'Tomada de Decisão', 'Controle de Impulso'],
  ARRAY['TDAH', 'TEA'],
  5,
  7,
  18,
  10,
  true
) ON CONFLICT (game_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cognitive_domains = EXCLUDED.cognitive_domains,
  target_conditions = EXCLUDED.target_conditions,
  updated_at = now();