-- Create enum for petition piece types
CREATE TYPE public.piece_type AS ENUM (
  'peticao_inicial',
  'contestacao',
  'peticao_simples',
  'recurso',
  'agravo',
  'apelacao',
  'embargos',
  'manifestacao',
  'outros'
);

-- Create petition templates table
CREATE TABLE public.petition_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  piece_type piece_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.petition_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own templates"
ON public.petition_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.petition_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.petition_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.petition_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_petition_templates_updated_at
BEFORE UPDATE ON public.petition_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();