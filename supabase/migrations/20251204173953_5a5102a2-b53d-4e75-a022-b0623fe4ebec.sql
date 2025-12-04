-- Adicionar campos faltantes à tabela children
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'parent',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar campos à tabela child_access
ALTER TABLE public.child_access
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar tabela teacher_student dedicada (expandindo class_students)
ALTER TABLE public.class_students
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id);

-- Atualizar teacher_id em class_students baseado na turma
UPDATE public.class_students cs
SET teacher_id = sc.teacher_id
FROM public.school_classes sc
WHERE cs.class_id = sc.id AND cs.teacher_id IS NULL;

-- Criar view unificada para relacionamentos pai-filho
CREATE OR REPLACE VIEW public.parent_child_relationships AS
SELECT 
  c.id,
  c.parent_id,
  c.id as child_id,
  c.name as child_name,
  c.birth_date,
  c.relationship_type,
  c.is_active,
  p.full_name as parent_name,
  p.email as parent_email
FROM public.children c
LEFT JOIN public.profiles p ON c.parent_id = p.id
WHERE c.is_active = true;

-- Criar view unificada para relacionamentos terapeuta-paciente
CREATE OR REPLACE VIEW public.therapist_patient_relationships AS
SELECT 
  ca.id,
  ca.professional_id as therapist_id,
  ca.child_id as patient_id,
  ca.access_level,
  ca.granted_at,
  ca.expires_at,
  ca.is_active,
  c.name as patient_name,
  c.birth_date as patient_birth_date,
  p.full_name as therapist_name
FROM public.child_access ca
JOIN public.children c ON ca.child_id = c.id
JOIN public.profiles p ON ca.professional_id = p.id
WHERE ca.is_active = true;

-- Criar view unificada para relacionamentos professor-aluno
CREATE OR REPLACE VIEW public.teacher_student_relationships AS
SELECT 
  cs.id,
  cs.teacher_id,
  cs.child_id as student_id,
  cs.class_id,
  sc.name as class_name,
  sc.grade_level,
  cs.is_active,
  c.name as student_name,
  p.full_name as teacher_name
FROM public.class_students cs
JOIN public.school_classes sc ON cs.class_id = sc.id
JOIN public.children c ON cs.child_id = c.id
LEFT JOIN public.profiles p ON cs.teacher_id = p.id
WHERE cs.is_active = true;

-- Função para verificar acesso de responsável
CREATE OR REPLACE FUNCTION public.is_parent_of(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children
    WHERE id = _child_id AND parent_id = _user_id AND is_active = true
  );
$$;

-- Função para verificar acesso de terapeuta
CREATE OR REPLACE FUNCTION public.is_therapist_of(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_access
    WHERE child_id = _child_id 
      AND professional_id = _user_id 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- Função para verificar acesso de professor
CREATE OR REPLACE FUNCTION public.is_teacher_of(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.school_classes sc ON cs.class_id = sc.id
    WHERE cs.child_id = _child_id 
      AND sc.teacher_id = _user_id 
      AND cs.is_active = true
  );
$$;

-- Função unificada para verificar qualquer acesso à criança
CREATE OR REPLACE FUNCTION public.has_child_access(_user_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_parent_of(_user_id, _child_id) OR
    public.is_therapist_of(_user_id, _child_id) OR
    public.is_teacher_of(_user_id, _child_id) OR
    public.has_role(_user_id, 'admin');
$$;