
-- Tabela de presets de acessibilidade
CREATE TABLE public.accessibility_presets (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text,
  profile jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de perfis de acessibilidade por usuário
CREATE TABLE public.accessibility_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text,
  preset_id text REFERENCES public.accessibility_presets(id),
  profile jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Tabela de eventos de telemetria
CREATE TABLE public.telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  game_id text,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de histórias sociais
CREATE TABLE public.social_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de passos das histórias
CREATE TABLE public.story_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES public.social_stories(id) ON DELETE CASCADE,
  order_number integer NOT NULL,
  image_url text,
  title text NOT NULL,
  description text,
  audio_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accessibility_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accessibility_presets (public read)
CREATE POLICY "Anyone can view presets" ON public.accessibility_presets
  FOR SELECT USING (true);

-- RLS Policies for accessibility_profiles
CREATE POLICY "Users can view own profiles" ON public.accessibility_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON public.accessibility_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON public.accessibility_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for telemetry_events
CREATE POLICY "Users can insert own events" ON public.telemetry_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own events" ON public.telemetry_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all events" ON public.telemetry_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for social_stories (public read for active)
CREATE POLICY "Anyone can view active stories" ON public.social_stories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stories" ON public.social_stories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- RLS Policies for story_steps
CREATE POLICY "Anyone can view steps of active stories" ON public.story_steps
  FOR SELECT USING (
    story_id IN (SELECT id FROM social_stories WHERE is_active = true)
  );

CREATE POLICY "Admins can manage steps" ON public.story_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Insert default presets
INSERT INTO public.accessibility_presets (id, label, description, profile) VALUES
('DEFAULT', 'Padrão', 'Configurações padrão do sistema', '{
  "fontScale": 1.0,
  "highContrast": false,
  "reducedMotion": false,
  "uiDensity": "normal",
  "touchTargetSizePx": 44,
  "captions": {"enabled": false, "language": "pt-BR"},
  "hints": {"showInlineHints": true, "hintMode": "normal"}
}'::jsonb),
('TEA_LOW_SENSORY', 'TEA - Baixa Estimulação', 'Reduz estímulos sensoriais para crianças com TEA', '{
  "fontScale": 1.2,
  "highContrast": false,
  "reducedMotion": true,
  "uiDensity": "spacious",
  "touchTargetSizePx": 64,
  "captions": {"enabled": true, "language": "pt-BR"},
  "hints": {"showInlineHints": true, "hintMode": "simplified"}
}'::jsonb),
('TDAH_FOCUS', 'TDAH - Foco', 'Alto contraste e timers para ajudar no foco', '{
  "fontScale": 1.0,
  "highContrast": true,
  "reducedMotion": false,
  "uiDensity": "spacious",
  "touchTargetSizePx": 56,
  "captions": {"enabled": true, "language": "pt-BR"},
  "hints": {"showInlineHints": true, "hintMode": "timed"},
  "timers": {"show": true, "defaultMs": 60000}
}'::jsonb),
('LOW_VISION', 'Baixa Visão', 'Fonte grande e alto contraste para baixa visão', '{
  "fontScale": 1.5,
  "highContrast": true,
  "reducedMotion": true,
  "uiDensity": "spacious",
  "touchTargetSizePx": 72,
  "captions": {"enabled": true, "language": "pt-BR"},
  "hints": {"showInlineHints": false}
}'::jsonb),
('MOTOR_IMPAIRMENT', 'Dificuldade Motora', 'Alvos maiores e assistência para dificuldades motoras', '{
  "fontScale": 1.1,
  "highContrast": false,
  "reducedMotion": true,
  "uiDensity": "spacious",
  "touchTargetSizePx": 80,
  "inputMode": "assist_touch",
  "hints": {"showInlineHints": true}
}'::jsonb);

-- Insert sample social stories
INSERT INTO public.social_stories (id, title, description, is_active) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Como tomar banho', 'Passos simples para tomar banho de forma independente', true),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Como escovar os dentes', 'Aprenda a escovar os dentes corretamente', true),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Como arrumar a mochila', 'Organize sua mochila para a escola', true),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'Como lavar as mãos', 'Higiene das mãos passo a passo', true),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'Como pedir ajuda', 'Aprenda a pedir ajuda quando precisar', true);

-- Insert sample steps for "Como tomar banho"
INSERT INTO public.story_steps (story_id, order_number, title, description) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Preparar o banheiro', 'Separe sua toalha e roupas limpas'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Abrir a água', 'Teste a temperatura da água com a mão'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Molhar o corpo', 'Entre no chuveiro e molhe todo o corpo'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Usar sabonete', 'Passe sabonete em todo o corpo'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Enxaguar', 'Tire todo o sabonete do corpo'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Secar', 'Use a toalha para secar bem o corpo');

-- Insert sample steps for "Como escovar os dentes"
INSERT INTO public.story_steps (story_id, order_number, title, description) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 'Pegar a escova', 'Pegue sua escova de dentes'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 'Colocar pasta', 'Coloque um pouco de pasta de dente'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 3, 'Escovar os dentes da frente', 'Escove os dentes da frente com movimentos suaves'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 4, 'Escovar os dentes de trás', 'Escove os dentes de trás dos dois lados'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 5, 'Enxaguar a boca', 'Enxague a boca com água'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 6, 'Guardar a escova', 'Lave e guarde a escova no lugar');

-- Insert sample steps for "Como lavar as mãos"
INSERT INTO public.story_steps (story_id, order_number, title, description) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', 1, 'Abrir a torneira', 'Abra a torneira com água morna'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 2, 'Molhar as mãos', 'Molhe as duas mãos completamente'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 3, 'Usar sabonete', 'Coloque sabonete nas mãos'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 4, 'Esfregar bem', 'Esfregue as mãos por 20 segundos'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 5, 'Enxaguar', 'Enxague bem as mãos'),
('d4e5f6a7-b8c9-0123-defa-234567890123', 6, 'Secar', 'Seque as mãos com toalha limpa');
