
# Plano: Modulo Financeiro Profissional para Escritorios de Advocacia

## Visao Geral

Este plano detalha a implementacao de um modulo financeiro completo e profissional para o Praxis AI, permitindo que advogados gerenciem toda a saude financeira do escritorio em um unico sistema. O modulo incluira dashboard financeiro, contas a pagar/receber, controle de honorarios, fluxo de caixa, relatorios e integracao com processos/clientes existentes.

---

## Analise do Sistema Atual

### Entidades Existentes (que se relacionarao com o financeiro)
- **Clientes** (clients) - fonte de receita
- **Processos** (cases) - podem ter honorarios vinculados
- **Peticoes** (petitions) - podem gerar cobrancas por peca

### Gaps Identificados
- Nenhuma tabela financeira existe
- Nao ha controle de honorarios por cliente/processo
- Nao ha fluxo de caixa ou DRE
- Dashboard atual mostra apenas metricas de producao (clientes, processos, peticoes)

---

## Arquitetura do Modulo Financeiro

```text
+-------------------------------------------------------------------+
|                    DASHBOARD FINANCEIRO                            |
|  +-------------+  +-------------+  +-------------+  +-------------+|
|  | Receita     |  | Despesas    |  | Saldo       |  | A Receber  ||
|  | do Mes      |  | do Mes      |  | Atual       |  | Atrasado   ||
|  +-------------+  +-------------+  +-------------+  +-------------+|
|                                                                    |
|  +---------------------------+  +---------------------------+      |
|  |   Fluxo de Caixa         |  |   Receitas vs Despesas    |      |
|  |   (Grafico de Area)      |  |   (Grafico de Barras)     |      |
|  +---------------------------+  +---------------------------+      |
|                                                                    |
|  +---------------------------+  +---------------------------+      |
|  |   Contas a Vencer (7d)   |  |   Maiores Clientes        |      |
|  |   (Lista com alertas)    |  |   (Ranking de Receita)    |      |
|  +---------------------------+  +---------------------------+      |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|                    CONTAS A RECEBER                                |
|  - Honorarios contratuais (mensais, fixos)                        |
|  - Honorarios por exito                                            |
|  - Consultas avulsas                                               |
|  - Parcelas de acordos                                             |
|  - Vinculacao com Cliente + Processo (opcional)                   |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|                    CONTAS A PAGAR                                  |
|  - Custas processuais                                              |
|  - Despesas operacionais (aluguel, software, etc)                 |
|  - Impostos (ISS, IR)                                              |
|  - Fornecedores                                                    |
|  - Funcionarios/Pro-labore                                         |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
|                    TRANSACOES                                      |
|  - Registro de pagamentos recebidos                               |
|  - Registro de pagamentos efetuados                               |
|  - Vinculacao automatica com contas                               |
|  - Conciliacao bancaria manual                                    |
+-------------------------------------------------------------------+
```

---

## Estrutura do Banco de Dados

### ENUMs Necessarios

```text
transaction_type: 'receita' | 'despesa'
payment_status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'parcial'
recurrence_type: 'unico' | 'semanal' | 'mensal' | 'trimestral' | 'anual'
receivable_type: 'honorario_contratual' | 'honorario_exito' | 'consulta' | 'acordo' | 'reembolso' | 'outros'
payable_type: 'custas_processuais' | 'aluguel' | 'software' | 'impostos' | 'funcionarios' | 'prolabore' | 'fornecedor' | 'outros'
payment_method: 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'dinheiro' | 'cheque'
```

### Tabela: `financial_accounts`
Contas bancarias/caixas do escritorio.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| name | TEXT | Nome da conta (ex: "Conta Principal Itau") |
| account_type | TEXT | banco, caixa, carteira_digital |
| bank_name | TEXT | Nome do banco (opcional) |
| initial_balance | NUMERIC(12,2) | Saldo inicial |
| current_balance | NUMERIC(12,2) | Saldo atual (calculado) |
| is_active | BOOLEAN | Se a conta esta ativa |
| color | TEXT | Cor para identificacao visual |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `financial_categories`
Categorias para classificacao de receitas/despesas.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| name | TEXT | Nome da categoria |
| type | transaction_type | receita ou despesa |
| parent_id | UUID | FK para categoria pai (hierarquia) |
| color | TEXT | Cor para graficos |
| icon | TEXT | Icone (nome do Lucide icon) |
| is_system | BOOLEAN | Se e categoria do sistema (nao editavel) |
| created_at | TIMESTAMPTZ | Data de criacao |

### Tabela: `receivables` (Contas a Receber)
Todas as receitas esperadas do escritorio.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| client_id | UUID | FK para clients (opcional) |
| case_id | UUID | FK para cases (opcional) |
| category_id | UUID | FK para financial_categories |
| receivable_type | receivable_type | Tipo do recebivel |
| description | TEXT | Descricao detalhada |
| amount | NUMERIC(12,2) | Valor total |
| amount_paid | NUMERIC(12,2) | Valor ja pago (para parciais) |
| due_date | DATE | Data de vencimento |
| payment_date | DATE | Data do pagamento efetivo |
| status | payment_status | Status atual |
| recurrence | recurrence_type | Tipo de recorrencia |
| recurrence_end_date | DATE | Fim da recorrencia |
| installments_total | INTEGER | Total de parcelas |
| installment_number | INTEGER | Numero da parcela atual |
| parent_receivable_id | UUID | FK para receivable pai (parcelamento) |
| notes | TEXT | Observacoes |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `payables` (Contas a Pagar)
Todas as despesas e obrigacoes do escritorio.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| case_id | UUID | FK para cases (opcional - custas processuais) |
| category_id | UUID | FK para financial_categories |
| payable_type | payable_type | Tipo da despesa |
| supplier_name | TEXT | Nome do fornecedor/credor |
| description | TEXT | Descricao detalhada |
| amount | NUMERIC(12,2) | Valor total |
| amount_paid | NUMERIC(12,2) | Valor ja pago |
| due_date | DATE | Data de vencimento |
| payment_date | DATE | Data do pagamento efetivo |
| status | payment_status | Status atual |
| recurrence | recurrence_type | Tipo de recorrencia |
| recurrence_end_date | DATE | Fim da recorrencia |
| installments_total | INTEGER | Total de parcelas |
| installment_number | INTEGER | Numero da parcela atual |
| parent_payable_id | UUID | FK para payable pai |
| barcode | TEXT | Codigo de barras (boleto) |
| notes | TEXT | Observacoes |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `transactions` (Movimentacoes)
Registro de todas as movimentacoes financeiras reais.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| account_id | UUID | FK para financial_accounts |
| receivable_id | UUID | FK para receivables (opcional) |
| payable_id | UUID | FK para payables (opcional) |
| category_id | UUID | FK para financial_categories |
| type | transaction_type | receita ou despesa |
| description | TEXT | Descricao |
| amount | NUMERIC(12,2) | Valor da transacao |
| transaction_date | DATE | Data da transacao |
| payment_method | payment_method | Forma de pagamento |
| is_confirmed | BOOLEAN | Se foi conciliado/confirmado |
| notes | TEXT | Observacoes |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `fee_contracts` (Contratos de Honorarios)
Contratos de honorarios recorrentes com clientes.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| client_id | UUID | FK para clients |
| case_id | UUID | FK para cases (opcional) |
| contract_name | TEXT | Nome/identificacao do contrato |
| contract_type | TEXT | mensal_fixo, por_ato, exito, misto |
| monthly_amount | NUMERIC(12,2) | Valor mensal (se aplicavel) |
| success_fee_percentage | NUMERIC(5,2) | Percentual de exito (se aplicavel) |
| per_act_amount | NUMERIC(12,2) | Valor por ato (se aplicavel) |
| billing_day | INTEGER | Dia do vencimento (1-31) |
| start_date | DATE | Inicio do contrato |
| end_date | DATE | Fim do contrato (opcional) |
| is_active | BOOLEAN | Se o contrato esta ativo |
| auto_generate_receivables | BOOLEAN | Gerar recebiveis automaticamente |
| notes | TEXT | Observacoes |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `cost_centers` (Centros de Custo)
Para escritorios maiores que precisam separar custos por area.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| user_id | UUID | FK para auth.users |
| name | TEXT | Nome do centro de custo |
| code | TEXT | Codigo (ex: "ADM", "TRB", "CIV") |
| description | TEXT | Descricao |
| is_active | BOOLEAN | Se esta ativo |
| created_at | TIMESTAMPTZ | Data de criacao |

---

## Funcionalidades por Modulo

### 1. Dashboard Financeiro (/financeiro)

**Cards de Resumo:**
- Receita do Mes (total de transacoes tipo 'receita' no mes)
- Despesas do Mes (total de transacoes tipo 'despesa' no mes)
- Saldo em Contas (soma de current_balance das contas ativas)
- A Receber Atrasado (soma de receivables com status 'atrasado')
- A Pagar Hoje (payables com due_date = hoje e status pendente)

**Graficos:**
- Fluxo de Caixa Projetado (12 meses - receivables + payables futuros)
- Receitas vs Despesas (barras comparativas por mes)
- Distribuicao por Categoria (pizza para despesas)
- Evolucao do Saldo (linha temporal)

**Listas Rapidas:**
- Proximos Vencimentos (7 dias - payables + receivables)
- Ultimas Movimentacoes (5 transacoes mais recentes)
- Top 5 Clientes por Receita (ranking do mes/ano)

**Alertas Inteligentes:**
- Contas vencidas nao pagas
- Fluxo de caixa negativo projetado
- Clientes com pagamento atrasado

### 2. Contas a Receber (/financeiro/receber)

**Listagem:**
- Filtros: status, periodo, cliente, tipo, processo
- Ordenacao: vencimento, valor, cliente
- Busca: por descricao ou cliente
- Visualizacao: tabela ou cards
- Indicadores visuais: cores por status, icones por tipo

**Formulario de Cadastro:**
- Selecao de cliente (autocomplete)
- Vinculacao com processo (opcional)
- Tipo de recebivel (honorario, consulta, etc)
- Categoria financeira
- Valor e data de vencimento
- Recorrencia (se mensal, trimestral, etc)
- Parcelamento (dividir em X parcelas)
- Observacoes

**Acoes:**
- Registrar Recebimento (abre modal para confirmar pagamento)
- Editar
- Excluir
- Duplicar (para criar similar)
- Gerar Link de Pagamento (futuro - Stripe)

### 3. Contas a Pagar (/financeiro/pagar)

**Listagem:**
- Filtros: status, periodo, fornecedor, tipo, processo
- Ordenacao: vencimento, valor, fornecedor
- Busca: por descricao ou fornecedor
- Agenda visual (calendario de vencimentos)

**Formulario de Cadastro:**
- Fornecedor/Credor
- Vinculacao com processo (custas processuais)
- Tipo de despesa
- Categoria financeira
- Valor e data de vencimento
- Codigo de barras (boleto)
- Recorrencia
- Centro de custo (opcional)

**Acoes:**
- Registrar Pagamento
- Editar
- Excluir
- Agendar pagamento

### 4. Lancamentos/Extrato (/financeiro/extrato)

**Visualizacao:**
- Extrato por conta bancaria
- Filtros: periodo, conta, tipo, categoria
- Totalizadores: entradas, saidas, saldo

**Cadastro Rapido:**
- Lancamento manual (receita ou despesa avulsa)
- Transferencia entre contas
- Lancamento vinculado a conta a pagar/receber

**Conciliacao:**
- Marcar transacao como conciliada
- Import de extrato OFX (futuro)

### 5. Contratos de Honorarios (/financeiro/contratos)

**Listagem:**
- Contratos ativos e inativos
- Valor mensal recorrente
- Proximo vencimento
- Cliente vinculado

**Formulario:**
- Cliente
- Processo (se especifico)
- Tipo de contrato (mensal fixo, exito, por ato)
- Valores conforme tipo
- Dia de vencimento
- Geracao automatica de recebiveis

**Automacao:**
- Edge function para gerar receivables no inicio de cada mes
- Notificacao quando contrato esta proximo do fim

### 6. Relatorios (/financeiro/relatorios)

**Relatorios Disponiveis:**
- DRE Simplificado (receitas - despesas por periodo)
- Fluxo de Caixa Realizado vs Projetado
- Analise por Cliente (quanto cada cliente gerou)
- Analise por Processo (receita vs custas por processo)
- Inadimplencia (clientes com atraso)
- Custas Processuais por Processo

**Exportacao:**
- PDF (usando jsPDF ja instalado)
- Excel/CSV

### 7. Configuracoes Financeiras (/financeiro/config)

- Contas Bancarias (CRUD)
- Categorias Personalizadas (CRUD com hierarquia)
- Centros de Custo (CRUD)
- Preferencias (dia de fechamento, moeda padrao, etc)

---

## Paginas e Rotas

| Rota | Pagina | Descricao |
|------|--------|-----------|
| /financeiro | FinanceDashboard | Dashboard principal |
| /financeiro/receber | Receivables | Lista de contas a receber |
| /financeiro/receber/novo | ReceivableForm | Cadastro de recebivel |
| /financeiro/receber/:id/editar | ReceivableForm | Edicao de recebivel |
| /financeiro/pagar | Payables | Lista de contas a pagar |
| /financeiro/pagar/novo | PayableForm | Cadastro de conta a pagar |
| /financeiro/pagar/:id/editar | PayableForm | Edicao de conta a pagar |
| /financeiro/extrato | Transactions | Extrato/Lancamentos |
| /financeiro/contratos | FeeContracts | Contratos de honorarios |
| /financeiro/contratos/novo | FeeContractForm | Cadastro de contrato |
| /financeiro/contratos/:id/editar | FeeContractForm | Edicao de contrato |
| /financeiro/relatorios | FinanceReports | Central de relatorios |
| /financeiro/config | FinanceSettings | Configuracoes |
| /financeiro/contas | FinancialAccounts | Contas bancarias |

---

## Componentes a Criar

### Paginas (src/pages/finance/)
```text
FinanceDashboard.tsx
Receivables.tsx
ReceivableForm.tsx
Payables.tsx
PayableForm.tsx
Transactions.tsx
FeeContracts.tsx
FeeContractForm.tsx
FinanceReports.tsx
FinanceSettings.tsx
FinancialAccounts.tsx
AccountForm.tsx
```

### Componentes (src/components/finance/)
```text
FinanceStatsCard.tsx       - Card de metrica com icone e variacao
FinanceChart.tsx           - Wrapper para graficos financeiros
CashFlowChart.tsx          - Grafico de fluxo de caixa
RevenueExpenseChart.tsx    - Comparativo receita vs despesa
CategoryPieChart.tsx       - Pizza de categorias
UpcomingBills.tsx          - Lista de proximos vencimentos
RecentTransactions.tsx     - Ultimas movimentacoes
PaymentStatusBadge.tsx     - Badge colorido por status
RecurrenceIndicator.tsx    - Indicador de recorrencia
QuickPaymentModal.tsx      - Modal para registrar pagamento
TransferModal.tsx          - Modal para transferencia entre contas
CategorySelector.tsx       - Seletor de categoria com hierarquia
ClientRevenueRanking.tsx   - Ranking de clientes
FinanceFilters.tsx         - Filtros reutilizaveis
InstallmentGenerator.tsx   - Componente para gerar parcelas
ReportExporter.tsx         - Exportacao PDF/CSV
```

### Hooks (src/hooks/)
```text
useFinanceStats.ts         - Busca metricas do dashboard
useReceivables.ts          - CRUD de recebiveis
usePayables.ts             - CRUD de contas a pagar
useTransactions.ts         - CRUD de transacoes
useFeeContracts.ts         - CRUD de contratos
useFinancialAccounts.ts    - CRUD de contas bancarias
useCategories.ts           - CRUD de categorias
useCashFlow.ts             - Calculo de fluxo de caixa
```

### Types (src/types/finance.ts)
```text
Todos os tipos TypeScript para as entidades financeiras
Labels e constantes (RECEIVABLE_TYPE_LABELS, PAYMENT_STATUS_LABELS, etc)
```

---

## Integracao com Modulos Existentes

### Dashboard Principal
- Adicionar card "Resumo Financeiro" com:
  - Receita do mes
  - Link para "/financeiro"

### Pagina de Clientes
- Nova aba/secao "Financeiro" mostrando:
  - Total recebido do cliente
  - Contas em aberto
  - Historico de pagamentos
  - Link para criar nova receita

### Pagina de Processos
- Nova aba/secao "Custos" mostrando:
  - Custas processuais lancadas
  - Honorarios vinculados
  - Saldo: receita - custas

### Sidebar
- Novo item "Financeiro" com icone de moeda
- Submenu (se expandido): Dashboard, Receber, Pagar, Extrato

---

## Edge Functions

### `generate-recurring-receivables`
- Executada diariamente via cron
- Busca fee_contracts ativos com auto_generate_receivables = true
- Gera receivables para o mes seguinte
- Envia notificacao ao usuario

### `check-overdue-payments`
- Executada diariamente
- Atualiza status de receivables/payables vencidos para 'atrasado'
- Gera notificacoes para contas vencidas

### `calculate-account-balance`
- Trigger no insert/update/delete de transactions
- Recalcula current_balance da financial_account

---

## Regras de Negocio

### Status de Pagamento
- **Pendente**: Criado, aguardando vencimento
- **Atrasado**: Vencido e nao pago (atualizado automaticamente)
- **Pago**: Valor total recebido/pago
- **Parcial**: Parte do valor pago
- **Cancelado**: Cancelado pelo usuario

### Recorrencia
- Ao criar com recorrencia, gera apenas o primeiro registro
- Edge function gera proximos registros automaticamente
- Fim da recorrencia interrompe a geracao

### Parcelamento
- Ao parcelar, gera N registros com parent_receivable_id
- Cada parcela tem installment_number
- Status do pai reflete status geral

### Saldo de Contas
- Calculado: initial_balance + SUM(receitas) - SUM(despesas)
- Atualizado via trigger ou recalculo periodico

---

## Fases de Implementacao

### Fase 1: Infraestrutura (Prioridade Alta)
1. Criar ENUMs no banco de dados
2. Criar tabelas: financial_accounts, financial_categories, receivables, payables, transactions
3. Criar RLS policies para todas as tabelas
4. Popular categorias padrao do sistema

### Fase 2: Modulo Basico (Prioridade Alta)
5. Criar tipos TypeScript (src/types/finance.ts)
6. Criar pagina FinanceDashboard (versao inicial)
7. Criar CRUD de Contas Bancarias
8. Criar CRUD de Categorias

### Fase 3: Contas a Receber (Prioridade Alta)
9. Criar pagina Receivables (listagem)
10. Criar ReceivableForm (cadastro/edicao)
11. Implementar modal de registro de recebimento
12. Adicionar filtros e busca

### Fase 4: Contas a Pagar (Prioridade Alta)
13. Criar pagina Payables (listagem)
14. Criar PayableForm (cadastro/edicao)
15. Implementar modal de registro de pagamento
16. Adicionar filtros e busca

### Fase 5: Transacoes e Extrato (Prioridade Media)
17. Criar pagina Transactions (extrato)
18. Implementar lancamento manual
19. Implementar transferencia entre contas
20. Adicionar conciliacao

### Fase 6: Dashboard Completo (Prioridade Media)
21. Implementar todos os cards de metricas
22. Criar graficos (fluxo de caixa, comparativos)
23. Criar listas rapidas (vencimentos, ultimas transacoes)
24. Implementar alertas

### Fase 7: Contratos de Honorarios (Prioridade Media)
25. Criar tabela fee_contracts
26. Criar CRUD de contratos
27. Criar edge function de geracao automatica
28. Testar fluxo completo

### Fase 8: Relatorios (Prioridade Baixa)
29. Criar pagina FinanceReports
30. Implementar DRE simplificado
31. Implementar relatorio por cliente
32. Implementar exportacao PDF/CSV

### Fase 9: Integracoes (Prioridade Baixa)
33. Adicionar aba Financeiro em Clientes
34. Adicionar aba Custos em Processos
35. Adicionar card no Dashboard principal

### Fase 10: Automacoes (Prioridade Baixa)
36. Edge function para atualizar status de vencidos
37. Notificacoes de vencimento
38. Cron jobs para recorrencias

---

## Arquivos a Criar

### Banco de Dados
- Migration com ENUMs e tabelas
- Migration com RLS policies
- Migration com dados iniciais (categorias)

### Frontend
```text
src/types/finance.ts
src/pages/finance/FinanceDashboard.tsx
src/pages/finance/Receivables.tsx
src/pages/finance/ReceivableForm.tsx
src/pages/finance/Payables.tsx
src/pages/finance/PayableForm.tsx
src/pages/finance/Transactions.tsx
src/pages/finance/FeeContracts.tsx
src/pages/finance/FeeContractForm.tsx
src/pages/finance/FinanceReports.tsx
src/pages/finance/FinanceSettings.tsx
src/pages/finance/FinancialAccounts.tsx
src/pages/finance/AccountForm.tsx
src/components/finance/FinanceStatsCard.tsx
src/components/finance/CashFlowChart.tsx
src/components/finance/RevenueExpenseChart.tsx
src/components/finance/UpcomingBills.tsx
src/components/finance/RecentTransactions.tsx
src/components/finance/PaymentStatusBadge.tsx
src/components/finance/QuickPaymentModal.tsx
src/components/finance/CategorySelector.tsx
src/hooks/useFinanceStats.ts
src/hooks/useReceivables.ts
src/hooks/usePayables.ts
src/hooks/useTransactions.ts
```

### Backend (Edge Functions)
```text
supabase/functions/generate-recurring-receivables/index.ts
supabase/functions/check-overdue-payments/index.ts
```

### Modificacoes
- `src/App.tsx` - Adicionar rotas /financeiro/*
- `src/components/layout/Sidebar.tsx` - Adicionar item Financeiro
- `src/pages/Dashboard.tsx` - Adicionar card financeiro
- `src/pages/Clients.tsx` - (futuro) Adicionar aba financeiro
- `src/pages/Cases.tsx` - (futuro) Adicionar aba custos

---

## Consideracoes Tecnicas

### Performance
- Indices em due_date, status, user_id para queries frequentes
- Paginacao em todas as listagens
- Cache de metricas do dashboard (invalidar em transacoes)

### Seguranca
- RLS em todas as tabelas financeiras
- user_id obrigatorio em todas as queries
- Validacao de valores (nao negativos, limites)

### UX/UI
- Cores semanticas: verde (receita), vermelho (despesa), amarelo (pendente), laranja (atrasado)
- Formatacao de moeda brasileira (R$)
- Graficos responsivos
- Acoes rapidas (pagar, receber) sem navegar

### Escalabilidade
- Estrutura preparada para multi-usuario (escritorios com funcionarios)
- Centros de custo para escritorios maiores
- Relatorios customizaveis

---

## Resultado Esperado

1. **Visao 360 das financas** - Advogado ve tudo em um dashboard
2. **Controle de honorarios** - Vinculacao com clientes e processos
3. **Fluxo de caixa** - Projecao de entradas e saidas
4. **Alertas automaticos** - Notificacoes de vencimentos e inadimplencia
5. **Relatorios profissionais** - DRE, analise por cliente, exportacao
6. **Integracao completa** - Financeiro conectado com toda a operacao juridica
7. **Base para Stripe** - Estrutura pronta para integrar pagamentos online
