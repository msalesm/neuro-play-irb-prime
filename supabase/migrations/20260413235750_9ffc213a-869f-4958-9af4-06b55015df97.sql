-- 1. Fix child_development_anamnesis SELECT policy: replace profiles.role check with has_role()
DROP POLICY IF EXISTS "Profissionais podem ver anamneses de seus pacientes" ON child_development_anamnesis;
CREATE POLICY "Profissionais podem ver anamneses de seus pacientes"
ON child_development_anamnesis FOR SELECT TO authenticated
USING (
  (auth.uid() = professional_id) OR
  has_child_access(auth.uid(), child_id) OR
  has_role(auth.uid(), 'admin')
);

-- 2. Add DELETE policy for skills_inventory
DROP POLICY IF EXISTS "Users can delete their own assessments" ON skills_inventory;
CREATE POLICY "Users can delete their own assessments"
ON skills_inventory FOR DELETE TO authenticated
USING (assessor_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- 3. Fix PEI SELECT for teachers - they should see PEI for students in their classes
DROP POLICY IF EXISTS "Teachers can view student PEI plans" ON pei_plans;
CREATE POLICY "Teachers can view student PEI plans"
ON pei_plans FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN school_classes sc ON cs.class_id = sc.id
    WHERE cs.child_id = pei_plans.child_id
    AND sc.teacher_id = auth.uid()
    AND cs.is_active = true
  )
);

-- 4. Allow teachers to INSERT PEI for their students
DROP POLICY IF EXISTS "Teachers can create PEI for students" ON pei_plans;
CREATE POLICY "Teachers can create PEI for students"
ON pei_plans FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher') AND (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM class_students cs
      JOIN school_classes sc ON cs.class_id = sc.id
      WHERE cs.child_id = pei_plans.child_id
      AND sc.teacher_id = auth.uid()
      AND cs.is_active = true
    )
  )
);

-- 5. Allow teachers to UPDATE PEI for their students
DROP POLICY IF EXISTS "Teachers can update student PEI plans" ON pei_plans;
CREATE POLICY "Teachers can update student PEI plans"
ON pei_plans FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN school_classes sc ON cs.class_id = sc.id
    WHERE cs.child_id = pei_plans.child_id
    AND sc.teacher_id = auth.uid()
    AND cs.is_active = true
  )
);

-- 6. Allow therapists to create PEI for their patients
DROP POLICY IF EXISTS "Therapists can create PEI for patients" ON pei_plans;
CREATE POLICY "Therapists can create PEI for patients"
ON pei_plans FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'therapist') AND
  has_child_access(auth.uid(), child_id)
);

-- 7. Allow therapists to view PEI for their patients (fix the broken join-based policy)
DROP POLICY IF EXISTS "Therapists can view patient PEI plans" ON pei_plans;
CREATE POLICY "Therapists can view patient PEI plans"
ON pei_plans FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'therapist') AND
  has_child_access(auth.uid(), child_id)
);

-- 8. Allow therapists to update PEI for their patients
DROP POLICY IF EXISTS "Therapists can update patient PEI plans" ON pei_plans;
CREATE POLICY "Therapists can update patient PEI plans"
ON pei_plans FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'therapist') AND
  has_child_access(auth.uid(), child_id)
);

-- 9. Ensure admins have full PEI access (consolidate duplicate policies)
DROP POLICY IF EXISTS "Admins can view all PEI plans" ON pei_plans;
-- Keep the existing "Admins can view all pei_plans" policy