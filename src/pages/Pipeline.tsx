import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { PipelineListView } from '@/components/pipeline/PipelineListView';
import { PipelineCalendarView } from '@/components/pipeline/PipelineCalendarView';
import { PipelineFilters } from '@/components/pipeline/PipelineFilters';
import { PipelineViewToggle, PipelineView } from '@/components/pipeline/PipelineViewToggle';
import { ProcessDetailSheet } from '@/components/pipeline/ProcessDetailSheet';
import {
  CaseStage,
  CaseWithPipeline,
  CaseActivity,
  CaseTask,
  CasePriority,
  PipelineFiltersState,
  PipelineColumn,
} from '@/types/pipeline';

const Pipeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<PipelineView>('kanban');
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [cases, setCases] = useState<CaseWithPipeline[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<PipelineFiltersState>({
    search: '',
    clientId: null,
    actionType: null,
    priority: null,
  });

  // Detail sheet state
  const [selectedCase, setSelectedCase] = useState<CaseWithPipeline | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load stages
  useEffect(() => {
    const loadStages = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('case_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      if (error) {
        console.error('Error loading stages:', error);
        // If no stages, create defaults
        if (data?.length === 0) {
          await createDefaultStages();
        }
      } else if (data && data.length > 0) {
        setStages(data as CaseStage[]);
      } else {
        // Create default stages if none exist
        await createDefaultStages();
      }
    };

    loadStages();
  }, [user]);

  const createDefaultStages = async () => {
    if (!user) return;

    const defaultStages = [
      { name: 'Consulta Inicial', description: 'Primeiro contato com o cliente', color: '#3B82F6', position: 1, is_default: true, is_final: false },
      { name: 'Análise de Viabilidade', description: 'Avaliação do caso', color: '#F59E0B', position: 2, is_default: true, is_final: false },
      { name: 'Proposta/Honorários', description: 'Negociação de honorários', color: '#F97316', position: 3, is_default: true, is_final: false },
      { name: 'Documentação', description: 'Coleta de documentos', color: '#8B5CF6', position: 4, is_default: true, is_final: false },
      { name: 'Elaboração de Peça', description: 'Redação da petição', color: '#10B981', position: 5, is_default: true, is_final: false },
      { name: 'Aguardando Protocolo', description: 'Pronto para protocolar', color: '#06B6D4', position: 6, is_default: true, is_final: false },
      { name: 'Protocolado', description: 'Petição protocolada', color: '#059669', position: 7, is_default: true, is_final: false },
      { name: 'Em Andamento', description: 'Processo em trâmite', color: '#1D4ED8', position: 8, is_default: true, is_final: false },
      { name: 'Aguardando Decisão', description: 'Aguardando manifestação judicial', color: '#CA8A04', position: 9, is_default: true, is_final: false },
      { name: 'Sentença/Decisão', description: 'Decisão proferida', color: '#22C55E', position: 10, is_default: true, is_final: false },
      { name: 'Recurso', description: 'Em fase recursal', color: '#EF4444', position: 11, is_default: true, is_final: false },
      { name: 'Encerrado', description: 'Processo finalizado', color: '#6B7280', position: 12, is_default: true, is_final: true },
    ];

    const { data, error } = await supabase
      .from('case_stages')
      .insert(defaultStages.map(s => ({ ...s, user_id: user.id })))
      .select();

    if (!error && data) {
      setStages(data as CaseStage[]);
    }
  };

  // Load cases with pipeline
  useEffect(() => {
    const loadCases = async () => {
      if (!user || stages.length === 0) return;
      setLoading(true);

      // Load cases with client info
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select(`
          *,
          client:clients(id, name, type)
        `)
        .eq('user_id', user.id);

      if (casesError) {
        console.error('Error loading cases:', casesError);
        setLoading(false);
        return;
      }

      // Load pipeline data
      const { data: pipelineData } = await supabase
        .from('case_pipeline')
        .select('*')
        .eq('user_id', user.id);

      // Load tasks for all cases
      const { data: tasksData } = await supabase
        .from('case_tasks')
        .select('*')
        .eq('user_id', user.id);

      // Merge data
      const firstStage = stages[0];
      const mergedCases: CaseWithPipeline[] = (casesData || []).map((c: any) => {
        const pipeline = pipelineData?.find((p: any) => p.case_id === c.id);
        const caseTasks = tasksData?.filter((t: any) => t.case_id === c.id) || [];
        const stage = stages.find(s => s.id === pipeline?.stage_id) || firstStage;

        return {
          ...c,
          pipeline: pipeline || null,
          stage,
          tasks: caseTasks as CaseTask[],
        };
      });

      setCases(mergedCases);
      setLoading(false);
    };

    loadCases();
  }, [user, stages]);

  // Load clients for filter
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      if (data) setClients(data);
    };
    loadClients();
  }, [user]);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        c.client?.name?.toLowerCase().includes(search) ||
        c.opposing_party.toLowerCase().includes(search) ||
        c.process_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.clientId && c.client_id !== filters.clientId) return false;
    if (filters.actionType && c.action_type !== filters.actionType) return false;
    if (filters.priority && c.pipeline?.priority !== filters.priority) return false;
    return true;
  });

  // Build columns for Kanban
  const columns: PipelineColumn[] = stages.map((stage) => ({
    stage,
    cases: filteredCases.filter((c) => {
      if (c.pipeline?.stage_id) {
        return c.pipeline.stage_id === stage.id;
      }
      // Cases without pipeline go to first stage
      return stage.position === 1;
    }),
  }));

  // Handle card move
  const handleCardMove = async (caseId: string, newStageId: string) => {
    const caseData = cases.find((c) => c.id === caseId);
    if (!caseData || !user) return;

    const oldStageId = caseData.pipeline?.stage_id || stages[0]?.id;

    // Optimistic update
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              pipeline: {
                ...c.pipeline,
                stage_id: newStageId,
                entered_at: new Date().toISOString(),
              } as any,
              stage: stages.find((s) => s.id === newStageId),
            }
          : c
      )
    );

    try {
      // Upsert pipeline
      const { error: pipelineError } = await supabase
        .from('case_pipeline')
        .upsert({
          case_id: caseId,
          stage_id: newStageId,
          user_id: user.id,
          priority: caseData.pipeline?.priority || 'media',
          entered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'case_id' });

      if (pipelineError) throw pipelineError;

      // Record activity
      const fromStage = stages.find((s) => s.id === oldStageId);
      const toStage = stages.find((s) => s.id === newStageId);

      await supabase.from('case_activities').insert({
        case_id: caseId,
        user_id: user.id,
        activity_type: 'stage_change',
        description: `Movido de "${fromStage?.name}" para "${toStage?.name}"`,
        from_stage_id: oldStageId,
        to_stage_id: newStageId,
      });

      toast({
        title: 'Processo movido',
        description: `Movido para "${toStage?.name}"`,
      });
    } catch (error) {
      console.error('Error moving card:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o processo',
        variant: 'destructive',
      });
      // Revert on error
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                pipeline: caseData.pipeline,
                stage: caseData.stage,
              }
            : c
        )
      );
    }
  };

  // Handle card click - open detail sheet
  const handleCardClick = async (caseData: CaseWithPipeline) => {
    setSelectedCase(caseData);
    setSheetOpen(true);

    // Load activities
    const { data: activitiesData } = await supabase
      .from('case_activities')
      .select('*')
      .eq('case_id', caseData.id)
      .order('created_at', { ascending: false });
    setActivities((activitiesData as CaseActivity[]) || []);

    // Load tasks
    const { data: tasksData } = await supabase
      .from('case_tasks')
      .select('*')
      .eq('case_id', caseData.id)
      .order('created_at');
    setTasks((tasksData as CaseTask[]) || []);
  };

  // Sheet handlers
  const handleStageChange = async (stageId: string) => {
    if (!selectedCase) return;
    await handleCardMove(selectedCase.id, stageId);
    setSelectedCase((prev) =>
      prev ? { ...prev, pipeline: { ...prev.pipeline, stage_id: stageId } as any } : null
    );
  };

  const handlePriorityChange = (priority: CasePriority) => {
    setSelectedCase((prev) =>
      prev ? { ...prev, pipeline: { ...prev.pipeline, priority } as any } : null
    );
  };

  const handleDueDateChange = (date: string | null) => {
    setSelectedCase((prev) =>
      prev ? { ...prev, pipeline: { ...prev.pipeline, due_date: date } as any } : null
    );
  };

  const handleNotesChange = (notes: string) => {
    setSelectedCase((prev) =>
      prev ? { ...prev, pipeline: { ...prev.pipeline, notes } as any } : null
    );
  };

  const handleSave = async () => {
    if (!selectedCase || !user) return;
    setIsSaving(true);

    try {
      await supabase.from('case_pipeline').upsert({
        case_id: selectedCase.id,
        stage_id: selectedCase.pipeline?.stage_id || stages[0]?.id,
        user_id: user.id,
        priority: selectedCase.pipeline?.priority || 'media',
        due_date: selectedCase.pipeline?.due_date || null,
        notes: selectedCase.pipeline?.notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'case_id' });

      // Update local state
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id ? { ...c, pipeline: selectedCase.pipeline } : c
        )
      );

      toast({ title: 'Alterações salvas' });
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!user) return;

    await supabase
      .from('case_tasks')
      .update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      )
    );
  };

  const handleTaskAdd = async (title: string) => {
    if (!selectedCase || !user) return;

    const { data } = await supabase
      .from('case_tasks')
      .insert({
        case_id: selectedCase.id,
        user_id: user.id,
        title,
      })
      .select()
      .single();

    if (data) {
      setTasks((prev) => [...prev, data as CaseTask]);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    await supabase.from('case_tasks').delete().eq('id', taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Gestão de Processos</h1>
          <p className="text-muted-foreground">Acompanhe o fluxo de trabalho dos seus processos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/pipeline/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Etapas
          </Button>
          <Button onClick={() => navigate('/cases/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <PipelineFilters filters={filters} onFiltersChange={setFilters} clients={clients} />
        <PipelineViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {view === 'kanban' && (
            <PipelineBoard
              columns={columns}
              onCardClick={handleCardClick}
              onCardMove={handleCardMove}
            />
          )}
          {view === 'list' && (
            <PipelineListView
              cases={filteredCases}
              stages={stages}
              onCardClick={handleCardClick}
              onStageChange={handleCardMove}
            />
          )}
          {view === 'calendar' && (
            <PipelineCalendarView
              cases={filteredCases}
              onCardClick={handleCardClick}
            />
          )}
        </>
      )}

      {/* Detail Sheet */}
      <ProcessDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        caseData={selectedCase}
        stages={stages}
        activities={activities}
        tasks={tasks}
        onStageChange={handleStageChange}
        onPriorityChange={handlePriorityChange}
        onDueDateChange={handleDueDateChange}
        onNotesChange={handleNotesChange}
        onTaskToggle={handleTaskToggle}
        onTaskAdd={handleTaskAdd}
        onTaskDelete={handleTaskDelete}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Pipeline;
