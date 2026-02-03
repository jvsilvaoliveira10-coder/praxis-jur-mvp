import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FirmSettings {
  id: string;
  user_id: string;
  lawyer_name: string | null;
  oab_number: string | null;
  oab_state: string | null;
  cpf: string | null;
  phone: string | null;
  whatsapp: string | null;
  firm_name: string | null;
  cnpj: string | null;
  logo_url: string | null;
  email: string | null;
  website: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  firm_type: 'solo' | 'partnership' | 'firm' | null;
  lawyers_count: number | null;
  interns_count: number | null;
  staff_count: number | null;
  clients_range: '1-10' | '11-50' | '51-200' | '200+' | null;
  cases_monthly_avg: number | null;
  practice_areas: string[] | null;
  main_courts: string[] | null;
  signature_text: string | null;
  bank_info: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export const useFirmSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: firmSettings, isLoading, error, refetch } = useQuery({
    queryKey: ['firm-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('law_firm_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as FirmSettings | null;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<FirmSettings>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('law_firm_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as FirmSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firm-settings', user?.id] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user?.id) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('firm-logos')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      toast.error('Erro ao fazer upload do logo');
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('firm-logos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const completeOnboarding = async () => {
    await updateSettings.mutateAsync({
      onboarding_completed: true,
    });
  };

  const updateOnboardingStep = async (step: number) => {
    await updateSettings.mutateAsync({
      onboarding_step: step,
    });
  };

  return {
    firmSettings,
    isLoading,
    error,
    refetch,
    updateSettings,
    uploadLogo,
    completeOnboarding,
    updateOnboardingStep,
  };
};
