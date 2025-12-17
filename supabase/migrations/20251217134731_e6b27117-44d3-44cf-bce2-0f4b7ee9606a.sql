-- Skills Inventory for PEI integration
CREATE TABLE IF NOT EXISTS public.skills_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  pei_plan_id UUID REFERENCES public.pei_plans(id) ON DELETE SET NULL,
  assessor_id UUID REFERENCES auth.users(id),
  school_year TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  
  -- Student identification
  grade TEXT,
  shift TEXT,
  diagnosis TEXT,
  teacher_name TEXT,
  caregiver_name TEXT,
  aee_teacher_name TEXT,
  
  -- Skills responses stored as JSONB
  -- Each category contains items with: response ('yes'|'no'|'partial'), observations
  identity_autonomy_literacy JSONB DEFAULT '[]',
  communication JSONB DEFAULT '[]',
  writing_motor_coordination JSONB DEFAULT '[]',
  math_concepts JSONB DEFAULT '[]',
  time_measurement JSONB DEFAULT '[]',
  size_concepts JSONB DEFAULT '[]',
  spatial_temporal_orientation JSONB DEFAULT '[]',
  object_localization JSONB DEFAULT '[]',
  senses JSONB DEFAULT '[]',
  arts_motor_coordination JSONB DEFAULT '[]',
  body_image JSONB DEFAULT '[]',
  motor_independence JSONB DEFAULT '[]',
  socialization JSONB DEFAULT '[]',
  
  -- Summary scores
  total_items INTEGER DEFAULT 0,
  yes_count INTEGER DEFAULT 0,
  no_count INTEGER DEFAULT 0,
  partial_count INTEGER DEFAULT 0,
  completion_percentage NUMERIC DEFAULT 0,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skills_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessments" ON public.skills_inventory
  FOR SELECT USING (
    assessor_id = auth.uid() OR
    public.has_child_access(auth.uid(), child_id) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create assessments for accessible children" ON public.skills_inventory
  FOR INSERT WITH CHECK (
    public.has_child_access(auth.uid(), child_id) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update their own assessments" ON public.skills_inventory
  FOR UPDATE USING (
    assessor_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Trigger for updated_at
CREATE TRIGGER update_skills_inventory_updated_at
  BEFORE UPDATE ON public.skills_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_skills_inventory_child ON public.skills_inventory(child_id);
CREATE INDEX idx_skills_inventory_pei ON public.skills_inventory(pei_plan_id);