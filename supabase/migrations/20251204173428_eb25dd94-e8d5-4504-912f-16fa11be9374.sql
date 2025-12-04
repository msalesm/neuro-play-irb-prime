-- Add 'patient' role to the app_role enum for adult patients
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient';
