import { supabase } from '@/integrations/supabase/client';

export interface STJAcordao {
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

export interface STJSearchParams {
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

export interface STJSearchResponse {
  success: boolean;
  data?: STJAcordao[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  source?: 'local' | 'datajud' | 'mixed';
  imported?: number;
  localCount?: number;
  remoteCount?: number;
  error?: string;
}

export interface STJSyncStats {
  orgao: string;
  totalAcordaos: number;
  ultimaSincronizacao: string | null;
}

// Lista de órgãos julgadores do STJ
export const STJ_ORGAOS = [
  { value: 'Corte Especial', label: 'Corte Especial' },
  { value: 'Primeira Seção', label: 'Primeira Seção' },
  { value: 'Segunda Seção', label: 'Segunda Seção' },
  { value: 'Terceira Seção', label: 'Terceira Seção' },
  { value: 'Primeira Turma', label: 'Primeira Turma' },
  { value: 'Segunda Turma', label: 'Segunda Turma' },
  { value: 'Terceira Turma', label: 'Terceira Turma' },
  { value: 'Quarta Turma', label: 'Quarta Turma' },
  { value: 'Quinta Turma', label: 'Quinta Turma' },
  { value: 'Sexta Turma', label: 'Sexta Turma' },
];

// Classes processuais comuns do STJ
export const STJ_CLASSES = [
  { value: 'REsp', label: 'Recurso Especial' },
  { value: 'AgInt', label: 'Agravo Interno' },
  { value: 'AgRg', label: 'Agravo Regimental' },
  { value: 'AREsp', label: 'Agravo em Recurso Especial' },
  { value: 'EDcl', label: 'Embargos de Declaração' },
  { value: 'HC', label: 'Habeas Corpus' },
  { value: 'RHC', label: 'Recurso em Habeas Corpus' },
  { value: 'MS', label: 'Mandado de Segurança' },
  { value: 'RMS', label: 'Recurso em Mandado de Segurança' },
  { value: 'CC', label: 'Conflito de Competência' },
];

export const stjJurisprudenceApi = {
  /**
   * Busca acórdãos do STJ usando busca híbrida (local + API Datajud)
   */
  async search(params: STJSearchParams): Promise<STJSearchResponse> {
    const { data, error } = await supabase.functions.invoke('search-stj-jurisprudence', {
      body: params,
    });

    if (error) {
      console.error('STJ Search error:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao buscar jurisprudência do STJ' 
      };
    }

    return data;
  },

  /**
   * Obtém estatísticas da base de dados STJ
   */
  async getStats(): Promise<{ success: boolean; stats?: STJSyncStats[]; total?: number; error?: string }> {
    // Conta total de acórdãos por órgão
    const { data: acordaosData, error: acordaosError } = await supabase
      .from('stj_acordaos')
      .select('orgao_julgador', { count: 'exact', head: false });

    if (acordaosError) {
      return { success: false, error: acordaosError.message };
    }

    // Agrupa por órgão
    const orgaoCount: Record<string, number> = {};
    (acordaosData || []).forEach((item: { orgao_julgador: string }) => {
      const orgao = item.orgao_julgador;
      orgaoCount[orgao] = (orgaoCount[orgao] || 0) + 1;
    });

    // Busca última sincronização por órgão
    const { data: syncData } = await supabase
      .from('stj_sync_log')
      .select('orgao, finished_at')
      .eq('status', 'success')
      .order('finished_at', { ascending: false });

    const ultimaSync: Record<string, string> = {};
    (syncData || []).forEach((item: { orgao: string; finished_at: string }) => {
      if (!ultimaSync[item.orgao]) {
        ultimaSync[item.orgao] = item.finished_at;
      }
    });

    const stats: STJSyncStats[] = Object.entries(orgaoCount).map(([orgao, total]) => ({
      orgao,
      totalAcordaos: total,
      ultimaSincronizacao: ultimaSync[orgao] || null,
    }));

    const total = Object.values(orgaoCount).reduce((acc, val) => acc + val, 0);

    return { success: true, stats, total };
  },

  /**
   * Popula a base com dados de teste
   */
  async syncTestData(): Promise<{ success: boolean; count?: number; error?: string }> {
    const { data, error } = await supabase.functions.invoke('sync-stj-jurisprudence', {
      body: { testData: true },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.count };
  },
};
