-- Create template_folders table for organizing petition templates
CREATE TABLE public.template_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for template_folders
CREATE POLICY "Users can view their own folders"
ON public.template_folders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.template_folders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.template_folders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.template_folders
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_template_folders_updated_at
BEFORE UPDATE ON public.template_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add folder_id column to petition_templates (nullable for existing templates)
ALTER TABLE public.petition_templates
ADD COLUMN folder_id UUID REFERENCES public.template_folders(id) ON DELETE SET NULL;

-- Create index for efficient folder queries
CREATE INDEX idx_petition_templates_folder_id ON public.petition_templates(folder_id);
CREATE INDEX idx_template_folders_user_id ON public.template_folders(user_id);