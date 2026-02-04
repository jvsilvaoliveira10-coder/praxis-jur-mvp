import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API pública do Datajud (CNJ)
const DATAJUD_API_URL = 'https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search';
const DATAJUD_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

interface SearchParams {
  query: string;
  orgao?: string;
  classe?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
  fetchRemote?: boolean;
  minLocalResults?: number;
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
  source_type?: string;
}

interface DatajudHit {
  _source: {
    id?: string;
    numeroProcesso?: string;
    classeProcessual?: { codigo?: number; nome?: string };
    orgaoJulgador?: { codigo?: number; nome?: string };
    relator?: { nome?: string };
    dataAjuizamento?: string;
    movimentos?: Array<{
      codigo?: number;
      nome?: string;
      dataHora?: string;
      complementosTabelados?: Array<{ descricao?: string }>;
    }>;
    assuntos?: Array<{ codigo?: number; nome?: string }>;
  };
}

interface RpcResult {
  id: string;
  stj_id: string;
  processo: string | null;
  classe: string | null;
  relator: string | null;
  orgao_julgador: string;
  data_julgamento: string | null;
  data_publicacao: string | null;
  ementa: string;
  palavras_destaque: string[] | null;
  referencias_legais: string[] | null;
  notas: string | null;
  relevance: number;
  total_count: number;
}

// Parser robusto para datas do Datajud (aceita ISO e formato compacto)
function parseDatajudDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  const cleaned = String(dateStr).trim();
  
  // Formato ISO: "2025-12-24T00:00:00" ou "2025-12-24"
  if (cleaned.includes('-')) {
    return cleaned.split('T')[0];
  }
  
  // Formato compacto: "20251224000000" ou "20251224"
  if (cleaned.length >= 8 && /^\d+$/.test(cleaned)) {
    const year = cleaned.substring(0, 4);
    const month = cleaned.substring(4, 6);
    const day = cleaned.substring(6, 8);
    
    // Validação básica
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// Busca na base local usando Full-Text Search
async function searchLocal(
  supabase: AnySupabaseClient,
  params: SearchParams
): Promise<{ data: STJAcordao[]; total: number }> {
  const { query, orgao, classe, dataInicio, dataFim, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

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
    console.error('Erro na busca local:', error);
    throw error;
  }

  const results = (data || []) as RpcResult[];
  const totalCount = results.length > 0 ? results[0].total_count : 0;

  const acordaos: STJAcordao[] = results.map((r) => ({
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
    source_type: 'local',
  }));

  return { data: acordaos, total: Number(totalCount) };
}

// Busca na API Datajud (tempo real)
async function searchDatajud(query: string, limit: number = 20): Promise<STJAcordao[]> {
  console.log('Buscando na API Datajud:', query);

  const esQuery = {
    query: {
      bool: {
        should: [
          {
            match: {
              'movimentos.complementosTabelados.descricao': {
                query: query,
                operator: 'and',
              },
            },
          },
          {
            match: {
              'assuntos.nome': query,
            },
          },
          {
            match: {
              'movimentos.nome': query,
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
    size: limit,
    sort: [{ dataAjuizamento: 'desc' }],
    _source: [
      'id',
      'numeroProcesso',
      'classeProcessual',
      'orgaoJulgador',
      'relator',
      'dataAjuizamento',
      'movimentos',
      'assuntos',
    ],
  };

  try {
    const response = await fetch(DATAJUD_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${DATAJUD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(esQuery),
    });

    if (!response.ok) {
      console.error('Erro na API Datajud:', response.status, await response.text());
      return [];
    }

    const result = await response.json();
    const hits: DatajudHit[] = result.hits?.hits || [];

    console.log(`API Datajud retornou ${hits.length} resultados`);

    return hits.map((hit) => mapDatajudToAcordao(hit));
  } catch (error) {
    console.error('Erro ao consultar API Datajud:', error);
    return [];
  }
}

// Mapeia dados do Datajud para o formato local
function mapDatajudToAcordao(hit: DatajudHit): STJAcordao {
  const source = hit._source;
  
  // Encontra o movimento de acórdão mais recente
  const acordaoMovimento = source.movimentos?.find(
    (m) => m.nome?.toLowerCase().includes('acórdão') || m.nome?.toLowerCase().includes('acordao')
  );

  // Monta a ementa a partir dos complementos do movimento
  let ementa = '';
  if (acordaoMovimento?.complementosTabelados) {
    ementa = acordaoMovimento.complementosTabelados
      .map((c) => c.descricao)
      .filter(Boolean)
      .join(' ');
  }

  // Se não encontrou ementa, usa os assuntos
  if (!ementa && source.assuntos) {
    ementa = `Assuntos: ${source.assuntos.map((a) => a.nome).join(', ')}`;
  }

  // Data de julgamento do acórdão (usando parser robusto)
  const dataJulgamento = parseDatajudDate(acordaoMovimento?.dataHora)
    || parseDatajudDate(source.dataAjuizamento);

  return {
    id: crypto.randomUUID(),
    stj_id: source.id || `datajud_${source.numeroProcesso}`,
    processo: source.numeroProcesso || null,
    classe: source.classeProcessual?.nome || null,
    relator: source.relator?.nome || null,
    orgao_julgador: source.orgaoJulgador?.nome || 'STJ',
    data_julgamento: dataJulgamento,
    data_publicacao: null,
    ementa: ementa || 'Ementa não disponível via API Datajud',
    palavras_destaque: source.assuntos?.map((a) => a.nome || '').filter(Boolean) || [],
    referencias_legais: [],
    notas: null,
    source_type: 'datajud_api',
  };
}

// Importa acórdãos novos para a base local
async function importToLocal(
  supabase: AnySupabaseClient,
  acordaos: STJAcordao[]
): Promise<number> {
  if (acordaos.length === 0) return 0;

  let imported = 0;

  for (const acordao of acordaos) {
    if (!acordao.processo) continue;

    // Verifica se já existe pelo número do processo
    const { data: existing } = await supabase
      .from('stj_acordaos')
      .select('id')
      .eq('processo', acordao.processo)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('stj_acordaos').insert({
        stj_id: acordao.stj_id,
        processo: acordao.processo,
        classe: acordao.classe,
        relator: acordao.relator,
        orgao_julgador: acordao.orgao_julgador,
        data_julgamento: acordao.data_julgamento,
        data_publicacao: acordao.data_publicacao,
        ementa: acordao.ementa,
        palavras_destaque: acordao.palavras_destaque,
        referencias_legais: acordao.referencias_legais,
        notas: acordao.notas,
        source_file: 'datajud_api',
      });

      if (!error) {
        imported++;
      } else {
        console.error('Erro ao importar acórdão:', error);
      }
    }
  }

  console.log(`Importados ${imported} novos acórdãos para base local`);
  return imported;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase: AnySupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const params: SearchParams = await req.json();
    const {
      query,
      page = 1,
      limit = 20,
      fetchRemote = false,
      minLocalResults = 5,
    } = params;

    if (!query || query.trim().length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Query deve ter pelo menos 3 caracteres',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Busca híbrida STJ:', { query, fetchRemote, minLocalResults });

    // 1. Busca local primeiro
    const localResult = await searchLocal(supabase, params);
    console.log(`Busca local: ${localResult.data.length} resultados (total: ${localResult.total})`);

    // 2. Se tem resultados suficientes e não forçou busca remota, retorna local
    if (localResult.data.length >= minLocalResults && !fetchRemote) {
      return new Response(
        JSON.stringify({
          success: true,
          data: localResult.data,
          pagination: {
            page,
            limit,
            total: localResult.total,
            totalPages: Math.ceil(localResult.total / limit),
          },
          source: 'local',
          imported: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Busca na API Datajud (resultados insuficientes ou forçado)
    console.log('Buscando na API Datajud para complementar...');
    const datajudResults = await searchDatajud(query, limit);

    // 4. Importa os novos resultados para a base local (cache)
    const importedCount = await importToLocal(supabase, datajudResults);

    // 5. Combina resultados (local + datajud), removendo duplicatas
    const processosLocais = new Set(localResult.data.map((a) => a.processo));
    const novosResultados = datajudResults.filter((a) => !processosLocais.has(a.processo));
    
    const combinedResults = [...localResult.data, ...novosResultados].slice(0, limit);
    const source = localResult.data.length > 0 && novosResultados.length > 0 
      ? 'mixed' 
      : novosResultados.length > 0 
        ? 'datajud' 
        : 'local';

    return new Response(
      JSON.stringify({
        success: true,
        data: combinedResults,
        pagination: {
          page,
          limit,
          total: localResult.total + novosResultados.length,
          totalPages: Math.ceil((localResult.total + novosResultados.length) / limit),
        },
        source,
        imported: importedCount,
        localCount: localResult.data.length,
        remoteCount: novosResultados.length,
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
