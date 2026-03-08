
-- Create storage bucket for patient profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for patient-photos bucket
CREATE POLICY "Authenticated users can upload patient photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-photos');

CREATE POLICY "Anyone can view patient photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-photos');

CREATE POLICY "Authenticated users can update patient photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-photos');

CREATE POLICY "Authenticated users can delete patient photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-photos');
