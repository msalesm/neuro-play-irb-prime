-- Anamnese de Desenvolvimento Infantil Completa
CREATE TABLE IF NOT EXISTS public.child_development_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL,
  
  -- 1. Identificação
  identification JSONB DEFAULT '{}'::JSONB,
  -- { responsible_name, relationship, education, institution, anamnesis_date }
  
  -- 2. Gestação e pré-natal
  pregnancy_prenatal JSONB DEFAULT '{}'::JSONB,
  -- { planned, duration_weeks, prenatal_care, complications }
  
  -- 3. Parto e nascimento
  birth JSONB DEFAULT '{}'::JSONB,
  -- { type, full_term, weight, cried_at_birth, nicu, complications }
  
  -- 4. Desenvolvimento neuropsicomotor
  neuropsychomotor JSONB DEFAULT '{}'::JSONB,
  -- { motor_milestones, fine_motor, motor_observations }
  
  -- 5. Desenvolvimento da linguagem
  language_development JSONB DEFAULT '{}'::JSONB,
  -- { babbling, first_words, simple_sentences, current_communication, speech_therapy_history }
  
  -- 6. Desenvolvimento cognitivo
  cognitive_development JSONB DEFAULT '{}'::JSONB,
  -- { curiosity, attention, concept_recognition, learning_difficulties }
  
  -- 7. Desenvolvimento social e emocional
  social_emotional JSONB DEFAULT '{}'::JSONB,
  -- { social_interaction, symbolic_play, affectivity, observed_behaviors, frustration_reaction }
  
  -- 8. Autonomia e rotina
  autonomy_routine JSONB DEFAULT '{}'::JSONB,
  -- { feeding, sphincter_control, sleep }
  
  -- 9. Saúde geral
  general_health JSONB DEFAULT '{}'::JSONB,
  -- { previous_diseases, medications, medical_diagnoses, professional_followups }
  
  -- 10. Observações gerais
  general_observations TEXT,
  
  -- 11. Queixa principal
  main_complaint TEXT,
  
  -- Resumo gerado pelo sistema
  generated_summary JSONB,
  -- { summary, development_areas, attention_points, quick_synthesis }
  
  -- Status e auditoria
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  completed_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_child_dev_anamnesis_child ON public.child_development_anamnesis(child_id);
CREATE INDEX IF NOT EXISTS idx_child_dev_anamnesis_professional ON public.child_development_anamnesis(professional_id);
CREATE INDEX IF NOT EXISTS idx_child_dev_anamnesis_status ON public.child_development_anamnesis(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_child_dev_anamnesis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_child_dev_anamnesis_updated_at ON public.child_development_anamnesis;
CREATE TRIGGER trigger_child_dev_anamnesis_updated_at
  BEFORE UPDATE ON public.child_development_anamnesis
  FOR EACH ROW
  EXECUTE FUNCTION update_child_dev_anamnesis_updated_at();

-- RLS
ALTER TABLE public.child_development_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Profissionais podem criar anamnese"
  ON public.child_development_anamnesis
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profissionais podem ver anamneses de seus pacientes"
  ON public.child_development_anamnesis
  FOR SELECT
  USING (
    auth.uid() = professional_id
    OR EXISTS (
      SELECT 1 FROM public.child_access ca
      WHERE ca.child_id = child_development_anamnesis.child_id
        AND ca.professional_id = auth.uid()
        AND ca.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_development_anamnesis.child_id
        AND c.parent_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Profissionais podem atualizar suas anamneses"
  ON public.child_development_anamnesis
  FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profissionais podem deletar suas anamneses"
  ON public.child_development_anamnesis
  FOR DELETE
  USING (auth.uid() = professional_id);