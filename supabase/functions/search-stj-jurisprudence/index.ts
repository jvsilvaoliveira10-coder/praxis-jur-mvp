import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query: string;
  orgao?: string;
  classe?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

interface STJAcordao {
  id: string;
  stj_id: string;
  processo: string | null;
  classe: string | null;
  relator: string | null;
  orgao_julgador: string;
  data_julgamento: string | null;
  data_publicacao: string | null;
  ementa: string;
  palavras_destaque: string[];
  referencias_legais: string[];
  notas: string | null;
  relevance?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Usa anon key pois dados são públicos
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parâmetros da busca
    const params: SearchParams = await req.json();
    
    const {
      query,
      orgao,
      classe,
      dataInicio,
      dataFim,
      page = 1,
      limit = 20,
    } = params;

    if (!query || query.trim().length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Query deve ter pelo menos 3 caracteres',
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const offset = (page - 1) * limit;

    console.log('Buscando:', { query, orgao, classe, dataInicio, dataFim, page, limit });

    // Usa a função de busca otimizada do banco
    const { data, error } = await supabase.rpc('search_stj_acordaos', {
      search_query: query.trim(),
      filter_orgao: orgao || null,
      filter_classe: classe || null,
      filter_data_inicio: dataInicio || null,
      filter_data_fim: dataFim || null,
      result_limit: limit,
      result_offset: offset,
    });

    if (error) {
      console.error('Erro na busca:', error);
      throw error;
    }

    const results = data || [];
    const totalCount = results.length > 0 ? results[0].total_count : 0;

    // Mapeia para o formato de resposta
    const acordaos: STJAcordao[] = results.map((r: Record<string, unknown>) => ({
      id: r.id,
      stj_id: r.stj_id,
      processo: r.processo,
      classe: r.classe,
      relator: r.relator,
      orgao_julgador: r.orgao_julgador,
      data_julgamento: r.data_julgamento,
      data_publicacao: r.data_publicacao,
      ementa: r.ementa,
      palavras_destaque: r.palavras_destaque || [],
      referencias_legais: r.referencias_legais || [],
      notas: r.notas,
      relevance: r.relevance,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: acordaos,
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
        source: 'stj_dados_abertos',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na busca STJ:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
