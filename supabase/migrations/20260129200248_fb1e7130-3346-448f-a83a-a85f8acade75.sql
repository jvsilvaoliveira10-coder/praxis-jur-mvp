-- Criar tabela tracked_processes - Processos monitorados pelo usuario
CREATE TABLE public.tracked_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  process_number TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  classe TEXT,
  assuntos TEXT[],
  orgao_julgador TEXT,
  data_ajuizamento TIMESTAMP WITH TIME ZONE,
  ultimo_movimento TEXT,
  ultimo_movimento_data TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, process_number)
);

-- Criar tabela process_movements - Historico de movimentacoes
CREATE TABLE public.process_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_process_id UUID NOT NULL REFERENCES public.tracked_processes(id) ON DELETE CASCADE,
  codigo INTEGER,
  nome TEXT NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  orgao_julgador TEXT,
  complementos JSONB DEFAULT '{}'::jsonb,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar indice para busca rapida de movimentacoes
CREATE INDEX idx_process_movements_tracked_process ON public.process_movements(tracked_process_id);
CREATE INDEX idx_process_movements_data_hora ON public.process_movements(data_hora DESC);
CREATE INDEX idx_tracked_processes_user ON public.tracked_processes(user_id);
CREATE INDEX idx_tracked_processes_active ON public.tracked_processes(active) WHERE active = true;

-- Habilitar RLS
ALTER TABLE public.tracked_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_movements ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para tracked_processes
CREATE POLICY "Users can view their own tracked processes"
ON public.tracked_processes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracked processes"
ON public.tracked_processes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked processes"
ON public.tracked_processes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked processes"
ON public.tracked_processes
FOR DELETE
USING (auth.uid() = user_id);

-- Politicas RLS para process_movements (baseado no dono do processo pai)
CREATE POLICY "Users can view movements of their tracked processes"
ON public.process_movements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tracked_processes
    WHERE tracked_processes.id = process_movements.tracked_process_id
    AND tracked_processes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create movements for their tracked processes"
ON public.process_movements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tracked_processes
    WHERE tracked_processes.id = process_movements.tracked_process_id
    AND tracked_processes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete movements of their tracked processes"
ON public.process_movements
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tracked_processes
    WHERE tracked_processes.id = process_movements.tracked_process_id
    AND tracked_processes.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tracked_processes_updated_at
BEFORE UPDATE ON public.tracked_processes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();