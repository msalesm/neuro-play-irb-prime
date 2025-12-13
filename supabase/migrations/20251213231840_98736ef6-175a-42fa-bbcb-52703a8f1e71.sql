-- ================================================
-- TELECONSULTA COMO MÓDULO CENTRAL - REESTRUTURAÇÃO
-- ================================================

-- Adicionar campos estruturados para anotações clínicas durante consulta
ALTER TABLE public.teleorientation_sessions 
ADD COLUMN IF NOT EXISTS clinical_summary TEXT,
ADD COLUMN IF NOT EXISTS follow_up_plan TEXT,
ADD COLUMN IF NOT EXISTS report_generated_id UUID REFERENCES public.clinical_reports(id);

-- Criar tabela para anotações estruturadas por bloco durante teleconsulta
CREATE TABLE IF NOT EXISTS public.teleconsult_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.teleorientation_sessions(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID NOT NULL,
  
  -- Bloco A: Cognitivo
  cognitive_attention TEXT,
  cognitive_memory TEXT,
  cognitive_processing TEXT,
  cognitive_score INTEGER CHECK (cognitive_score >= 0 AND cognitive_score <= 100),
  
  -- Bloco B: Comportamental
  behavioral_impulsivity TEXT,
  behavioral_organization TEXT,
  behavioral_planning TEXT,
  behavioral_score INTEGER CHECK (behavioral_score >= 0 AND behavioral_score <= 100),
  
  -- Bloco C: Socioemocional
  socioemotional_anxiety TEXT,
  socioemotional_regulation TEXT,
  socioemotional_interaction TEXT,
  socioemotional_score INTEGER CHECK (socioemotional_score >= 0 AND socioemotional_score <= 100),
  
  -- Traços observados com escala rápida (1-5)
  observed_traits JSONB DEFAULT '[]',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para avaliações condensadas em 3 blocos
CREATE TABLE IF NOT EXISTS public.condensed_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  professional_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Bloco A: Cognitivo
  cognitive_attention_score INTEGER CHECK (cognitive_attention_score >= 0 AND cognitive_attention_score <= 100),
  cognitive_memory_score INTEGER CHECK (cognitive_memory_score >= 0 AND cognitive_memory_score <= 100),
  cognitive_processing_score INTEGER CHECK (cognitive_processing_score >= 0 AND cognitive_processing_score <= 100),
  cognitive_overall_score INTEGER CHECK (cognitive_overall_score >= 0 AND cognitive_overall_score <= 100),
  cognitive_percentile INTEGER CHECK (cognitive_percentile >= 0 AND cognitive_percentile <= 100),
  cognitive_risk TEXT CHECK (cognitive_risk IN ('low', 'medium', 'high')),
  cognitive_trend TEXT CHECK (cognitive_trend IN ('improving', 'stable', 'declining')),
  
  -- Bloco B: Comportamental
  behavioral_impulsivity_score INTEGER CHECK (behavioral_impulsivity_score >= 0 AND behavioral_impulsivity_score <= 100),
  behavioral_organization_score INTEGER CHECK (behavioral_organization_score >= 0 AND behavioral_organization_score <= 100),
  behavioral_planning_score INTEGER CHECK (behavioral_planning_score >= 0 AND behavioral_planning_score <= 100),
  behavioral_overall_score INTEGER CHECK (behavioral_overall_score >= 0 AND behavioral_overall_score <= 100),
  behavioral_percentile INTEGER CHECK (behavioral_percentile >= 0 AND behavioral_percentile <= 100),
  behavioral_risk TEXT CHECK (behavioral_risk IN ('low', 'medium', 'high')),
  behavioral_trend TEXT CHECK (behavioral_trend IN ('improving', 'stable', 'declining')),
  
  -- Bloco C: Socioemocional
  socioemotional_anxiety_score INTEGER CHECK (socioemotional_anxiety_score >= 0 AND socioemotional_anxiety_score <= 100),
  socioemotional_regulation_score INTEGER CHECK (socioemotional_regulation_score >= 0 AND socioemotional_regulation_score <= 100),
  socioemotional_interaction_score INTEGER CHECK (socioemotional_interaction_score >= 0 AND socioemotional_interaction_score <= 100),
  socioemotional_overall_score INTEGER CHECK (socioemotional_overall_score >= 0 AND socioemotional_overall_score <= 100),
  socioemotional_percentile INTEGER CHECK (socioemotional_percentile >= 0 AND socioemotional_percentile <= 100),
  socioemotional_risk TEXT CHECK (socioemotional_risk IN ('low', 'medium', 'high')),
  socioemotional_trend TEXT CHECK (socioemotional_trend IN ('improving', 'stable', 'declining')),
  
  -- Metadados
  source_type TEXT DEFAULT 'manual', -- 'manual', 'teleconsult', 'game_derived'
  source_session_id UUID REFERENCES public.teleorientation_sessions(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para planos de acompanhamento
CREATE TABLE IF NOT EXISTS public.follow_up_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id) NOT NULL,
  professional_id UUID NOT NULL,
  session_id UUID REFERENCES public.teleorientation_sessions(id),
  
  objectives JSONB DEFAULT '[]',
  interventions JSONB DEFAULT '[]',
  frequency TEXT,
  next_review_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teleconsult_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condensed_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teleconsult_observations
CREATE POLICY "Professionals can manage their observations"
ON public.teleconsult_observations
FOR ALL
USING (professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for condensed_assessments
CREATE POLICY "Professionals can manage assessments for their patients"
ON public.condensed_assessments
FOR ALL
USING (
  professional_id = auth.uid() OR 
  public.has_child_access(auth.uid(), child_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for follow_up_plans
CREATE POLICY "Professionals can manage follow-up plans for their patients"
ON public.follow_up_plans
FOR ALL
USING (
  professional_id = auth.uid() OR 
  public.has_child_access(auth.uid(), child_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_teleconsult_obs_session ON public.teleconsult_observations(session_id);
CREATE INDEX IF NOT EXISTS idx_condensed_assess_child ON public.condensed_assessments(child_id);
CREATE INDEX IF NOT EXISTS idx_condensed_assess_date ON public.condensed_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_follow_up_child ON public.follow_up_plans(child_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_status ON public.follow_up_plans(status);

-- Trigger para updated_at
CREATE TRIGGER update_teleconsult_observations_updated_at
  BEFORE UPDATE ON public.teleconsult_observations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_condensed_assessments_updated_at
  BEFORE UPDATE ON public.condensed_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_up_plans_updated_at
  BEFORE UPDATE ON public.follow_up_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();