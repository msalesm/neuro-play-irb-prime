-- 1. Create function to get all children for a user (parent or professional)
CREATE OR REPLACE FUNCTION public.get_user_children(_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  birth_date date,
  parent_id uuid,
  neurodevelopmental_conditions jsonb,
  avatar_url text,
  is_active boolean,
  source_table text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Children from child_profiles (parent's children)
  SELECT 
    cp.id,
    cp.name,
    cp.date_of_birth as birth_date,
    cp.parent_user_id as parent_id,
    array_to_json(cp.diagnosed_conditions)::jsonb as neurodevelopmental_conditions,
    NULL::text as avatar_url,
    true as is_active,
    'child_profiles'::text as source_table
  FROM child_profiles cp
  WHERE cp.parent_user_id = _user_id
  
  UNION ALL
  
  -- Children from children table (parent's children)
  SELECT 
    c.id,
    c.name,
    c.birth_date,
    c.parent_id,
    c.neurodevelopmental_conditions,
    c.avatar_url,
    c.is_active,
    'children'::text as source_table
  FROM children c
  WHERE c.parent_id = _user_id AND c.is_active = true
  
  UNION ALL
  
  -- Children with professional access
  SELECT 
    c.id,
    c.name,
    c.birth_date,
    c.parent_id,
    c.neurodevelopmental_conditions,
    c.avatar_url,
    c.is_active,
    'children'::text as source_table
  FROM children c
  INNER JOIN child_access ca ON ca.child_id = c.id
  WHERE ca.professional_id = _user_id 
    AND ca.is_active = true
    AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
$$;

-- 2. Add new accessibility presets for Sprint 8 (Advanced Accessibility)
INSERT INTO accessibility_presets (id, label, description, profile) VALUES
('DYSLEXIA_FRIENDLY', 'Amigável à Dislexia', 'Fonte maior, espaçamento amplo, cores de baixo contraste para leitura facilitada', 
'{"fontScale": 1.3, "highContrast": false, "reducedMotion": true, "uiDensity": "spacious", "touchTargetSizePx": 56, "captions": {"enabled": true, "language": "pt-BR"}, "hints": {"showInlineHints": true, "hintMode": "simplified"}, "readingMode": true, "lineSpacing": 1.8, "letterSpacing": 0.12}'::jsonb),

('SENSORY_LOW_STIM', 'Baixa Estimulação Sensorial', 'Cores neutras, sem animações, áudio suave para hipersensibilidade sensorial',
'{"fontScale": 1.1, "highContrast": false, "reducedMotion": true, "uiDensity": "spacious", "touchTargetSizePx": 60, "captions": {"enabled": true, "language": "pt-BR"}, "hints": {"showInlineHints": true, "hintMode": "simplified"}, "lowStimulation": true, "mutedColors": true, "noSounds": false, "softSounds": true}'::jsonb),

('COLOR_BLIND_DEUTAN', 'Daltonismo Deuteranopia', 'Paleta de cores otimizada para deuteranopia (vermelho-verde)',
'{"fontScale": 1.0, "highContrast": true, "reducedMotion": false, "uiDensity": "normal", "touchTargetSizePx": 48, "captions": {"enabled": false, "language": "pt-BR"}, "hints": {"showInlineHints": true, "hintMode": "normal"}, "colorBlindMode": "deuteranopia"}'::jsonb),

('COLOR_BLIND_PROTAN', 'Daltonismo Protanopia', 'Paleta de cores otimizada para protanopia',
'{"fontScale": 1.0, "highContrast": true, "reducedMotion": false, "uiDensity": "normal", "touchTargetSizePx": 48, "captions": {"enabled": false, "language": "pt-BR"}, "hints": {"showInlineHints": true, "hintMode": "normal"}, "colorBlindMode": "protanopia"}'::jsonb),

('FOCUS_MAXIMIZED', 'Foco Maximizado', 'Remove distrações, interface minimalista para TDAH com dificuldade de concentração',
'{"fontScale": 1.0, "highContrast": false, "reducedMotion": true, "uiDensity": "spacious", "touchTargetSizePx": 52, "captions": {"enabled": false, "language": "pt-BR"}, "hints": {"showInlineHints": false, "hintMode": "timed"}, "focusMode": true, "hideDecorations": true, "timedReminders": true}'::jsonb),

('COGNITIVE_SUPPORT', 'Suporte Cognitivo', 'Interface simplificada com dicas visuais extras e tempo estendido',
'{"fontScale": 1.2, "highContrast": true, "reducedMotion": true, "uiDensity": "spacious", "touchTargetSizePx": 64, "captions": {"enabled": true, "language": "pt-BR"}, "hints": {"showInlineHints": true, "hintMode": "simplified"}, "extendedTime": true, "visualCues": true, "simplifiedLanguage": true}'::jsonb)

ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  profile = EXCLUDED.profile,
  updated_at = NOW();