-- Add room column to clinic_appointments table
ALTER TABLE public.clinic_appointments 
ADD COLUMN IF NOT EXISTS room TEXT;