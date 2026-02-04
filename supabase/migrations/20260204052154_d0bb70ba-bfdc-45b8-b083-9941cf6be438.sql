-- Adiciona campo source_type para rastrear origem dos dados
ALTER TABLE public.stj_acordaos 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'portal_dados_abertos';

-- Comentário explicativo
COMMENT ON COLUMN public.stj_acordaos.source_type IS 'Origem dos dados: portal_dados_abertos, datajud_api, manual';