-- Drop and recreate policies that might be missing
DO $$ 
BEGIN
  -- Screenings policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all screenings' AND tablename = 'screenings') THEN
    CREATE POLICY "Admins can view all screenings" ON public.screenings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- Adaptive progress policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all adaptive_progress' AND tablename = 'adaptive_progress') THEN
    CREATE POLICY "Admins can view all adaptive_progress" ON public.adaptive_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;