-- =====================================================
-- FASE 1: INFRAESTRUTURA DA BASE DE CONHECIMENTO JURÍDICO
-- =====================================================

-- ENUMs para tipagem
CREATE TYPE code_type AS ENUM (
  'CF', 'CC', 'CPC', 'CDC', 'CLT', 'CP', 'CPP', 'LEI', 'DECRETO'
);

CREATE TYPE court_type AS ENUM (
  'STF', 'STJ', 'TST', 'TSE'
);

CREATE TYPE sumula_status AS ENUM (
  'VIGENTE', 'CANCELADA', 'REVISADA'
);

-- =====================================================
-- TABELA: legal_codes (Códigos e Leis)
-- =====================================================
CREATE TABLE public.legal_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_type code_type NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  law_number TEXT,
  publication_date DATE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para busca por tipo e sigla
CREATE INDEX idx_legal_codes_type ON public.legal_codes(code_type);
CREATE INDEX idx_legal_codes_abbreviation ON public.legal_codes(abbreviation);

-- =====================================================
-- TABELA: legal_articles (Artigos de Lei)
-- =====================================================
CREATE TABLE public.legal_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.legal_codes(id) ON DELETE CASCADE,
  article_number TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  chapter TEXT,
  keywords TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice GIN para busca full-text
CREATE INDEX idx_legal_articles_search ON public.legal_articles USING GIN(search_vector);
CREATE INDEX idx_legal_articles_code ON public.legal_articles(code_id);
CREATE INDEX idx_legal_articles_themes ON public.legal_articles USING GIN(themes);
CREATE INDEX idx_legal_articles_keywords ON public.legal_articles USING GIN(keywords);

-- Trigger para atualizar search_vector automaticamente
CREATE OR REPLACE FUNCTION update_legal_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.article_number, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.chapter, '')), 'C') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.keywords, ' ')), 'A') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.themes, ' ')), 'B');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_legal_articles_search_vector
  BEFORE INSERT OR UPDATE ON public.legal_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_articles_search_vector();

-- =====================================================
-- TABELA: sumulas (Súmulas STF/STJ/TST/TSE)
-- =====================================================
CREATE TABLE public.sumulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court court_type NOT NULL,
  number INTEGER NOT NULL,
  is_binding BOOLEAN NOT NULL DEFAULT false,
  content TEXT NOT NULL,
  themes TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  precedents TEXT[] DEFAULT '{}',
  publication_date DATE,
  status sumula_status NOT NULL DEFAULT 'VIGENTE',
  notes TEXT,
  search_vector TSVECTOR,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(court, number, is_binding)
);

-- Índice GIN para busca full-text
CREATE INDEX idx_sumulas_search ON public.sumulas USING GIN(search_vector);
CREATE INDEX idx_sumulas_court ON public.sumulas(court);
CREATE INDEX idx_sumulas_status ON public.sumulas(status);
CREATE INDEX idx_sumulas_themes ON public.sumulas USING GIN(themes);
CREATE INDEX idx_sumulas_binding ON public.sumulas(is_binding) WHERE is_binding = true;

-- Trigger para atualizar search_vector automaticamente
CREATE OR REPLACE FUNCTION update_sumulas_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', NEW.court::text || ' ' || NEW.number::text), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.keywords, ' ')), 'A') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.themes, ' ')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.notes, '')), 'C');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_sumulas_search_vector
  BEFORE INSERT OR UPDATE ON public.sumulas
  FOR EACH ROW
  EXECUTE FUNCTION update_sumulas_search_vector();

-- =====================================================
-- TABELA: legal_themes (Temas Jurídicos)
-- =====================================================
CREATE TABLE public.legal_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.legal_themes(id) ON DELETE SET NULL,
  description TEXT,
  related_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_themes_parent ON public.legal_themes(parent_id);
CREATE INDEX idx_legal_themes_name ON public.legal_themes(name);

-- =====================================================
-- FUNÇÃO: search_legal_references
-- Busca artigos e súmulas por texto/tema
-- =====================================================
CREATE OR REPLACE FUNCTION search_legal_references(
  search_query TEXT,
  result_limit INTEGER DEFAULT 10,
  include_articles BOOLEAN DEFAULT true,
  include_sumulas BOOLEAN DEFAULT true,
  filter_code_types code_type[] DEFAULT NULL,
  filter_courts court_type[] DEFAULT NULL
)
RETURNS TABLE (
  ref_type TEXT,
  ref_id UUID,
  ref_label TEXT,
  ref_content TEXT,
  ref_source TEXT,
  relevance REAL
) AS $$
DECLARE
  ts_query TSQUERY;
BEGIN
  -- Converte query para tsquery
  ts_query := plainto_tsquery('portuguese', search_query);
  
  RETURN QUERY
  -- Busca em artigos
  SELECT 
    'article'::TEXT as ref_type,
    la.id as ref_id,
    'Art. ' || la.article_number || ' do ' || lc.abbreviation as ref_label,
    la.content as ref_content,
    lc.name as ref_source,
    ts_rank(la.search_vector, ts_query) as relevance
  FROM public.legal_articles la
  JOIN public.legal_codes lc ON la.code_id = lc.id
  WHERE include_articles = true
    AND la.search_vector @@ ts_query
    AND (filter_code_types IS NULL OR lc.code_type = ANY(filter_code_types))
    AND lc.active = true
  
  UNION ALL
  
  -- Busca em súmulas
  SELECT 
    'sumula'::TEXT as ref_type,
    s.id as ref_id,
    CASE 
      WHEN s.is_binding THEN 'Súmula Vinculante ' || s.number || ' ' || s.court::TEXT
      ELSE 'Súmula ' || s.number || ' ' || s.court::TEXT
    END as ref_label,
    s.content as ref_content,
    s.court::TEXT as ref_source,
    ts_rank(s.search_vector, ts_query) as relevance
  FROM public.sumulas s
  WHERE include_sumulas = true
    AND s.search_vector @@ ts_query
    AND (filter_courts IS NULL OR s.court = ANY(filter_courts))
    AND s.status = 'VIGENTE'
  
  ORDER BY relevance DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- =====================================================
-- RLS POLICIES
-- Legislação é pública para leitura, apenas admins podem modificar
-- =====================================================

-- Enable RLS
ALTER TABLE public.legal_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sumulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_themes ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Anyone can view legal codes"
  ON public.legal_codes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view legal articles"
  ON public.legal_articles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view sumulas"
  ON public.sumulas FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view legal themes"
  ON public.legal_themes FOR SELECT
  USING (true);

-- Políticas de escrita (apenas via service_role/edge functions)
CREATE POLICY "Service role can insert legal codes"
  ON public.legal_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update legal codes"
  ON public.legal_codes FOR UPDATE
  USING (true);

CREATE POLICY "Service role can insert legal articles"
  ON public.legal_articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update legal articles"
  ON public.legal_articles FOR UPDATE
  USING (true);

CREATE POLICY "Service role can insert sumulas"
  ON public.sumulas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update sumulas"
  ON public.sumulas FOR UPDATE
  USING (true);

CREATE POLICY "Service role can insert legal themes"
  ON public.legal_themes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update legal themes"
  ON public.legal_themes FOR UPDATE
  USING (true);

-- =====================================================
-- DADOS INICIAIS: Temas Jurídicos Básicos
-- =====================================================
INSERT INTO public.legal_themes (name, description, related_codes) VALUES
  ('Danos Morais', 'Indenização por danos extrapatrimoniais', ARRAY['CC', 'CDC', 'CF']),
  ('Danos Materiais', 'Indenização por danos patrimoniais', ARRAY['CC', 'CDC']),
  ('Obrigação de Fazer', 'Obrigações de prestação de conduta', ARRAY['CC', 'CPC']),
  ('Obrigação de Não Fazer', 'Abstenção de conduta', ARRAY['CC', 'CPC']),
  ('Cobrança', 'Ações de cobrança de dívidas', ARRAY['CC', 'CPC']),
  ('Contrato', 'Direito contratual', ARRAY['CC', 'CDC']),
  ('Consumidor', 'Relações de consumo', ARRAY['CDC', 'CC']),
  ('Responsabilidade Civil', 'Reparação de danos', ARRAY['CC', 'CDC']),
  ('Processo Civil', 'Normas processuais civis', ARRAY['CPC']),
  ('Honorários Advocatícios', 'Sucumbência e contratuais', ARRAY['CPC', 'CC']),
  ('Tutela de Urgência', 'Medidas cautelares e antecipadas', ARRAY['CPC']),
  ('Recursos', 'Impugnações processuais', ARRAY['CPC']),
  ('Execução', 'Cumprimento de sentença e execução', ARRAY['CPC']),
  ('Direitos Fundamentais', 'Garantias constitucionais', ARRAY['CF']),
  ('Trabalhista', 'Direito do trabalho', ARRAY['CLT', 'CF']);

-- =====================================================
-- DADOS INICIAIS: Códigos Legais
-- =====================================================
INSERT INTO public.legal_codes (code_type, name, abbreviation, law_number, publication_date, source_url) VALUES
  ('CF', 'Constituição da República Federativa do Brasil de 1988', 'CF', NULL, '1988-10-05', 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'),
  ('CC', 'Código Civil', 'CC', '10.406/2002', '2002-01-10', 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm'),
  ('CPC', 'Código de Processo Civil', 'CPC', '13.105/2015', '2015-03-16', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm'),
  ('CDC', 'Código de Defesa do Consumidor', 'CDC', '8.078/1990', '1990-09-11', 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'),
  ('CLT', 'Consolidação das Leis do Trabalho', 'CLT', '5.452/1943', '1943-05-01', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm');