-- Add column to persist AI-generated report in skills_inventory
ALTER TABLE public.skills_inventory 
ADD COLUMN IF NOT EXISTS ai_report JSONB DEFAULT NULL;

-- Add generated_at timestamp for the report
ALTER TABLE public.skills_inventory 
ADD COLUMN IF NOT EXISTS ai_report_generated_at TIMESTAMPTZ DEFAULT NULL;
