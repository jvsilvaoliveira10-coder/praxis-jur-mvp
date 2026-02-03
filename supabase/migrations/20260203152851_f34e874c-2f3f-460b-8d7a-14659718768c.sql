-- Criar enum de prioridade
CREATE TYPE case_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Criar enum de tipo de atividade
CREATE TYPE case_activity_type AS ENUM ('stage_change', 'note', 'document', 'deadline', 'task', 'created');

-- Tabela de etapas do pipeline
CREATE TABLE public.case_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de posição no pipeline
CREATE TABLE public.case_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.case_stages(id),
  user_id UUID NOT NULL,
  priority case_priority DEFAULT 'media',
  due_date DATE,
  assigned_to TEXT,
  notes TEXT,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(case_id)
);

-- Tabela de atividades/histórico
CREATE TABLE public.case_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type case_activity_type NOT NULL,
  description TEXT NOT NULL,
  from_stage_id UUID REFERENCES public.case_stages(id),
  to_stage_id UUID REFERENCES public.case_stages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de tarefas/checklist
CREATE TABLE public.case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;

-- Policies para case_stages
CREATE POLICY "Users can view their stages" ON public.case_stages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their stages" ON public.case_stages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their stages" ON public.case_stages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete non-default stages" ON public.case_stages
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Policies para case_pipeline
CREATE POLICY "Users can view their pipeline" ON public.case_pipeline
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pipeline entries" ON public.case_pipeline
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pipeline" ON public.case_pipeline
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete pipeline entries" ON public.case_pipeline
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para case_activities
CREATE POLICY "Users can view their activities" ON public.case_activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create activities" ON public.case_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para case_tasks
CREATE POLICY "Users can view their tasks" ON public.case_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tasks" ON public.case_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their tasks" ON public.case_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their tasks" ON public.case_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at no case_pipeline
CREATE TRIGGER update_case_pipeline_updated_at
  BEFORE UPDATE ON public.case_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar etapas padrão para novo usuário
CREATE OR REPLACE FUNCTION public.create_default_case_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.case_stages (user_id, name, description, color, position, is_default, is_final)
  VALUES
    (NEW.id, 'Consulta Inicial', 'Primeiro contato com o cliente', '#3B82F6', 1, true, false),
    (NEW.id, 'Análise de Viabilidade', 'Avaliação do caso', '#F59E0B', 2, true, false),
    (NEW.id, 'Proposta/Honorários', 'Negociação de honorários', '#F97316', 3, true, false),
    (NEW.id, 'Documentação', 'Coleta de documentos', '#8B5CF6', 4, true, false),
    (NEW.id, 'Elaboração de Peça', 'Redação da petição', '#10B981', 5, true, false),
    (NEW.id, 'Aguardando Protocolo', 'Pronto para protocolar', '#06B6D4', 6, true, false),
    (NEW.id, 'Protocolado', 'Petição protocolada', '#059669', 7, true, false),
    (NEW.id, 'Em Andamento', 'Processo em trâmite', '#1D4ED8', 8, true, false),
    (NEW.id, 'Aguardando Decisão', 'Aguardando manifestação judicial', '#CA8A04', 9, true, false),
    (NEW.id, 'Sentença/Decisão', 'Decisão proferida', '#22C55E', 10, true, false),
    (NEW.id, 'Recurso', 'Em fase recursal', '#EF4444', 11, true, false),
    (NEW.id, 'Encerrado', 'Processo finalizado', '#6B7280', 12, true, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar etapas padrão quando usuário é criado
CREATE TRIGGER on_auth_user_created_stages
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_case_stages();