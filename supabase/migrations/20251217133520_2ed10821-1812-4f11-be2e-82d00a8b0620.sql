-- Tipos de atendimento configuráveis
CREATE TABLE public.appointment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  color TEXT DEFAULT '#3B82F6',
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agendamentos clínicos
CREATE TABLE public.clinic_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id),
  parent_id UUID REFERENCES public.profiles(id),
  professional_id UUID REFERENCES public.profiles(id) NOT NULL,
  appointment_type_id UUID REFERENCES public.appointment_types(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_atendimento', 'realizado', 'falta', 'cancelado', 'reagendado')),
  recurrence_rule TEXT,
  recurrence_parent_id UUID REFERENCES public.clinic_appointments(id),
  internal_notes TEXT,
  check_in_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_via TEXT,
  cancellation_reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lista de espera
CREATE TABLE public.waiting_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES public.children(id),
  parent_id UUID REFERENCES public.profiles(id),
  professional_id UUID REFERENCES public.profiles(id),
  appointment_type_id UUID REFERENCES public.appointment_types(id),
  preferred_days TEXT[],
  preferred_times TEXT[],
  priority INTEGER DEFAULT 5,
  notes TEXT,
  status TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'contatado', 'agendado', 'cancelado')),
  contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

-- RLS Policies para appointment_types (todos autenticados podem ver)
CREATE POLICY "Authenticated users can view appointment types"
ON public.appointment_types FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and therapists can manage appointment types"
ON public.appointment_types FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'therapist'));

-- RLS Policies para clinic_appointments
CREATE POLICY "Professionals can view their appointments"
ON public.clinic_appointments FOR SELECT
TO authenticated
USING (
  professional_id = auth.uid() OR
  parent_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin') OR
  public.is_parent_of_child(auth.uid(), child_id)
);

CREATE POLICY "Professionals and admins can create appointments"
ON public.clinic_appointments FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'therapist') OR
  professional_id = auth.uid()
);

CREATE POLICY "Professionals and admins can update appointments"
ON public.clinic_appointments FOR UPDATE
TO authenticated
USING (
  professional_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can delete appointments"
ON public.clinic_appointments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para waiting_list
CREATE POLICY "View waiting list"
ON public.waiting_list FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid() OR
  professional_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'therapist')
);

CREATE POLICY "Manage waiting list"
ON public.waiting_list FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'therapist')
);

-- Triggers para updated_at
CREATE TRIGGER update_appointment_types_updated_at
BEFORE UPDATE ON public.appointment_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_appointments_updated_at
BEFORE UPDATE ON public.clinic_appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waiting_list_updated_at
BEFORE UPDATE ON public.waiting_list
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_appointments;

-- Insert default appointment types
INSERT INTO public.appointment_types (name, description, duration_minutes, color, price) VALUES
('Avaliação Inicial', 'Primeira consulta de avaliação', 60, '#8B5CF6', 250.00),
('Sessão Regular', 'Atendimento terapêutico padrão', 50, '#3B82F6', 180.00),
('Sessão Devolutiva', 'Devolutiva para responsáveis', 45, '#10B981', 150.00),
('Aplicação de Teste', 'Aplicação de protocolo/teste', 90, '#F59E0B', 300.00),
('Orientação Parental', 'Orientação para pais/responsáveis', 40, '#EC4899', 120.00);