-- Register all missing games in cognitive_games table

-- Diagnostic tests
INSERT INTO public.cognitive_games (game_id, name, description, cognitive_domains, target_conditions, difficulty_levels, age_min, age_max, avg_duration_minutes, active)
VALUES 
  ('theory-of-mind', 'Teoria da Mente', 'Teste de compreensão de pensamentos e sentimentos dos outros baseado no Teste de Sally-Anne.', ARRAY['Social Cognition', 'Perspective Taking', 'Empathy'], ARRAY['TEA', 'Autism'], 5, 4, 16, 15, true),
  ('attention-sustained-phases', 'Atenção Sustentada', 'Teste de capacidade de manter atenção focada baseado no CPT.', ARRAY['Sustained Attention', 'Reaction Time', 'Inhibitory Control'], ARRAY['ADHD', 'TDAH'], 6, 6, 18, 10, true),
  ('cognitive-flexibility-phases', 'Flexibilidade Cognitiva', 'Teste de adaptação e flexibilidade cognitiva baseado no Wisconsin Card Sorting.', ARRAY['Cognitive Flexibility', 'Executive Function', 'Adaptability'], ARRAY['TEA', 'Autism', 'ADHD'], 5, 8, 18, 12, true),
  ('phonological-processing', 'Processamento Fonológico', 'Teste de consciência fonológica e processamento de sons da fala.', ARRAY['Phonological Awareness', 'Language Processing', 'Auditory Processing'], ARRAY['Dyslexia', 'Dislexia'], 5, 5, 16, 8, true),
  ('executive-processing-phases', 'Processamento Executivo', 'Teste de planejamento e organização baseado na Torre de Londres.', ARRAY['Planning', 'Organization', 'Executive Function'], ARRAY['ADHD', 'TEA'], 5, 8, 18, 15, true),

  -- Therapeutic games
  ('caca-foco', 'Caça Foco', 'Jogo de atenção seletiva onde o jogador deve encontrar alvos específicos.', ARRAY['Selective Attention', 'Visual Search', 'Processing Speed'], ARRAY['ADHD', 'General'], 5, 5, 14, 8, true),
  ('emotion-lab', 'Laboratório das Emoções', 'Jogo de reconhecimento e compreensão de emoções faciais.', ARRAY['Emotion Recognition', 'Social Cognition', 'Empathy'], ARRAY['TEA', 'Autism', 'General'], 5, 4, 16, 10, true),
  ('focus-forest', 'Floresta do Foco', 'Jogo de atenção sustentada em ambiente de floresta.', ARRAY['Sustained Attention', 'Focus', 'Concentration'], ARRAY['ADHD', 'General'], 6, 5, 16, 10, true),
  ('logica-rapida', 'Lógica Rápida', 'Jogo de raciocínio lógico e reconhecimento de padrões.', ARRAY['Logical Reasoning', 'Pattern Recognition', 'Problem Solving'], ARRAY['General', 'ADHD'], 5, 6, 18, 10, true),
  ('memoria-colorida', 'Memória Colorida', 'Jogo de memória visual com cores e padrões.', ARRAY['Visual Memory', 'Working Memory', 'Color Recognition'], ARRAY['ADHD', 'General'], 5, 4, 14, 8, true),
  ('mindful-breath', 'Respiração Consciente', 'Exercício de respiração guiada para regulação emocional.', ARRAY['Emotional Regulation', 'Self-Control', 'Relaxation'], ARRAY['TEA', 'ADHD', 'Anxiety'], 3, 4, 18, 5, true),
  ('silaba-magica', 'Sílaba Mágica', 'Jogo de consciência silábica e formação de palavras.', ARRAY['Phonological Awareness', 'Reading', 'Language'], ARRAY['Dyslexia', 'Dislexia'], 5, 5, 12, 10, true),
  ('social-scenarios', 'Cenários Sociais', 'Jogo de compreensão e resposta a situações sociais.', ARRAY['Social Skills', 'Social Cognition', 'Perspective Taking'], ARRAY['TEA', 'Autism'], 5, 5, 16, 12, true)
ON CONFLICT (game_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cognitive_domains = EXCLUDED.cognitive_domains,
  target_conditions = EXCLUDED.target_conditions,
  active = true;