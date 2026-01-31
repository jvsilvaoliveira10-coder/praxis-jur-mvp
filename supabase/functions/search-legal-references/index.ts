import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query: string;
  limit?: number;
  includeArticles?: boolean;
  includeSumulas?: boolean;
  codeTypes?: string[];
  courts?: string[];
  themes?: string[];
}

interface LegalReference {
  type: 'article' | 'sumula';
  id: string;
  label: string;
  content: string;
  source: string;
  relevance: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const params: SearchParams = await req.json();
    
    if (!params.query || params.query.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query deve ter pelo menos 2 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const limit = params.limit || 10;
    const includeArticles = params.includeArticles !== false;
    const includeSumulas = params.includeSumulas !== false;
    const searchQuery = params.query.trim();
    const searchWords = searchQuery.split(' ').filter((w: string) => w.length > 2);

    // Resultados principais
    const results: LegalReference[] = [];

    // Busca em artigos usando websearch
    if (includeArticles) {
      const { data: articles, error: articlesError } = await supabase
        .from('legal_articles')
        .select(`
          id,
          article_number,
          content,
          code:legal_codes!inner(abbreviation, name, active)
        `)
        .textSearch('search_vector', searchQuery, { type: 'websearch', config: 'portuguese' })
        .limit(limit);

      if (articlesError) {
        console.error('Articles search error:', articlesError);
      } else if (articles) {
        for (const article of articles) {
          const code = article.code as any;
          if (code?.active !== false) {
            results.push({
              type: 'article',
              id: article.id,
              label: `Art. ${article.article_number} do ${code?.abbreviation || 'Lei'}`,
              content: article.content,
              source: code?.name || '',
              relevance: 1,
            });
          }
        }
      }
    }

    // Busca em súmulas usando websearch
    if (includeSumulas) {
      const { data: sumulas, error: sumulasError } = await supabase
        .from('sumulas')
        .select('id, court, number, is_binding, content')
        .textSearch('search_vector', searchQuery, { type: 'websearch', config: 'portuguese' })
        .eq('status', 'VIGENTE')
        .limit(limit);

      if (sumulasError) {
        console.error('Sumulas search error:', sumulasError);
      } else if (sumulas) {
        for (const sumula of sumulas) {
          results.push({
            type: 'sumula',
            id: sumula.id,
            label: sumula.is_binding
              ? `Súmula Vinculante ${sumula.number} ${sumula.court}`
              : `Súmula ${sumula.number} ${sumula.court}`,
            content: sumula.content,
            source: sumula.court,
            relevance: 1,
          });
        }
      }
    }

    // Fallback: busca por ILIKE se não encontrar nada com full-text
    if (results.length === 0 && searchWords.length > 0) {
      console.log('No results from text search, trying ILIKE fallback...');

      if (includeArticles) {
        const { data: fallbackArticles } = await supabase
          .from('legal_articles')
          .select(`
            id,
            article_number,
            content,
            code:legal_codes!inner(abbreviation, name)
          `)
          .or(searchWords.map((w: string) => `content.ilike.%${w}%`).join(','))
          .limit(limit);

        if (fallbackArticles) {
          for (const article of fallbackArticles) {
            const code = article.code as any;
            results.push({
              type: 'article',
              id: article.id,
              label: `Art. ${article.article_number} do ${code?.abbreviation || 'Lei'}`,
              content: article.content,
              source: code?.name || '',
              relevance: 0.7,
            });
          }
        }
      }

      if (includeSumulas) {
        const { data: fallbackSumulas } = await supabase
          .from('sumulas')
          .select('id, court, number, is_binding, content')
          .eq('status', 'VIGENTE')
          .or(searchWords.map((w: string) => `content.ilike.%${w}%`).join(','))
          .limit(limit);

        if (fallbackSumulas) {
          for (const sumula of fallbackSumulas) {
            results.push({
              type: 'sumula',
              id: sumula.id,
              label: sumula.is_binding
                ? `Súmula Vinculante ${sumula.number} ${sumula.court}`
                : `Súmula ${sumula.number} ${sumula.court}`,
              content: sumula.content,
              source: sumula.court,
              relevance: 0.7,
            });
          }
        }
      }
    }

    // Busca adicional por temas se especificado
    if (params.themes && params.themes.length > 0) {
      const { data: themeArticles } = await supabase
        .from('legal_articles')
        .select(`
          id,
          article_number,
          content,
          themes,
          code:legal_codes(abbreviation, name)
        `)
        .overlaps('themes', params.themes)
        .limit(5);

      if (themeArticles) {
        for (const article of themeArticles) {
          // Evitar duplicatas
          if (!results.find((r: LegalReference) => r.id === article.id)) {
            const code = article.code as any;
            results.push({
              type: 'article',
              id: article.id,
              label: `Art. ${article.article_number} do ${code?.abbreviation || 'Lei'}`,
              content: article.content,
              source: code?.name || '',
              relevance: 0.5,
            });
          }
        }
      }

      const { data: themeSumulas } = await supabase
        .from('sumulas')
        .select('id, court, number, is_binding, content')
        .overlaps('themes', params.themes)
        .eq('status', 'VIGENTE')
        .limit(5);

      if (themeSumulas) {
        for (const sumula of themeSumulas) {
          if (!results.find((r: LegalReference) => r.id === sumula.id)) {
            results.push({
              type: 'sumula',
              id: sumula.id,
              label: sumula.is_binding
                ? `Súmula Vinculante ${sumula.number} ${sumula.court}`
                : `Súmula ${sumula.number} ${sumula.court}`,
              content: sumula.content,
              source: sumula.court,
              relevance: 0.5,
            });
          }
        }
      }
    }

    // Ordenar por relevância e limitar
    results.sort((a: LegalReference, b: LegalReference) => b.relevance - a.relevance);
    const finalResults = results.slice(0, limit);

    return new Response(
      JSON.stringify({
        success: true,
        data: finalResults,
        count: finalResults.length,
        query: params.query
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-legal-references:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar referências'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
