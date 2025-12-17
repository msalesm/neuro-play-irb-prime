-- Add service_mode to clinic_appointments
ALTER TABLE public.clinic_appointments 
ADD COLUMN IF NOT EXISTS service_mode text DEFAULT 'premium' CHECK (service_mode IN ('premium', 'standard'));

-- Add max_patients to appointment_types for group sessions
ALTER TABLE public.appointment_types 
ADD COLUMN IF NOT EXISTS max_patients integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS service_mode text DEFAULT 'premium' CHECK (service_mode IN ('premium', 'standard'));

-- Insert Premium and Standard appointment types
INSERT INTO public.appointment_types (name, description, duration_minutes, price, color, is_active, service_mode, max_patients)
VALUES 
  ('Sessão Premium', 'Atendimento personalizado individual', 50, 250.00, '#9333EA', true, 'premium', 1),
  ('Sessão Padrão', 'Atendimento em grupo (até 4 pacientes)', 50, 120.00, '#3B82F6', true, 'standard', 4)
ON CONFLICT DO NOTHING;