import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento completo dos datasets do STJ
const STJ_DATASETS = [
  { key: 'corte-especial', name: 'Corte Especial', datasetId: 'espelhos-de-acordaos-corte-especial' },
  { key: 'primeira-secao', name: 'Primeira Seção', datasetId: 'espelhos-de-acordaos-primeira-secao' },
  { key: 'segunda-secao', name: 'Segunda Seção', datasetId: 'espelhos-de-acordaos-segunda-secao' },
  { key: 'terceira-secao', name: 'Terceira Seção', datasetId: 'espelhos-de-acordaos-terceira-secao' },
  { key: 'primeira-turma', name: 'Primeira Turma', datasetId: 'espelhos-de-acordaos-primeira-turma' },
  { key: 'segunda-turma', name: 'Segunda Turma', datasetId: 'espelhos-de-acordaos-segunda-turma' },
  { key: 'terceira-turma', name: 'Terceira Turma', datasetId: 'espelhos-de-acordaos-terceira-turma' },
  { key: 'quarta-turma', name: 'Quarta Turma', datasetId: 'espelhos-de-acordaos-quarta-turma' },
  { key: 'quinta-turma', name: 'Quinta Turma', datasetId: 'espelhos-de-acordaos-quinta-turma' },
  { key: 'sexta-turma', name: 'Sexta Turma', datasetId: 'espelhos-de-acordaos-sexta-turma' },
];

interface CKANResource {
  id: string;
  name: string;
  format: string;
  url: string;
  created: string;
}

interface CKANPackageResponse {
  success: boolean;
  result: {
    resources: CKANResource[];
  };
}

interface SyncResult {
  orgao: string;
  arquivo: string;
  status: 'success' | 'error' | 'skipped';
  importados?: number;
  message?: string;
}

// Busca recursos de um dataset via API CKAN
async function fetchCKANResources(datasetId: string): Promise<CKANResource[]> {
  const url = `https://dadosabertos.web.stj.jus.br/api/3/action/package_show?id=${datasetId}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Praxis-Juridico/1.0',
    },
  });
  
  if (!response.ok) {
    console.error(`Erro ao consultar CKAN para ${datasetId}: ${response.status}`);
    return [];
  }
  
  const data: CKANPackageResponse = await response.json();
  
  if (!data.success || !data.result?.resources) {
    return [];
  }
  
  // Filtra apenas arquivos JSON mensais (YYYYMMDD.json)
  return data.result.resources
    .filter(r => 
      r.format?.toLowerCase() === 'json' && 
      /^\d{8}\.json$/i.test(r.name)
    )
    .sort((a, b) => b.name.localeCompare(a.name)); // Mais recentes primeiro
}

// Chama a função sync-stj-jurisprudence para importar um arquivo
async function syncFile(
  supabaseUrl: string, 
  anonKey: string,
  jsonUrl: string, 
  orgao: string
): Promise<SyncResult> {
  const fileName = jsonUrl.split('/').pop() || 'unknown';
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-stj-jurisprudence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        jsonUrl,
        orgao,
        force: false,
      }),
    });
    
    const result = await response.json();
    
    if (result.skipped) {
      return { orgao, arquivo: fileName, status: 'skipped', message: 'Já importado' };
    }
    
    if (result.success) {
      return { 
        orgao, 
        arquivo: fileName, 
        status: 'success', 
        importados: result.importados 
      };
    }
    
    return { 
      orgao, 
      arquivo: fileName, 
      status: 'error', 
      message: result.error || 'Erro desconhecido' 
    };
  } catch (error) {
    return { 
      orgao, 
      arquivo: fileName, 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Erro de conexão' 
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parâmetros
    const body = await req.json().catch(() => ({}));
    const {
      orgao,           // Opcional: sincronizar apenas um órgão específico
      maxFiles = 3,    // Limite de arquivos por execução (evita timeout)
      statusOnly = false, // Apenas retorna status sem sincronizar
    } = body;

    // Busca arquivos já importados
    const { data: importedLogs } = await supabase
      .from('stj_sync_log')
      .select('orgao, arquivo, status, registros_importados, finished_at')
      .eq('status', 'success');
    
    const importedFiles = new Set(
      (importedLogs || []).map(log => `${log.orgao}:${log.arquivo}`)
    );

    // Determina quais datasets processar
    const datasetsToProcess = orgao 
      ? STJ_DATASETS.filter(d => d.key === orgao || d.name === orgao)
      : STJ_DATASETS;

    if (datasetsToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Órgão não encontrado: ${orgao}`,
          availableOrgaos: STJ_DATASETS.map(d => d.key),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Descobre todos os recursos disponíveis
    console.log('Descobrindo recursos via API CKAN...');
    const allPendingFiles: { orgao: string; url: string; name: string }[] = [];

    for (const dataset of datasetsToProcess) {
      try {
        const resources = await fetchCKANResources(dataset.datasetId);
        
        for (const resource of resources) {
          const key = `${dataset.name}:${resource.name}`;
          if (!importedFiles.has(key)) {
            allPendingFiles.push({
              orgao: dataset.name,
              url: resource.url,
              name: resource.name,
            });
          }
        }
        
        console.log(`${dataset.name}: ${resources.length} arquivos, ${
          resources.filter(r => !importedFiles.has(`${dataset.name}:${r.name}`)).length
        } pendentes`);
        
        // Pequeno delay entre requisições para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Erro ao buscar recursos de ${dataset.name}:`, error);
      }
    }

    // Modo: apenas status
    if (statusOnly) {
      // Conta total de acórdãos por órgão
      const { data: statsData } = await supabase
        .from('stj_acordaos')
        .select('orgao_julgador');
      
      const orgaoCount: Record<string, number> = {};
      (statsData || []).forEach(item => {
        const orgao = item.orgao_julgador;
        orgaoCount[orgao] = (orgaoCount[orgao] || 0) + 1;
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: {
            totalOrgaos: STJ_DATASETS.length,
            totalArquivosImportados: importedLogs?.length || 0,
            totalArquivosPendentes: allPendingFiles.length,
            totalAcordaos: Object.values(orgaoCount).reduce((a, b) => a + b, 0),
            porOrgao: STJ_DATASETS.map(d => ({
              orgao: d.name,
              acordaos: orgaoCount[d.name] || 0,
              arquivosImportados: (importedLogs || []).filter(l => l.orgao === d.name).length,
              arquivosPendentes: allPendingFiles.filter(f => f.orgao === d.name).length,
            })),
            ultimaSincronizacao: importedLogs?.length 
              ? (importedLogs.sort((a, b) => 
                  (b.finished_at || '').localeCompare(a.finished_at || '')
                )[0]?.finished_at || null)
              : null,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Modo: sincronização
    if (allPendingFiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum arquivo pendente para importar',
          totalImportados: importedLogs?.length || 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processa arquivos pendentes (limitado para evitar timeout)
    const filesToProcess = allPendingFiles.slice(0, maxFiles);
    console.log(`Processando ${filesToProcess.length} de ${allPendingFiles.length} arquivos pendentes...`);

    const results: SyncResult[] = [];
    
    for (const file of filesToProcess) {
      console.log(`Importando ${file.orgao}: ${file.name}...`);
      const result = await syncFile(supabaseUrl, supabaseAnonKey, file.url, file.orgao);
      results.push(result);
      
      // Delay entre arquivos para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const totalImportados = results.reduce((sum, r) => sum + (r.importados || 0), 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processados ${filesToProcess.length} arquivos`,
        results,
        summary: {
          processados: filesToProcess.length,
          sucesso: successCount,
          erros: results.filter(r => r.status === 'error').length,
          pulados: results.filter(r => r.status === 'skipped').length,
          acordaosImportados: totalImportados,
          pendentesRestantes: allPendingFiles.length - filesToProcess.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no auto-sync:', error);
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
