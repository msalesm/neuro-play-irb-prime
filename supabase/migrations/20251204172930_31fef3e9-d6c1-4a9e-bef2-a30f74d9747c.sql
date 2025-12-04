-- Remove the trigger that auto-assigns 'parent' role to new users
-- Users should choose their role during onboarding

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP FUNCTION IF EXISTS public.assign_default_role();
