-- Criar tabela para armazenar progresso do onboarding pós-wizard
CREATE TABLE public.user_onboarding_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    welcome_modal_seen BOOLEAN NOT NULL DEFAULT false,
    product_tour_completed BOOLEAN NOT NULL DEFAULT false,
    product_tour_step INTEGER NOT NULL DEFAULT 0,
    first_client_created BOOLEAN NOT NULL DEFAULT false,
    first_case_created BOOLEAN NOT NULL DEFAULT false,
    first_petition_generated BOOLEAN NOT NULL DEFAULT false,
    pipeline_visited BOOLEAN NOT NULL DEFAULT false,
    checklist_dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuário só pode ver/atualizar seu próprio progresso
CREATE POLICY "Users can view their own onboarding progress"
ON public.user_onboarding_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
ON public.user_onboarding_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
ON public.user_onboarding_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_onboarding_progress_updated_at
BEFORE UPDATE ON public.user_onboarding_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();