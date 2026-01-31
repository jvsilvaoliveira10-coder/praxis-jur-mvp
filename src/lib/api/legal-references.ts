import { supabase } from '@/integrations/supabase/client';

export interface LegalReference {
  type: 'article' | 'sumula';
  id: string;
  label: string;
  content: string;
  source: string;
  relevance: number;
}

export interface SearchLegalReferencesParams {
  query: string;
  limit?: number;
  includeArticles?: boolean;
  includeSumulas?: boolean;
  codeTypes?: string[];
  courts?: string[];
  themes?: string[];
}

export interface SearchLegalReferencesResponse {
  success: boolean;
  data?: LegalReference[];
  count?: number;
  query?: string;
  error?: string;
  fallback?: boolean;
}

export interface LegalCode {
  id: string;
  code_type: string;
  name: string;
  abbreviation: string;
  law_number: string | null;
  publication_date: string | null;
  source_url: string | null;
  active: boolean;
}

export interface LegalArticle {
  id: string;
  code_id: string;
  article_number: string;
  title: string | null;
  content: string;
  chapter: string | null;
  keywords: string[];
  themes: string[];
  created_at: string;
  code?: LegalCode;
}

export interface Sumula {
  id: string;
  court: string;
  number: number;
  is_binding: boolean;
  content: string;
  themes: string[];
  keywords: string[];
  precedents: string[];
  publication_date: string | null;
  status: string;
  notes: string | null;
  source_url: string | null;
}

export interface LegalTheme {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  related_codes: string[];
}

// Buscar referências legais via Edge Function
export async function searchLegalReferences(
  params: SearchLegalReferencesParams
): Promise<SearchLegalReferencesResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('search-legal-references', {
      body: params,
    });

    if (error) {
      console.error('Error calling search-legal-references:', error);
      return { success: false, error: error.message };
    }

    return data as SearchLegalReferencesResponse;
  } catch (error) {
    console.error('Error in searchLegalReferences:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar referências' 
    };
  }
}

// Buscar todos os códigos legais
export async function getLegalCodes(): Promise<LegalCode[]> {
  const { data, error } = await supabase
    .from('legal_codes')
    .select('*')
    .eq('active', true)
    .order('abbreviation');

  if (error) {
    console.error('Error fetching legal codes:', error);
    return [];
  }

  return data as LegalCode[];
}

// Buscar artigos de um código específico
export async function getArticlesByCode(
  codeId: string, 
  options?: { search?: string; limit?: number }
): Promise<LegalArticle[]> {
  let query = supabase
    .from('legal_articles')
    .select(`
      *,
      code:legal_codes(*)
    `)
    .eq('code_id', codeId);

  if (options?.search) {
    query = query.textSearch('search_vector', options.search, { 
      type: 'websearch', 
      config: 'portuguese' 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order('article_number');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data as LegalArticle[];
}

// Buscar súmulas por tribunal
export async function getSumulasByCourt(
  court: 'STF' | 'STJ' | 'TST' | 'TSE',
  options?: { bindingOnly?: boolean; search?: string; limit?: number }
): Promise<Sumula[]> {
  let query = supabase
    .from('sumulas')
    .select('*')
    .eq('court', court)
    .eq('status', 'VIGENTE');
  if (options?.bindingOnly) {
    query = query.eq('is_binding', true);
  }

  if (options?.search) {
    query = query.textSearch('search_vector', options.search, { 
      type: 'websearch', 
      config: 'portuguese' 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order('number');

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sumulas:', error);
    return [];
  }

  return data as Sumula[];
}

// Buscar temas jurídicos
export async function getLegalThemes(): Promise<LegalTheme[]> {
  const { data, error } = await supabase
    .from('legal_themes')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching legal themes:', error);
    return [];
  }

  return data as LegalTheme[];
}

// Buscar súmulas vinculantes
export async function getBindingSumulas(): Promise<Sumula[]> {
  const { data, error } = await supabase
    .from('sumulas')
    .select('*')
    .eq('is_binding', true)
    .eq('status', 'VIGENTE')
    .order('number');

  if (error) {
    console.error('Error fetching binding sumulas:', error);
    return [];
  }

  return data as Sumula[];
}

// Buscar artigo específico por número
export async function getArticleByNumber(
  codeAbbreviation: string,
  articleNumber: string
): Promise<LegalArticle | null> {
  const { data: code } = await supabase
    .from('legal_codes')
    .select('id')
    .eq('abbreviation', codeAbbreviation)
    .single();

  if (!code) return null;

  const { data, error } = await supabase
    .from('legal_articles')
    .select(`
      *,
      code:legal_codes(*)
    `)
    .eq('code_id', code.id)
    .eq('article_number', articleNumber)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data as LegalArticle;
}

// Buscar súmula específica por número
export async function getSumulaByNumber(
  court: 'STF' | 'STJ' | 'TST' | 'TSE',
  number: number,
  isBinding = false
): Promise<Sumula | null> {
  const { data, error } = await supabase
    .from('sumulas')
    .select('*')
    .eq('court', court)
    .eq('number', number)
    .eq('is_binding', isBinding)
    .single();

  if (error) {
    console.error('Error fetching sumula:', error);
    return null;
  }

  return data as Sumula;
}

// Estatísticas da base de conhecimento
export async function getLegalDatabaseStats(): Promise<{
  totalCodes: number;
  totalArticles: number;
  totalSumulas: number;
  bindingSumulas: number;
  totalThemes: number;
}> {
  const [codes, articles, sumulas, bindingSumulas, themes] = await Promise.all([
    supabase.from('legal_codes').select('id', { count: 'exact', head: true }),
    supabase.from('legal_articles').select('id', { count: 'exact', head: true }),
    supabase.from('sumulas').select('id', { count: 'exact', head: true }),
    supabase.from('sumulas').select('id', { count: 'exact', head: true }).eq('is_binding', true),
    supabase.from('legal_themes').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalCodes: codes.count || 0,
    totalArticles: articles.count || 0,
    totalSumulas: sumulas.count || 0,
    bindingSumulas: bindingSumulas.count || 0,
    totalThemes: themes.count || 0,
  };
}
