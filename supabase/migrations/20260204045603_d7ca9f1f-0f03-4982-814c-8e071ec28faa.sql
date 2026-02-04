-- =====================================================
-- FASE 1: Infraestrutura de Jurisprudência STJ
-- =====================================================

-- 1.1 Tabela principal de acórdãos do STJ
CREATE TABLE public.stj_acordaos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stj_id TEXT UNIQUE NOT NULL,
  processo TEXT,
  classe TEXT,
  relator TEXT,
  orgao_julgador TEXT NOT NULL,
  data_julgamento DATE,
  data_publicacao DATE,
  ementa TEXT NOT NULL,
  palavras_destaque TEXT[] DEFAULT '{}',
  referencias_legais TEXT[] DEFAULT '{}',
  notas TEXT,
  search_vector TSVECTOR,
  source_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_stj_acordaos_search ON public.stj_acordaos USING GIN(search_vector);
CREATE INDEX idx_stj_acordaos_orgao ON public.stj_acordaos(orgao_julgador);
CREATE INDEX idx_stj_acordaos_data ON public.stj_acordaos(data_julgamento DESC);
CREATE INDEX idx_stj_acordaos_classe ON public.stj_acordaos(classe);
CREATE INDEX idx_stj_acordaos_relator ON public.stj_acordaos(relator);

-- 1.2 Trigger para atualizar search_vector automaticamente
CREATE OR REPLACE FUNCTION public.update_stj_acordaos_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.ementa, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.processo, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.relator, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.classe, '')), 'B') ||
    setweight(to_tsvector('portuguese', array_to_string(COALESCE(NEW.palavras_destaque, '{}'), ' ')), 'A') ||
    setweight(to_tsvector('portuguese', array_to_string(COALESCE(NEW.referencias_legais, '{}'), ' ')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_stj_acordaos_search_vector
  BEFORE INSERT OR UPDATE ON public.stj_acordaos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stj_acordaos_search_vector();

-- 1.3 Tabela de controle de sincronização
CREATE TABLE public.stj_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orgao TEXT NOT NULL,
  arquivo TEXT NOT NULL,
  registros_importados INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(orgao, arquivo)
);

CREATE INDEX idx_stj_sync_log_orgao ON public.stj_sync_log(orgao);
CREATE INDEX idx_stj_sync_log_status ON public.stj_sync_log(status);

-- 1.4 RLS Policies - Dados são públicos para leitura
ALTER TABLE public.stj_acordaos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stj_sync_log ENABLE ROW LEVEL SECURITY;

-- Acórdãos são públicos para leitura (dados oficiais do STJ)
CREATE POLICY "Acordaos STJ sao publicos para leitura"
  ON public.stj_acordaos FOR SELECT
  USING (true);

-- Log de sync é público para leitura (status da base)
CREATE POLICY "Sync log eh publico para leitura"
  ON public.stj_sync_log FOR SELECT
  USING (true);

-- 1.5 Função de busca otimizada para Full-Text Search
CREATE OR REPLACE FUNCTION public.search_stj_acordaos(
  search_query TEXT,
  filter_orgao TEXT DEFAULT NULL,
  filter_classe TEXT DEFAULT NULL,
  filter_data_inicio DATE DEFAULT NULL,
  filter_data_fim DATE DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  stj_id TEXT,
  processo TEXT,
  classe TEXT,
  relator TEXT,
  orgao_julgador TEXT,
  data_julgamento DATE,
  data_publicacao DATE,
  ementa TEXT,
  palavras_destaque TEXT[],
  referencias_legais TEXT[],
  notas TEXT,
  relevance REAL,
  total_count BIGINT
) 
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  ts_query TSQUERY;
  total BIGINT;
BEGIN
  -- Converte query para tsquery
  ts_query := websearch_to_tsquery('portuguese', search_query);
  
  -- Conta total de resultados
  SELECT COUNT(*) INTO total
  FROM public.stj_acordaos a
  WHERE a.search_vector @@ ts_query
    AND (filter_orgao IS NULL OR a.orgao_julgador ILIKE '%' || filter_orgao || '%')
    AND (filter_classe IS NULL OR a.classe = filter_classe)
    AND (filter_data_inicio IS NULL OR a.data_julgamento >= filter_data_inicio)
    AND (filter_data_fim IS NULL OR a.data_julgamento <= filter_data_fim);

  RETURN QUERY
  SELECT 
    a.id,
    a.stj_id,
    a.processo,
    a.classe,
    a.relator,
    a.orgao_julgador,
    a.data_julgamento,
    a.data_publicacao,
    a.ementa,
    a.palavras_destaque,
    a.referencias_legais,
    a.notas,
    ts_rank(a.search_vector, ts_query) as relevance,
    total as total_count
  FROM public.stj_acordaos a
  WHERE a.search_vector @@ ts_query
    AND (filter_orgao IS NULL OR a.orgao_julgador ILIKE '%' || filter_orgao || '%')
    AND (filter_classe IS NULL OR a.classe = filter_classe)
    AND (filter_data_inicio IS NULL OR a.data_julgamento >= filter_data_inicio)
    AND (filter_data_fim IS NULL OR a.data_julgamento <= filter_data_fim)
  ORDER BY relevance DESC, a.data_julgamento DESC NULLS LAST
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;