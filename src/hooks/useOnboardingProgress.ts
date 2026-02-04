import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FirmSettings } from '@/hooks/useFirmSettings';
import { TourModule } from '@/components/onboarding/tourSteps';
import { CHECKLIST_MODULES } from '@/components/onboarding/checklistModules';

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
  // New fields for modular tour
  juridico_tour_completed: boolean;
  juridico_tour_step: number;
  finance_tour_completed: boolean;
  finance_tour_step: number;
  // New task fields
  jurisprudence_searched: boolean;
  tracking_used: boolean;
  finance_dashboard_visited: boolean;
  first_receivable_created: boolean;
  first_contract_created: boolean;
  finance_report_generated: boolean;
  badges_earned: string[];
  created_at: string;
  updated_at: string;
}

interface UseOnboardingProgressParams {
  firmSettings: FirmSettings | null;
  loadingSettings: boolean;
}

interface UseOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  percentComplete: number;
  
  // Ações
  markWelcomeModalSeen: () => Promise<void>;
  markTourCompleted: (module?: TourModule) => Promise<void>;
  updateTourStep: (step: number, module?: TourModule) => Promise<void>;
  dismissChecklist: () => Promise<void>;
  startTour: (module?: TourModule) => void;
  stopTour: () => void;
  
  // Verificações automáticas
  checkAndUpdateProgress: () => Promise<void>;
  markPipelineVisited: () => Promise<void>;
  markJurisprudenceSearched: () => Promise<void>;
  markTrackingUsed: () => Promise<void>;
  markFinanceDashboardVisited: () => Promise<void>;
  markFinanceReportGenerated: () => Promise<void>;
  
  // Estados computados
  shouldShowWelcome: boolean;
  shouldShowTour: boolean;
  shouldShowChecklist: boolean;
  isTourActive: boolean;
  currentTourStep: number;
  activeTourModule: TourModule;
  
  // Module completion states
  juridicoModuleComplete: boolean;
  financeModuleComplete: boolean;
}

export const useOnboardingProgress = (
  params: UseOnboardingProgressParams
): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const { firmSettings, loadingSettings } = params;
  
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [activeTourModule, setActiveTourModule] = useState<TourModule>('juridico');

  // Buscar progresso do usuário
  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingProgress(false);
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
        // Safely handle potentially missing fields from older records
        const progressData: OnboardingProgress = {
          ...data,
          juridico_tour_completed: data.juridico_tour_completed ?? false,
          juridico_tour_step: data.juridico_tour_step ?? 0,
          finance_tour_completed: data.finance_tour_completed ?? false,
          finance_tour_step: data.finance_tour_step ?? 0,
          jurisprudence_searched: data.jurisprudence_searched ?? false,
          tracking_used: data.tracking_used ?? false,
          finance_dashboard_visited: data.finance_dashboard_visited ?? false,
          first_receivable_created: data.first_receivable_created ?? false,
          first_contract_created: data.first_contract_created ?? false,
          finance_report_generated: data.finance_report_generated ?? false,
          badges_earned: data.badges_earned ?? [],
        };
        setProgress(progressData);
        setCurrentTourStep(progressData.product_tour_step);
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
          const progressData: OnboardingProgress = {
            ...newData,
            juridico_tour_completed: false,
            juridico_tour_step: 0,
            finance_tour_completed: false,
            finance_tour_step: 0,
            jurisprudence_searched: false,
            tracking_used: false,
            finance_dashboard_visited: false,
            first_receivable_created: false,
            first_contract_created: false,
            finance_report_generated: false,
            badges_earned: [],
          };
          setProgress(progressData);
        }
      }
    } finally {
      setIsLoadingProgress(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Helper to check if a task is completed
  const isTaskCompleted = useCallback((progressField: string): boolean => {
    if (!progress) return false;
    // Use type assertion to access dynamic field
    const progressRecord = progress as unknown as Record<string, boolean>;
    return !!progressRecord[progressField];
  }, [progress]);

  // Calculate juridico module completion
  const juridicoModuleComplete = useCallback((): boolean => {
    if (!progress || !firmSettings) return false;
    
    const profileComplete = !!(firmSettings.lawyer_name && firmSettings.oab_number);
    const tasks = CHECKLIST_MODULES[0].tasks;
    
    return tasks.every(task => {
      if (task.customCheck && task.id === 'profile') return profileComplete;
      if (task.progressField) return isTaskCompleted(task.progressField);
      return false;
    });
  }, [progress, firmSettings, isTaskCompleted]);

  // Calculate finance module completion
  const financeModuleComplete = useCallback((): boolean => {
    if (!progress) return false;
    
    const tasks = CHECKLIST_MODULES[1].tasks;
    return tasks.every(task => {
      if (task.progressField) return isTaskCompleted(task.progressField);
      return false;
    });
  }, [progress, isTaskCompleted]);

  // Calcular porcentagem de conclusão (todos os módulos)
  const calculatePercent = useCallback((): number => {
    if (!progress || !firmSettings) return 0;

    let completed = 0;
    let total = 0;

    CHECKLIST_MODULES.forEach(module => {
      module.tasks.forEach(task => {
        total++;
        if (task.customCheck && task.id === 'profile') {
          if (firmSettings.lawyer_name && firmSettings.oab_number) completed++;
        } else if (task.progressField && isTaskCompleted(task.progressField)) {
          completed++;
        }
      });
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [progress, firmSettings, isTaskCompleted]);

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
  const markTourCompleted = async (module: TourModule = 'juridico') => {
    setIsTourActive(false);
    
    const updates: Partial<OnboardingProgress> = {
      product_tour_completed: true,
    };

    if (module === 'juridico' || module === 'completo') {
      updates.juridico_tour_completed = true;
    }
    if (module === 'financeiro' || module === 'completo') {
      updates.finance_tour_completed = true;
    }

    await updateField(updates);
  };

  // Atualizar passo do tour
  const updateTourStep = async (step: number, module: TourModule = 'juridico') => {
    setCurrentTourStep(step);
    
    const updates: Partial<OnboardingProgress> = {
      product_tour_step: step,
    };

    if (module === 'juridico') {
      updates.juridico_tour_step = step;
    } else if (module === 'financeiro') {
      updates.finance_tour_step = step;
    }

    await updateField(updates);
  };

  // Dispensar checklist
  const dismissChecklist = async () => {
    await updateField({ checklist_dismissed: true });
  };

  // Iniciar tour
  const startTour = (module: TourModule = 'juridico') => {
    setActiveTourModule(module);
    setCurrentTourStep(0);
    setIsTourActive(true);
  };

  // Parar tour
  const stopTour = () => {
    setIsTourActive(false);
  };

  // Marcar campos específicos
  const markPipelineVisited = async () => {
    if (!progress?.pipeline_visited) {
      await updateField({ pipeline_visited: true });
    }
  };

  const markJurisprudenceSearched = async () => {
    if (!progress?.jurisprudence_searched) {
      await updateField({ jurisprudence_searched: true });
    }
  };

  const markTrackingUsed = async () => {
    if (!progress?.tracking_used) {
      await updateField({ tracking_used: true });
    }
  };

  const markFinanceDashboardVisited = async () => {
    if (!progress?.finance_dashboard_visited) {
      await updateField({ finance_dashboard_visited: true });
    }
  };

  const markFinanceReportGenerated = async () => {
    if (!progress?.finance_report_generated) {
      await updateField({ finance_report_generated: true });
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

      // Verificar recebíveis
      const { count: receivableCount } = await supabase
        .from('receivables')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Verificar contratos
      const { count: contractCount } = await supabase
        .from('fee_contracts')
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

      if ((receivableCount ?? 0) > 0 && !progress?.first_receivable_created) {
        updates.first_receivable_created = true;
      }

      if ((contractCount ?? 0) > 0 && !progress?.first_contract_created) {
        updates.first_contract_created = true;
      }

      if (Object.keys(updates).length > 0) {
        await updateField(updates);
      }
    } catch (err) {
      console.error('Erro ao verificar progresso:', err);
    }
  }, [user?.id, progress]);

  // Loading combinado
  const isLoading = isLoadingProgress || loadingSettings;

  // Verificar se deve mostrar welcome modal
  const shouldShowWelcome = !!(
    !isLoading &&
    firmSettings?.onboarding_completed &&
    progress &&
    !progress.welcome_modal_seen
  );

  // Verificar se deve mostrar checklist
  const shouldShowChecklist = !!(
    !isLoading &&
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
    markJurisprudenceSearched,
    markTrackingUsed,
    markFinanceDashboardVisited,
    markFinanceReportGenerated,
    
    shouldShowWelcome,
    shouldShowTour: isTourActive,
    shouldShowChecklist,
    isTourActive,
    currentTourStep,
    activeTourModule,
    
    juridicoModuleComplete: juridicoModuleComplete(),
    financeModuleComplete: financeModuleComplete(),
  };
};
