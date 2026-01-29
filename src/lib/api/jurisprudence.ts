import { supabase } from '@/integrations/supabase/client';

export interface JurisprudenceResult {
  id: string;
  external_id?: string;
  process_number?: string;
  ementa: string;
  orgao_julgador?: string;
  relator?: string;
  judgment_date?: string;
  decision_type?: string;
  pdf_url?: string;
}

export interface SearchResponse {
  success: boolean;
  data?: JurisprudenceResult[];
  error?: string;
  cached?: boolean;
  totalResults?: number;
  message?: string;
  mock?: boolean;
}

export const jurisprudenceApi = {
  async search(query: string, decisionType?: string, page = 1): Promise<SearchResponse> {
    const { data, error } = await supabase.functions.invoke('search-jurisprudence', {
      body: { query, decisionType, page },
    });

    if (error) {
      console.error('Search error:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao buscar jurisprudência' 
      };
    }

    return data;
  },

  async linkToPetition(petitionId: string, jurisprudenceId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { error } = await supabase
      .from('petition_jurisprudence')
      .insert({
        petition_id: petitionId,
        jurisprudence_id: jurisprudenceId,
        user_id: user.id,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Esta jurisprudência já está vinculada à petição' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async unlinkFromPetition(petitionId: string, jurisprudenceId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('petition_jurisprudence')
      .delete()
      .eq('petition_id', petitionId)
      .eq('jurisprudence_id', jurisprudenceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async getLinkedJurisprudence(petitionId: string): Promise<{ success: boolean; data?: JurisprudenceResult[]; error?: string }> {
    const { data, error } = await supabase
      .from('petition_jurisprudence')
      .select(`
        jurisprudence_id,
        jurisprudence_results (
          id,
          external_id,
          process_number,
          ementa,
          orgao_julgador,
          relator,
          judgment_date,
          decision_type,
          pdf_url
        )
      `)
      .eq('petition_id', petitionId);

    if (error) {
      return { success: false, error: error.message };
    }

    const results = data
      ?.map((item: any) => item.jurisprudence_results)
      .filter(Boolean) as JurisprudenceResult[];

    return { success: true, data: results || [] };
  },

  async saveJurisprudence(jurisprudenceId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { error } = await supabase
      .from('saved_jurisprudence')
      .insert({
        user_id: user.id,
        jurisprudence_id: jurisprudenceId,
        notes,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Jurisprudência já salva' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async getSavedJurisprudence(): Promise<{ success: boolean; data?: JurisprudenceResult[]; error?: string }> {
    const { data, error } = await supabase
      .from('saved_jurisprudence')
      .select(`
        notes,
        jurisprudence_results (
          id,
          external_id,
          process_number,
          ementa,
          orgao_julgador,
          relator,
          judgment_date,
          decision_type,
          pdf_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const results = data
      ?.map((item: any) => item.jurisprudence_results)
      .filter(Boolean) as JurisprudenceResult[];

    return { success: true, data: results || [] };
  },
};
