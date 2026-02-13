
-- Add complete patient registration fields: address, phone, insurance
ALTER TABLE public.children 
  ADD COLUMN IF NOT EXISTS guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS guardian_email TEXT,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zipcode TEXT,
  ADD COLUMN IF NOT EXISTS insurance_name TEXT,
  ADD COLUMN IF NOT EXISTS insurance_plan TEXT,
  ADD COLUMN IF NOT EXISTS insurance_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
