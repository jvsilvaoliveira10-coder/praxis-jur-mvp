export type CasePriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type CaseActivityType = 'stage_change' | 'note' | 'document' | 'deadline' | 'task' | 'created';

export interface CaseStage {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  position: number;
  is_default: boolean;
  is_final: boolean;
  created_at: string;
}

export interface CasePipeline {
  id: string;
  case_id: string;
  stage_id: string;
  user_id: string;
  priority: CasePriority;
  due_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  entered_at: string;
  updated_at: string;
}

export interface CaseActivity {
  id: string;
  case_id: string;
  user_id: string;
  activity_type: CaseActivityType;
  description: string;
  from_stage_id: string | null;
  to_stage_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CaseTask {
  id: string;
  case_id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

// Extended types with relations
export interface CaseWithPipeline {
  id: string;
  client_id: string;
  opposing_party: string;
  court: string;
  process_number: string | null;
  action_type: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  client?: {
    id: string;
    name: string;
    type: string;
  };
  pipeline?: CasePipeline;
  stage?: CaseStage;
  tasks?: CaseTask[];
  deadlines?: {
    id: string;
    title: string;
    deadline_datetime: string;
    deadline_type: string;
  }[];
}

export interface PipelineColumn {
  stage: CaseStage;
  cases: CaseWithPipeline[];
}

export interface PipelineFiltersState {
  search: string;
  clientId: string | null;
  actionType: string | null;
  priority: CasePriority | null;
}

export const PRIORITY_CONFIG: Record<CasePriority, { label: string; color: string; bgColor: string }> = {
  baixa: { label: 'Baixa', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  media: { label: 'Média', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  alta: { label: 'Alta', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgente: { label: 'Urgente', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const ACTION_TYPE_LABELS: Record<string, string> = {
  obrigacao_de_fazer: 'Obrigação de Fazer',
  cobranca: 'Cobrança',
  indenizacao_danos_morais: 'Indenização por Danos Morais',
};
