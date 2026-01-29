-- Enums para novos tipos
CREATE TYPE public.deadline_type AS ENUM ('prazo_processual', 'audiencia', 'compromisso');
CREATE TYPE public.marital_status AS ENUM ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'separado');

-- Adicionar campos de qualificação completa na tabela clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS marital_status marital_status,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS issuing_body TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  -- Endereço
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  -- Campos específicos PJ
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS state_registration TEXT,
  -- Representante legal (PJ)
  ADD COLUMN IF NOT EXISTS legal_rep_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_rep_cpf TEXT,
  ADD COLUMN IF NOT EXISTS legal_rep_position TEXT;

-- Criar tabela de prazos/agenda
CREATE TABLE public.deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  deadline_type deadline_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  google_event_id TEXT,
  notified_7_days BOOLEAN NOT NULL DEFAULT FALSE,
  notified_3_days BOOLEAN NOT NULL DEFAULT FALSE,
  notified_1_day BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para deadlines
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para deadlines
CREATE POLICY "Users can view their own deadlines"
ON public.deadlines FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deadlines"
ON public.deadlines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines"
ON public.deadlines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines"
ON public.deadlines FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em deadlines
CREATE TRIGGER update_deadlines_updated_at
BEFORE UPDATE ON public.deadlines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de notificações in-app
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deadline_id UUID REFERENCES public.deadlines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;