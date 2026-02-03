-- Create enums for law firm settings
CREATE TYPE public.firm_type AS ENUM ('solo', 'partnership', 'firm');
CREATE TYPE public.clients_range AS ENUM ('1-10', '11-50', '51-200', '200+');

-- Create law_firm_settings table
CREATE TABLE public.law_firm_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do Advogado
  lawyer_name TEXT,
  oab_number TEXT,
  oab_state TEXT,
  cpf TEXT,
  phone TEXT,
  whatsapp TEXT,
  
  -- Dados do Escritório
  firm_name TEXT,
  cnpj TEXT,
  logo_url TEXT,
  email TEXT,
  website TEXT,
  
  -- Endereço
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  
  -- Estrutura
  firm_type public.firm_type DEFAULT 'solo',
  lawyers_count INTEGER DEFAULT 1,
  interns_count INTEGER DEFAULT 0,
  staff_count INTEGER DEFAULT 0,
  clients_range public.clients_range DEFAULT '1-10',
  cases_monthly_avg INTEGER DEFAULT 0,
  
  -- Áreas de Atuação
  practice_areas TEXT[] DEFAULT '{}',
  main_courts TEXT[] DEFAULT '{}',
  
  -- Dados para Documentos
  signature_text TEXT,
  bank_info TEXT,
  
  -- Controle de Onboarding
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.law_firm_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own firm settings"
ON public.law_firm_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own firm settings"
ON public.law_firm_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own firm settings"
ON public.law_firm_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_law_firm_settings_updated_at
BEFORE UPDATE ON public.law_firm_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for firm logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('firm-logos', 'firm-logos', true);

-- Storage policies for firm logos
CREATE POLICY "Firm logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'firm-logos');

CREATE POLICY "Users can upload their own firm logo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'firm-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own firm logo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'firm-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own firm logo"
ON storage.objects
FOR DELETE
USING (bucket_id = 'firm-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to auto-create firm settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_firm_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.law_firm_settings (user_id, lawyer_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger to create firm settings when a new user signs up
CREATE TRIGGER on_auth_user_created_firm_settings
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_firm_settings();