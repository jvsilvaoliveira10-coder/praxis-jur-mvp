ALTER TABLE public.user_onboarding_progress 
  ADD COLUMN IF NOT EXISTS ai_template_used BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_report_generated BOOLEAN DEFAULT false;