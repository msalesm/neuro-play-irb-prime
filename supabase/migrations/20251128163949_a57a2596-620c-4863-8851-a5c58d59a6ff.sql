-- Tabela para armazenar conversas terapêuticas
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  context_type TEXT NOT NULL DEFAULT 'general', -- general, emotional_checkin, coaching, progress_review
  behavioral_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- tags para categorizar conversas
  sentiment_score NUMERIC, -- -1 to 1, updated after analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para armazenar mensagens individuais
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB, -- pode incluir: emotion_detected, topics, suggestions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para insights comportamentais detectados pela IA
CREATE TABLE IF NOT EXISTS public.behavioral_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- pattern, concern, progress, recommendation
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  supporting_data JSONB DEFAULT '{}'::JSONB, -- conversation_ids, metrics, timestamps
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'addressed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para check-ins emocionais programados
CREATE TABLE IF NOT EXISTS public.emotional_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  emotions_detected TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for behavioral_insights
CREATE POLICY "Users can view own insights"
  ON public.behavioral_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create insights"
  ON public.behavioral_insights FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own insights"
  ON public.behavioral_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for emotional_checkins
CREATE POLICY "Users can view own checkins"
  ON public.emotional_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON public.emotional_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON public.emotional_checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_child_profile_id ON public.chat_conversations(child_profile_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_behavioral_insights_user_id ON public.behavioral_insights(user_id);
CREATE INDEX idx_behavioral_insights_status ON public.behavioral_insights(status);
CREATE INDEX idx_emotional_checkins_user_id ON public.emotional_checkins(user_id);
CREATE INDEX idx_emotional_checkins_scheduled_for ON public.emotional_checkins(scheduled_for);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_behavioral_insights_updated_at
  BEFORE UPDATE ON public.behavioral_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_updated_at();