-- Create table for therapist available time slots
CREATE TABLE IF NOT EXISTS public.therapist_available_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE public.therapist_available_slots ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own slots
CREATE POLICY "Therapists manage own slots"
  ON public.therapist_available_slots
  FOR ALL
  USING (professional_id = auth.uid());

-- Parents can view slots of therapists they have access to
CREATE POLICY "Parents view therapist slots"
  ON public.therapist_available_slots
  FOR SELECT
  USING (
    professional_id IN (
      SELECT DISTINCT ca.professional_id
      FROM child_access ca
      JOIN children c ON ca.child_id = c.id
      WHERE c.parent_id = auth.uid()
        AND ca.is_active = true
        AND ca.approval_status = 'approved'
    )
  );

-- Admins can view all slots
CREATE POLICY "Admins view all slots"
  ON public.therapist_available_slots
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add index for performance
CREATE INDEX idx_therapist_slots_professional ON public.therapist_available_slots(professional_id, is_active);
CREATE INDEX idx_therapist_slots_day ON public.therapist_available_slots(day_of_week, is_active);