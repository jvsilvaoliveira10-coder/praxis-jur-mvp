import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFirmSettings } from '@/hooks/useFirmSettings';

interface OnboardingProgress {
  id: string;
  user_id: string;
  welcome_modal_seen: boolean;
  product_tour_completed: boolean;
  product_tour_step: number;
  first_client_created: boolean;
  first_case_created: boolean;
  first_petition_generated: boolean;
  pipeline_visited: boolean;
  checklist_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

interface UseOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  percentComplete: number;
  
  // Ações
  markWelcomeModalSeen: () => Promise<void>;
  markTourCompleted: () => Promise<void>;
  updateTourStep: (step: number) => Promise<void>;
  dismissChecklist: () => Promise<void>;
  startTour: () => void;
  stopTour: () => void;
  
  // Verificações automáticas
  checkAndUpdateProgress: () => Promise<void>;
  markPipelineVisited: () => Promise<void>;
  
  // Estados computados
  shouldShowWelcome: boolean;
  shouldShowTour: boolean;
  shouldShowChecklist: boolean;
  isTourActive: boolean;
  currentTourStep: number;
}

export const useOnboardingProgress = (): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const { firmSettings } = useFirmSettings();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  // Buscar progresso do usuário
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', error);
        return;
      }

      if (data) {
        setProgress(data);
        setCurrentTourStep(data.product_tour_step);
      } else {
        // Criar registro inicial se não existir
        const { data: newData, error: insertError } = await supabase
          .from('user_onboarding_progress')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar progresso:', insertError);
        } else {
          setProgress(newData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Calcular porcentagem de conclusão
  const calculatePercent = useCallback((): number => {
    if (!progress || !firmSettings) return 0;

    let completed = 0;
    const tasks = [
      // Tarefa 1: Perfil completo
      !!(firmSettings.lawyer_name && firmSettings.oab_number),
      // Tarefa 2: Primeiro cliente
      progress.first_client_created,
      // Tarefa 3: Primeiro processo
      progress.first_case_created,
      // Tarefa 4: Primeira petição
      progress.first_petition_generated,
      // Tarefa 5: Visitar pipeline
      progress.pipeline_visited,
    ];

    completed = tasks.filter(Boolean).length;
    return Math.round((completed / tasks.length) * 100);
  }, [progress, firmSettings]);

  // Atualizar campo específico
  const updateField = async (field: Partial<OnboardingProgress>) => {
    if (!user?.id || !progress) return;

    try {
      const { error } = await supabase
        .from('user_onboarding_progress')
        .update(field)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar progresso:', error);
        return;
      }

      setProgress(prev => prev ? { ...prev, ...field } : null);
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  };

  // Marcar welcome modal como visto
  const markWelcomeModalSeen = async () => {
    await updateField({ welcome_modal_seen: true });
  };

  // Marcar tour como completo
  const markTourCompleted = async () => {
    setIsTourActive(false);
    await updateField({ product_tour_completed: true, product_tour_step: 5 });
  };

  // Atualizar passo do tour
  const updateTourStep = async (step: number) => {
    setCurrentTourStep(step);
    await updateField({ product_tour_step: step });
  };

  // Dispensar checklist
  const dismissChecklist = async () => {
    await updateField({ checklist_dismissed: true });
  };

  // Iniciar tour
  const startTour = () => {
    setIsTourActive(true);
    setCurrentTourStep(0);
  };

  // Parar tour
  const stopTour = () => {
    setIsTourActive(false);
  };

  // Marcar pipeline como visitado
  const markPipelineVisited = async () => {
    if (!progress?.pipeline_visited) {
      await updateField({ pipeline_visited: true });
    }
  };

  // Verificar e atualizar progresso automaticamente
  const checkAndUpdateProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Verificar clientes
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Verificar processos
      const { count: caseCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Verificar petições
      const { count: petitionCount } = await supabase
        .from('petitions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const updates: Partial<OnboardingProgress> = {};

      if ((clientCount ?? 0) > 0 && !progress?.first_client_created) {
        updates.first_client_created = true;
      }

      if ((caseCount ?? 0) > 0 && !progress?.first_case_created) {
        updates.first_case_created = true;
      }

      if ((petitionCount ?? 0) > 0 && !progress?.first_petition_generated) {
        updates.first_petition_generated = true;
      }

      if (Object.keys(updates).length > 0) {
        await updateField(updates);
      }
    } catch (err) {
      console.error('Erro ao verificar progresso:', err);
    }
  }, [user?.id, progress]);

  // Verificar se deve mostrar welcome modal
  const shouldShowWelcome = !!(
    firmSettings?.onboarding_completed &&
    progress &&
    !progress.welcome_modal_seen
  );

  // Verificar se deve mostrar checklist
  const shouldShowChecklist = !!(
    firmSettings?.onboarding_completed &&
    progress &&
    progress.welcome_modal_seen &&
    !progress.checklist_dismissed &&
    calculatePercent() < 100
  );

  return {
    progress,
    isLoading,
    percentComplete: calculatePercent(),
    
    markWelcomeModalSeen,
    markTourCompleted,
    updateTourStep,
    dismissChecklist,
    startTour,
    stopTour,
    
    checkAndUpdateProgress,
    markPipelineVisited,
    
    shouldShowWelcome,
    shouldShowTour: isTourActive,
    shouldShowChecklist,
    isTourActive,
    currentTourStep,
  };
};
