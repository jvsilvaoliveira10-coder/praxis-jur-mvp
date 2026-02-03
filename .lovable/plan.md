

# Plano: CRM de Gestao de Processos Estilo Kanban

## Visao Geral

Implementar um sistema completo de gestao de processos (Project Management/CRM) estilo Trello/Kanban, permitindo ao advogado visualizar e gerenciar o fluxo de trabalho de cada processo desde o primeiro contato com o cliente ate a conclusao. O sistema tera multiplas visualizacoes (Kanban, Lista, Calendario) e integracao total com os modulos existentes (Clientes, Processos, Financeiro, Agenda).

---

## Conceito de Negocio

### Por que isso e necessario?

O fluxo de um processo juridico envolve diversas etapas ANTES e DEPOIS de ir ao tribunal:

```text
1. Consulta Inicial -> 2. Analise do Caso -> 3. Proposta de Honorarios -> 
4. Contrato Assinado -> 5. Procuracao -> 6. Coleta de Documentos -> 
7. Peticao Inicial -> 8. Protocolo -> 9. Aguardando Citacao -> 
10. Audiencia Marcada -> 11. Sentenca -> 12. Recurso (se houver) -> 13. Encerrado
```

O CRM permitira:
- Ver em qual etapa cada processo esta
- Identificar gargalos (ex: 10 processos parados aguardando documentos)
- Nao esquecer nenhum processo
- Ter uma visao gerencial do escritorio

---

## Estrutura do Banco de Dados

### Nova Tabela: `case_stages` (Etapas do Processo)

Armazena as etapas customizaveis do pipeline:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| user_id | uuid | Dono do registro |
| name | text | Nome da etapa |
| description | text | Descricao opcional |
| color | text | Cor para visualizacao |
| position | integer | Ordem no pipeline |
| is_default | boolean | Se e uma etapa padrao do sistema |
| is_final | boolean | Se e etapa final (processo concluido) |
| created_at | timestamp | Data de criacao |

**Etapas Padrao (criadas automaticamente):**
1. Consulta Inicial (azul)
2. Analise de Viabilidade (amarelo)
3. Proposta/Honorarios (laranja)
4. Documentacao (roxo)
5. Elaboracao de Peca (verde)
6. Aguardando Protocolo (cyan)
7. Protocolado (verde-escuro)
8. Em Andamento (azul-escuro)
9. Aguardando Decisao (amarelo-escuro)
10. Sentenca/Decisao (verde)
11. Recurso (vermelho)
12. Encerrado (cinza)

---

### Nova Tabela: `case_pipeline` (Posicao do Processo no Pipeline)

Vincula cada processo a uma etapa:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| case_id | uuid | FK para cases |
| stage_id | uuid | FK para case_stages |
| user_id | uuid | Dono do registro |
| priority | text | baixa, media, alta, urgente |
| due_date | date | Data limite para esta etapa |
| assigned_to | text | Responsavel (futuro multi-user) |
| notes | text | Observacoes da etapa atual |
| entered_at | timestamp | Quando entrou nesta etapa |
| updated_at | timestamp | Ultima atualizacao |

---

### Nova Tabela: `case_activities` (Historico de Atividades)

Log de todas as movimentacoes do processo:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| case_id | uuid | FK para cases |
| user_id | uuid | Quem realizou a acao |
| activity_type | text | stage_change, note, document, deadline, task |
| description | text | Descricao da atividade |
| from_stage_id | uuid | Etapa anterior (se mudanca) |
| to_stage_id | uuid | Etapa nova (se mudanca) |
| metadata | jsonb | Dados extras |
| created_at | timestamp | Data da atividade |

---

### Nova Tabela: `case_tasks` (Tarefas do Processo)

Checklist de tarefas por processo:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| case_id | uuid | FK para cases |
| user_id | uuid | Dono |
| title | text | Titulo da tarefa |
| description | text | Descricao |
| is_completed | boolean | Se foi concluida |
| due_date | date | Data limite |
| completed_at | timestamp | Quando foi concluida |
| created_at | timestamp | Data de criacao |

---

## Estrutura de Componentes

### Nova Pagina Principal: `/pipeline`

**Arquivo:** `src/pages/Pipeline.tsx`

Sera o hub central do CRM com:
- Header com titulo e filtros
- Toggle de visualizacao (Kanban | Lista | Calendario)
- Botao "Novo Processo" que ja inicia no pipeline
- Filtros: cliente, tipo de acao, prioridade, responsavel

---

### Componentes do Kanban

```text
src/components/pipeline/
  - PipelineBoard.tsx        (board principal do Kanban)
  - PipelineColumn.tsx       (coluna/etapa)
  - PipelineCard.tsx         (card do processo)
  - PipelineFilters.tsx      (filtros e busca)
  - PipelineViewToggle.tsx   (toggle Kanban/Lista/Calendario)
  - ProcessDetailSheet.tsx   (drawer lateral com detalhes)
  - StageManager.tsx         (modal para gerenciar etapas)
  - QuickAddProcess.tsx      (modal rapido para novo processo)
  - TaskChecklist.tsx        (checklist de tarefas)
  - ActivityTimeline.tsx     (timeline de atividades)
  - PriorityBadge.tsx        (badge de prioridade)
  - DueDateBadge.tsx         (badge de vencimento)
```

---

## Visualizacao Kanban (Principal)

### Layout do Board

```text
+------------------------------------------------------------------------+
|  [Filtros: Cliente | Tipo | Prioridade]     [Kanban] [Lista] [Cal]     |
+------------------------------------------------------------------------+

+-------------+  +-------------+  +-------------+  +-------------+
| Consulta    |  | Analise     |  | Documentacao|  | Em Andamento|
| Inicial (3) |  | (2)         |  | (5)         |  | (8)         |
+-------------+  +-------------+  +-------------+  +-------------+
|             |  |             |  |             |  |             |
| +--------+  |  | +--------+  |  | +--------+  |  | +--------+  |
| |Card 1  |  |  | |Card 2  |  |  | |Card 3  |  |  | |Card 4  |  |
| |Cliente |  |  | |Cliente |  |  | |Cliente |  |  | |Cliente |  |
| |Prazo   |  |  | |Prazo   |  |  | |Prazo   |  |  | |Prazo   |  |
| +--------+  |  | +--------+  |  | +--------+  |  | +--------+  |
|             |  |             |  |             |  |             |
| +--------+  |  | +--------+  |  | +--------+  |  |             |
| |Card 2  |  |  | |Card 3  |  |  | |Card 4  |  |  |             |
| +--------+  |  | +--------+  |  | +--------+  |  |             |
|             |  |             |  |             |  |             |
+-------------+  +-------------+  +-------------+  +-------------+
```

### Card do Processo

```text
+----------------------------------+
| [Urgente]              [Cobranca]|  <- Badges
+----------------------------------+
| Maria Silva vs. Banco XYZ        |  <- Cliente + Parte Contraria
| 0000000-00.0000.0.00.0000        |  <- Numero do Processo
+----------------------------------+
| [x] Procuracao                   |  <- Checklist resumido
| [x] Documentos pessoais          |
| [ ] Petição inicial              |
+----------------------------------+
| Vence: 15/02/2026                |  <- Prazo da etapa
| 1a Vara Civel - SP               |  <- Vara
+----------------------------------+
```

### Interacoes do Kanban

1. **Drag and Drop** - Arrastar card entre colunas muda a etapa
2. **Click no Card** - Abre drawer lateral com detalhes completos
3. **Menu de Contexto** - Botao direito para acoes rapidas
4. **Scroll Horizontal** - Para ver todas as colunas

---

## Visualizacao em Lista

### Layout da Lista

```text
+------------------------------------------------------------------------+
| [Filtros]                                      [Kanban] [Lista] [Cal]  |
+------------------------------------------------------------------------+

| Cliente          | Processo        | Etapa        | Prazo    | Prior. |
|------------------|-----------------|--------------|----------|--------|
| Maria Silva      | 0000-00...      | Documentacao | 15/02    | Alta   |
| Joao Santos      | 0001-00...      | Em Andamento | 20/02    | Media  |
| Empresa ABC      | 0002-00...      | Sentenca     | -        | Baixa  |
+------------------------------------------------------------------------+
```

### Funcionalidades da Lista

- Ordenacao por qualquer coluna
- Selecao multipla para acoes em lote
- Expansao inline para ver detalhes
- Edicao rapida de prioridade e etapa

---

## Visualizacao em Calendario

### Layout do Calendario

```text
+------------------------------------------------------------------------+
| [Filtros]                                      [Kanban] [Lista] [Cal]  |
+------------------------------------------------------------------------+

|  Janeiro 2026                                         [< Mes Ano >]   |
+--------+--------+--------+--------+--------+--------+--------+
| Dom    | Seg    | Ter    | Qua    | Qui    | Sex    | Sab    |
+--------+--------+--------+--------+--------+--------+--------+
|        |        |        | 1      | 2      | 3      | 4      |
|        |        |        |        | [2]    |        |        |
+--------+--------+--------+--------+--------+--------+--------+
| 5      | 6      | 7      | 8      | 9      | 10     | 11     |
|        | [1]    |        |        | [3]    |        |        |
+--------+--------+--------+--------+--------+--------+--------+
```

O calendario mostra:
- Prazos de etapas (due_date do pipeline)
- Audiencias vinculadas (da tabela deadlines)
- Cards clicaveis que abrem o processo

---

## Drawer de Detalhes do Processo

### Layout do Drawer

```text
+------------------------------------------------+
| [<] Detalhes do Processo                  [X]  |
+------------------------------------------------+
| Maria Silva vs. Banco XYZ                      |
| Processo: 0000000-00.0000.0.00.0000            |
| Vara: 1a Vara Civel - Comarca de Sao Paulo     |
+------------------------------------------------+

[Dados] [Tarefas] [Atividades] [Documentos] [Financeiro]

+------------------------------------------------+
| ETAPA ATUAL                                    |
| [Documentacao] ------>  [Selecionar Etapa v]   |
|                                                |
| Prazo desta etapa: 15/02/2026                  |
| Prioridade: [Alta v]                           |
| Responsavel: [Selecionar v]                    |
+------------------------------------------------+

| CHECKLIST DE TAREFAS                           |
| [x] Coletar RG e CPF                           |
| [x] Coletar comprovante de endereco            |
| [ ] Coletar contrato original                  |
| [ ] Elaborar petição inicial                   |
| [+ Adicionar tarefa]                           |
+------------------------------------------------+

| PROXIMOS PRAZOS                                |
| 15/02 - Audiencia de conciliacao               |
| 20/02 - Prazo para manifestacao                |
+------------------------------------------------+

[Editar Processo] [Ver Peticoes] [Abrir Financeiro]
```

---

## Integracoes com Modulos Existentes

### Com Clientes

- Ao criar processo pelo pipeline, seleciona cliente existente
- No card mostra nome do cliente
- Link direto para pagina do cliente

### Com Processos (Cases)

- Pipeline usa a tabela `cases` como base
- Adiciona campos de controle via `case_pipeline`
- Todos os processos existentes aparecem no pipeline (etapa padrao)

### Com Agenda (Deadlines)

- Prazos e audiencias aparecem no processo
- Ao mover para etapa "Audiencia Marcada", sugere criar deadline
- Calendario do pipeline mostra deadlines

### Com Peticoes

- Mostra peticoes vinculadas ao processo
- Botao rapido para gerar nova peticao
- Ao gerar peticao, marca tarefa como concluida

### Com Financeiro

- Mostra resumo financeiro do processo
- Receitas e custas vinculadas
- Saldo do processo (lucro/prejuizo)

### Com Acompanhamento

- Se processo tem numero CNJ, mostra ultimas movimentacoes
- Link para acompanhamento detalhado

---

## Rotas a Adicionar

```text
/pipeline                    -> Pagina principal do CRM/Kanban
/pipeline/settings           -> Configuracoes de etapas
```

---

## Atualizacao do Sidebar

Adicionar no menu "Juridico":

```text
{ to: '/pipeline', icon: Kanban, label: 'Gestao de Processos' },
```

Posicao: Apos "Processos" e antes de "Peticoes"

---

## Arquivos a Criar

### Paginas (2)

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Pipeline.tsx` | Pagina principal do CRM |
| `src/pages/PipelineSettings.tsx` | Config de etapas |

### Componentes (14)

| Arquivo | Descricao |
|---------|-----------|
| `src/components/pipeline/PipelineBoard.tsx` | Board Kanban com drag-drop |
| `src/components/pipeline/PipelineColumn.tsx` | Coluna/etapa do Kanban |
| `src/components/pipeline/PipelineCard.tsx` | Card do processo |
| `src/components/pipeline/PipelineListView.tsx` | Visualizacao em lista |
| `src/components/pipeline/PipelineCalendarView.tsx` | Visualizacao calendario |
| `src/components/pipeline/PipelineFilters.tsx` | Filtros e busca |
| `src/components/pipeline/PipelineViewToggle.tsx` | Toggle de visualizacao |
| `src/components/pipeline/ProcessDetailSheet.tsx` | Drawer de detalhes |
| `src/components/pipeline/StageManager.tsx` | Gerenciador de etapas |
| `src/components/pipeline/QuickAddProcess.tsx` | Modal novo processo |
| `src/components/pipeline/TaskChecklist.tsx` | Checklist de tarefas |
| `src/components/pipeline/ActivityTimeline.tsx` | Timeline de atividades |
| `src/components/pipeline/PriorityBadge.tsx` | Badge de prioridade |
| `src/components/pipeline/DueDateBadge.tsx` | Badge de prazo |

### Tipos (1)

| Arquivo | Descricao |
|---------|-----------|
| `src/types/pipeline.ts` | Tipos do CRM/Pipeline |

---

## Migracao de Banco de Dados

```sql
-- Criar enum de prioridade
CREATE TYPE case_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Tabela de etapas
CREATE TABLE case_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de posicao no pipeline
CREATE TABLE case_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES case_stages(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  priority case_priority DEFAULT 'media',
  due_date DATE,
  assigned_to TEXT,
  notes TEXT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(case_id)
);

-- Tabela de atividades
CREATE TABLE case_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  from_stage_id UUID REFERENCES case_stages(id),
  to_stage_id UUID REFERENCES case_stages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de tarefas
CREATE TABLE case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_tasks ENABLE ROW LEVEL SECURITY;

-- Policies para case_stages
CREATE POLICY "Users can view their stages" ON case_stages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their stages" ON case_stages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their stages" ON case_stages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their stages" ON case_stages
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Policies para case_pipeline
CREATE POLICY "Users can view their pipeline" ON case_pipeline
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pipeline entries" ON case_pipeline
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pipeline" ON case_pipeline
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete pipeline entries" ON case_pipeline
  FOR DELETE USING (auth.uid() = user_id);

-- Policies similares para activities e tasks
```

---

## Fluxos de Usuario

### Fluxo 1: Visualizar Pipeline

1. Usuario clica em "Gestao de Processos" no menu
2. Ve o board Kanban com todos os processos em suas etapas
3. Pode filtrar por cliente, prioridade, tipo
4. Pode alternar para visualizacao em lista ou calendario

### Fluxo 2: Mover Processo de Etapa

1. Usuario arrasta card de "Documentacao" para "Elaboracao de Peca"
2. Sistema atualiza `case_pipeline.stage_id`
3. Sistema registra atividade em `case_activities`
4. Card aparece na nova coluna
5. Toast confirma a mudanca

### Fluxo 3: Ver Detalhes do Processo

1. Usuario clica em um card
2. Abre drawer lateral com todas as informacoes
3. Ve checklist de tarefas, prazos, historico
4. Pode editar prioridade, adicionar notas
5. Acessa links para peticoes, financeiro, cliente

### Fluxo 4: Adicionar Novo Processo pelo Pipeline

1. Usuario clica em "+ Novo Processo"
2. Abre modal com formulario simplificado
3. Seleciona cliente, tipo, parte contraria
4. Processo e criado ja na primeira etapa do pipeline
5. Card aparece na coluna "Consulta Inicial"

### Fluxo 5: Gerenciar Etapas Customizadas

1. Usuario acessa configuracoes do pipeline
2. Ve lista de etapas com drag-drop para reordenar
3. Pode criar novas etapas personalizadas
4. Pode editar nome e cor das etapas
5. Etapas padrao nao podem ser deletadas

---

## Consideracoes Tecnicas

### Drag and Drop

Usar biblioteca `@dnd-kit/core` para:
- Drag and drop suave entre colunas
- Feedback visual durante arraste
- Acessibilidade (keyboard navigation)

### Performance

- Virtualizar lista quando houver muitos cards
- Carregar dados em chunks se necessario
- Otimizar queries com indices

### Responsividade

- Mobile: Colunas em scroll horizontal ou lista simples
- Tablet: Kanban adaptado com menos colunas visiveis
- Desktop: Kanban completo

### Realtime (Futuro)

- Preparar para updates em tempo real
- Quando multi-usuario, mostrar quem esta editando

---

## Fases de Implementacao

### Fase 1: Banco de Dados
1. Criar migracao com todas as tabelas
2. Criar RLS policies
3. Inserir etapas padrao para usuarios existentes

### Fase 2: Tipos e Estrutura Base
4. Criar tipos TypeScript
5. Criar pagina Pipeline com estrutura basica
6. Adicionar rota no App.tsx
7. Adicionar item no Sidebar

### Fase 3: Visualizacao Kanban
8. Implementar PipelineBoard
9. Implementar PipelineColumn
10. Implementar PipelineCard
11. Implementar drag and drop

### Fase 4: Detalhes do Processo
12. Implementar ProcessDetailSheet
13. Implementar TaskChecklist
14. Implementar ActivityTimeline

### Fase 5: Filtros e Acoes
15. Implementar PipelineFilters
16. Implementar QuickAddProcess
17. Implementar mudanca de prioridade

### Fase 6: Visualizacoes Alternativas
18. Implementar PipelineListView
19. Implementar PipelineCalendarView
20. Implementar toggle de visualizacao

### Fase 7: Configuracoes
21. Implementar PipelineSettings
22. Implementar StageManager
23. Permitir criar/editar etapas customizadas

### Fase 8: Integracoes
24. Integrar com Financeiro (resumo no drawer)
25. Integrar com Acompanhamento (movimentacoes)
26. Integrar com Agenda (prazos)

---

## Resultado Esperado

1. **Visao Kanban profissional** - Similar ao Trello, visualmente agradavel
2. **Multiplas visualizacoes** - Kanban, Lista e Calendario
3. **Drag and drop fluido** - Mover processos entre etapas facilmente
4. **Historico completo** - Todas as movimentacoes registradas
5. **Checklist por processo** - Nao esquecer nenhuma tarefa
6. **Integracoes nativas** - Conectado com tudo que ja existe
7. **Customizavel** - Etapas e prioridades personalizaveis
8. **Visao gerencial** - Quantos processos em cada etapa, gargalos
9. **Mobile friendly** - Funciona bem no celular

