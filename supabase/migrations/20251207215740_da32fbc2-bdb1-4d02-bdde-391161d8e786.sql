-- Drop the existing policy that only allows managing own routines
DROP POLICY IF EXISTS "Users can manage steps of own routines" ON routine_steps;

-- Create a new policy that allows managing steps of own routines OR templates
CREATE POLICY "Users can manage steps of own or template routines"
ON routine_steps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM routines r
    WHERE r.id = routine_steps.routine_id 
    AND (r.user_id = auth.uid() OR r.is_template = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM routines r
    WHERE r.id = routine_steps.routine_id 
    AND (r.user_id = auth.uid() OR r.is_template = true)
  )
);