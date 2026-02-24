
-- Expandir enum petition_type com novos valores
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'recurso';
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'agravo';
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'apelacao';
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'embargos';
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'manifestacao';
ALTER TYPE public.petition_type ADD VALUE IF NOT EXISTS 'outros';

-- Expandir enum action_type com novos valores
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'trabalhista';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'familia';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'consumidor';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'tributaria';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'criminal';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'previdenciaria';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'execucao';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'inventario';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'usucapiao';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'despejo';
ALTER TYPE public.action_type ADD VALUE IF NOT EXISTS 'outros';
