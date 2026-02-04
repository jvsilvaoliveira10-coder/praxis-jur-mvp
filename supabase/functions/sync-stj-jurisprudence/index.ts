import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento dos datasets do STJ (baseado no Portal de Dados Abertos)
const STJ_DATASETS: Record<string, { name: string; datasetId: string }> = {
  'corte-especial': { 
    name: 'Corte Especial', 
    datasetId: 'espelhos-de-acordaos-corte-especial' 
  },
  'primeira-secao': { 
    name: 'Primeira Seção', 
    datasetId: 'espelhos-de-acordaos-primeira-secao' 
  },
  'segunda-secao': { 
    name: 'Segunda Seção', 
    datasetId: 'espelhos-de-acordaos-segunda-secao' 
  },
  'terceira-secao': { 
    name: 'Terceira Seção', 
    datasetId: 'espelhos-de-acordaos-terceira-secao' 
  },
  'primeira-turma': { 
    name: 'Primeira Turma', 
    datasetId: 'espelhos-de-acordaos-primeira-turma' 
  },
  'segunda-turma': { 
    name: 'Segunda Turma', 
    datasetId: 'espelhos-de-acordaos-segunda-turma' 
  },
  'terceira-turma': { 
    name: 'Terceira Turma', 
    datasetId: 'espelhos-de-acordaos-terceira-turma' 
  },
  'quarta-turma': { 
    name: 'Quarta Turma', 
    datasetId: 'espelhos-de-acordaos-quarta-turma' 
  },
  'quinta-turma': { 
    name: 'Quinta Turma', 
    datasetId: 'espelhos-de-acordaos-quinta-turma' 
  },
  'sexta-turma': { 
    name: 'Sexta Turma', 
    datasetId: 'espelhos-de-acordaos-sexta-turma' 
  },
};

interface STJAcordaoRaw {
  id?: number | string;
  numeroProcesso?: string;
  processo?: string;
  classe?: string;
  relator?: string;
  orgaoJulgador?: string;
  dataJulgamento?: string;
  dataPublicacao?: string;
  ementa?: string;
  palavrasDestaque?: string[] | string;
  notasJurisprudencia?: string;
  referenciaLegislativa?: string[] | string;
  [key: string]: unknown;
}

interface SyncResult {
  orgao: string;
  arquivo: string;
  registrosImportados: number;
  registrosTotal: number;
  status: 'success' | 'error' | 'skipped';
  message?: string;
}

// Função para tentar diferentes formatos de data
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  // Tenta diferentes formatos
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
    }
  }
  
  return null;
}

// Normaliza array de strings
function normalizeStringArray(value: string[] | string | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string' && v.trim());
  if (typeof value === 'string') {
    // Pode ser uma string separada por vírgulas ou ponto e vírgula
    return value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// Mapeia um acórdão raw para o formato do banco
function mapAcordao(raw: STJAcordaoRaw, orgaoNome: string, sourceFile: string) {
  const stjId = String(raw.id || raw.numeroProcesso || `${orgaoNome}-${Date.now()}-${Math.random()}`);
  const processo = raw.numeroProcesso || raw.processo || null;
  
  return {
    stj_id: stjId,
    processo,
    classe: raw.classe || null,
    relator: raw.relator || null,
    orgao_julgador: raw.orgaoJulgador || orgaoNome,
    data_julgamento: parseDate(raw.dataJulgamento),
    data_publicacao: parseDate(raw.dataPublicacao),
    ementa: raw.ementa || '',
    palavras_destaque: normalizeStringArray(raw.palavrasDestaque),
    referencias_legais: normalizeStringArray(raw.referenciaLegislativa),
    notas: raw.notasJurisprudencia || null,
    source_file: sourceFile,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parâmetros da requisição
    const { orgao, jsonUrl, force = false, testData } = await req.json().catch(() => ({}));

    // Modo de teste: inserir dados de exemplo
    if (testData) {
      console.log('Inserindo dados de teste...');
      
      const sampleAcordaos = [
        {
          stj_id: 'test-resp-2024-001',
          processo: 'REsp 2000001/SP',
          classe: 'REsp',
          relator: 'Ministro(a) EXEMPLO SILVA',
          orgao_julgador: 'Terceira Turma',
          data_julgamento: '2024-01-15',
          data_publicacao: '2024-01-20',
          ementa: 'CIVIL E PROCESSUAL CIVIL. RECURSO ESPECIAL. CONTRATO DE PRESTAÇÃO DE SERVIÇOS. RESCISÃO UNILATERAL. DANOS MORAIS. CABIMENTO. 1. A rescisão unilateral e imotivada de contrato de longa duração, sem observância do prazo de aviso prévio, gera o dever de indenizar. 2. Recurso especial provido.',
          palavras_destaque: ['CONTRATO', 'RESCISÃO', 'DANO MORAL', 'AVISO PRÉVIO'],
          referencias_legais: ['Art. 927 do CC/2002', 'Art. 186 do CC/2002'],
          notas: 'Precedente importante para contratos de longa duração.',
          source_file: 'test-data',
        },
        {
          stj_id: 'test-resp-2024-002',
          processo: 'REsp 2000002/RJ',
          classe: 'REsp',
          relator: 'Ministro(a) TESTE OLIVEIRA',
          orgao_julgador: 'Quarta Turma',
          data_julgamento: '2024-02-10',
          data_publicacao: '2024-02-15',
          ementa: 'DIREITO DO CONSUMIDOR. RECURSO ESPECIAL. BANCO DE DADOS. INSCRIÇÃO INDEVIDA. DANO MORAL IN RE IPSA. VALOR DA INDENIZAÇÃO. RAZOABILIDADE. 1. A inscrição indevida em cadastro de inadimplentes gera dano moral presumido (in re ipsa). 2. O quantum indenizatório deve observar os princípios da proporcionalidade e razoabilidade. 3. Recurso especial parcialmente provido.',
          palavras_destaque: ['CONSUMIDOR', 'DANO MORAL', 'INSCRIÇÃO INDEVIDA', 'SPC', 'SERASA'],
          referencias_legais: ['Art. 43 do CDC', 'Art. 5º, X da CF'],
          notas: null,
          source_file: 'test-data',
        },
        {
          stj_id: 'test-agint-2024-001',
          processo: 'AgInt no AREsp 3000001/MG',
          classe: 'AgInt',
          relator: 'Ministro(a) JURÍDICA SANTOS',
          orgao_julgador: 'Segunda Turma',
          data_julgamento: '2024-03-05',
          data_publicacao: '2024-03-10',
          ementa: 'ADMINISTRATIVO. AGRAVO INTERNO NO AGRAVO EM RECURSO ESPECIAL. SERVIDOR PÚBLICO. REAJUSTE SALARIAL. LEI ESPECÍFICA. NECESSIDADE. 1. O reajuste de vencimentos de servidores públicos depende de lei específica, não podendo ser concedido pelo Poder Judiciário. 2. Súmula 339/STF. 3. Agravo interno não provido.',
          palavras_destaque: ['SERVIDOR PÚBLICO', 'REAJUSTE', 'VENCIMENTOS', 'SÚMULA 339'],
          referencias_legais: ['Art. 37, X da CF', 'Súmula 339/STF'],
          notas: 'Aplicação da Súmula 339 do STF.',
          source_file: 'test-data',
        },
      ];

      const { data, error } = await supabase
        .from('stj_acordaos')
        .upsert(sampleAcordaos, { 
          onConflict: 'stj_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Dados de teste inseridos com sucesso',
          count: data?.length || sampleAcordaos.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Modo normal: sincronizar do Portal STJ
    if (jsonUrl) {
      // Sincronização de URL específica
      console.log(`Baixando JSON de: ${jsonUrl}`);
      
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`Falha ao baixar: ${response.status} ${response.statusText}`);
      }

      const acordaos: STJAcordaoRaw[] = await response.json();
      console.log(`Recebidos ${acordaos.length} acórdãos`);

      const orgaoNome = orgao ? STJ_DATASETS[orgao]?.name || orgao : 'STJ';
      const fileName = jsonUrl.split('/').pop() || 'manual-import';

      // Verifica se já foi importado
      if (!force) {
        const { data: existing } = await supabase
          .from('stj_sync_log')
          .select('id')
          .eq('arquivo', fileName)
          .eq('status', 'success')
          .single();

        if (existing) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Arquivo já foi importado. Use force=true para reimportar.',
              skipped: true,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Registra início da sincronização
      const { data: syncLog } = await supabase
        .from('stj_sync_log')
        .upsert({
          orgao: orgaoNome,
          arquivo: fileName,
          status: 'processing',
          started_at: new Date().toISOString(),
        }, { onConflict: 'orgao,arquivo' })
        .select()
        .single();

      // Processa em lotes
      const BATCH_SIZE = 100;
      let imported = 0;
      let errors = 0;

      for (let i = 0; i < acordaos.length; i += BATCH_SIZE) {
        const batch = acordaos.slice(i, i + BATCH_SIZE);
        const mappedBatch = batch
          .filter(a => a.ementa) // Só importa se tiver ementa
          .map(a => mapAcordao(a, orgaoNome, fileName));

        if (mappedBatch.length === 0) continue;

        const { error } = await supabase
          .from('stj_acordaos')
          .upsert(mappedBatch, { 
            onConflict: 'stj_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Erro no lote ${i}-${i + BATCH_SIZE}:`, error);
          errors++;
        } else {
          imported += mappedBatch.length;
        }
      }

      // Atualiza log de sincronização
      await supabase
        .from('stj_sync_log')
        .update({
          status: errors === 0 ? 'success' : 'partial',
          registros_importados: imported,
          finished_at: new Date().toISOString(),
          error_message: errors > 0 ? `${errors} lotes com erro` : null,
        })
        .eq('id', syncLog?.id);

      return new Response(
        JSON.stringify({
          success: true,
          orgao: orgaoNome,
          arquivo: fileName,
          total: acordaos.length,
          importados: imported,
          erros: errors,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se não passou URL nem testData, retorna lista de datasets disponíveis
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Use jsonUrl para sincronizar um arquivo específico, ou testData=true para dados de teste',
        datasets: Object.entries(STJ_DATASETS).map(([key, value]) => ({
          id: key,
          name: value.name,
          datasetId: value.datasetId,
          portalUrl: `https://dadosabertos.web.stj.jus.br/dataset/${value.datasetId}`,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
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
