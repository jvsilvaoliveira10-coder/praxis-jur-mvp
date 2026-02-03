
# Plano Completo: Modulo Financeiro Funcional + Sidebar Reorganizado

## Diagnostico do Estado Atual

### O que foi implementado
- Dashboard financeiro com cards de estatisticas e graficos
- Componentes visuais (FinanceStatsCard, CashFlowChart, RevenueExpenseChart, etc)
- Tipos TypeScript completos (src/types/finance.ts)
- Tabelas no banco de dados (receivables, payables, transactions, fee_contracts, financial_accounts, financial_categories, cost_centers)
- RLS policies configuradas

### O que esta faltando
1. **Rotas nao existem** - Apenas `/financeiro` esta configurado em App.tsx
2. **Paginas nao existem** - Apenas FinanceDashboard.tsx foi criado
3. **Formularios nao existem** - Nao ha CRUD para nenhuma entidade financeira
4. **Sidebar esta linear** - Nao ha agrupamento por categorias pai

---

## Parte 1: Reorganizacao do Sidebar

### Nova Estrutura de Navegacao

```text
+---------------------------+
|  PRAXIS AI                |
+---------------------------+
|                           |
|  [v] Juridico             |  <- Categoria pai colapsavel
|     - Dashboard           |
|     - Clientes            |
|     - Processos           |
|     - Peticoes            |
|     - Modelos             |
|     - Jurisprudencia      |
|     - Acompanhamento      |
|     - Agenda              |
|                           |
|  [v] Financeiro           |  <- Categoria pai colapsavel
|     - Painel              |
|     - Contas a Receber    |
|     - Contas a Pagar      |
|     - Extrato             |
|     - Contratos           |
|     - Configuracoes       |
|                           |
+---------------------------+
|  Usuario                  |
|  [Sair]                   |
+---------------------------+
```

### Arquivos a Modificar
- `src/components/layout/Sidebar.tsx` - Reescrever com categorias colapsaveis

### Comportamento
- Categorias iniciam abertas
- Clique na categoria abre/fecha
- Estado de aberto/fechado persiste durante a sessao
- Indicador visual quando ha itens ativos dentro da categoria fechada

---

## Parte 2: Paginas Financeiras a Criar

### 2.1 Contas a Receber

#### Listagem (`/financeiro/receber`)
**Arquivo:** `src/pages/finance/Receivables.tsx`

**Funcionalidades:**
- Tabela com todos os recebiveis do usuario
- Filtros: status, periodo, cliente, tipo de recebivel
- Busca por descricao
- Indicadores visuais de status (cores)
- Acoes: editar, excluir, marcar como pago
- Totalizadores: total pendente, total atrasado

**Colunas:**
| Coluna | Descricao |
|--------|-----------|
| Descricao | Texto do recebivel |
| Cliente | Nome do cliente (se vinculado) |
| Tipo | honorario_contratual, consulta, etc |
| Valor | Formatado em R$ |
| Vencimento | Data formatada |
| Status | Badge colorido |
| Acoes | Editar, Excluir, Receber |

#### Formulario (`/financeiro/receber/novo` e `/financeiro/receber/:id/editar`)
**Arquivo:** `src/pages/finance/ReceivableForm.tsx`

**Campos:**
- Descricao (obrigatorio)
- Tipo de recebivel (select)
- Valor (number, obrigatorio)
- Data de vencimento (date picker, obrigatorio)
- Cliente (select opcional, busca clientes existentes)
- Processo (select opcional, filtra por cliente selecionado)
- Categoria (select de financial_categories tipo receita)
- Recorrencia (unico, mensal, trimestral, anual)
- Data fim recorrencia (se recorrencia != unico)
- Parcelamento (checkbox + numero de parcelas)
- Observacoes (textarea)

---

### 2.2 Contas a Pagar

#### Listagem (`/financeiro/pagar`)
**Arquivo:** `src/pages/finance/Payables.tsx`

**Funcionalidades:**
- Tabela com todos os pagaveis do usuario
- Filtros: status, periodo, fornecedor, tipo
- Busca por descricao ou fornecedor
- Indicadores visuais de status
- Acoes: editar, excluir, marcar como pago

**Colunas:**
| Coluna | Descricao |
|--------|-----------|
| Descricao | Texto da despesa |
| Fornecedor | Nome do fornecedor |
| Tipo | custas_processuais, aluguel, etc |
| Valor | Formatado em R$ |
| Vencimento | Data formatada |
| Status | Badge colorido |
| Acoes | Editar, Excluir, Pagar |

#### Formulario (`/financeiro/pagar/novo` e `/financeiro/pagar/:id/editar`)
**Arquivo:** `src/pages/finance/PayableForm.tsx`

**Campos:**
- Descricao (obrigatorio)
- Tipo de despesa (select)
- Fornecedor/Credor (texto)
- Valor (number, obrigatorio)
- Data de vencimento (date picker, obrigatorio)
- Processo (select opcional - para custas processuais)
- Categoria (select de financial_categories tipo despesa)
- Codigo de barras (texto para boletos)
- Recorrencia (unico, mensal, trimestral, anual)
- Observacoes (textarea)

---

### 2.3 Extrato/Transacoes

#### Listagem (`/financeiro/extrato`)
**Arquivo:** `src/pages/finance/Transactions.tsx`

**Funcionalidades:**
- Lista de todas as movimentacoes reais
- Filtros: periodo, conta, tipo (receita/despesa)
- Totalizadores: entradas, saidas, saldo do periodo
- Indicador de transacao confirmada
- Modal para novo lancamento manual

**Colunas:**
| Coluna | Descricao |
|--------|-----------|
| Data | Data da transacao |
| Descricao | Texto |
| Tipo | Receita ou Despesa |
| Conta | Conta bancaria |
| Forma Pgto | PIX, boleto, etc |
| Valor | Formatado com sinal |
| Confirmado | Check se conciliado |

#### Modal de Lancamento
**Arquivo:** `src/components/finance/TransactionModal.tsx`

**Campos:**
- Tipo (receita ou despesa)
- Descricao
- Valor
- Data
- Conta
- Forma de pagamento
- Vincular a recebivel/pagavel existente (opcional)
- Observacoes

---

### 2.4 Contratos de Honorarios

#### Listagem (`/financeiro/contratos`)
**Arquivo:** `src/pages/finance/FeeContracts.tsx`

**Funcionalidades:**
- Lista de contratos de honorarios
- Filtros: ativos/inativos, cliente
- Valor mensal recorrente total
- Acoes: editar, desativar, gerar recebiveis

**Colunas:**
| Coluna | Descricao |
|--------|-----------|
| Nome | Nome do contrato |
| Cliente | Nome do cliente |
| Tipo | mensal_fixo, exito, por_ato |
| Valor Mensal | Se aplicavel |
| Dia Vencimento | 1-31 |
| Status | Ativo/Inativo |
| Acoes | Editar, Desativar |

#### Formulario (`/financeiro/contratos/novo` e `/financeiro/contratos/:id/editar`)
**Arquivo:** `src/pages/finance/FeeContractForm.tsx`

**Campos:**
- Nome do contrato (obrigatorio)
- Cliente (select obrigatorio)
- Processo (select opcional)
- Tipo de contrato (mensal_fixo, por_ato, exito, misto)
- Valor mensal (se tipo inclui mensalidade)
- Percentual de exito (se tipo inclui exito)
- Valor por ato (se tipo inclui por_ato)
- Dia de vencimento (1-31)
- Data inicio (obrigatorio)
- Data fim (opcional)
- Gerar recebiveis automaticamente (checkbox)
- Observacoes

---

### 2.5 Configuracoes Financeiras

#### Pagina (`/financeiro/config`)
**Arquivo:** `src/pages/finance/FinanceSettings.tsx`

**Secoes em Tabs:**

**Tab 1: Contas Bancarias**
- Lista de contas
- Botao adicionar
- Editar inline ou modal
- Campos: nome, tipo, banco, saldo inicial, cor, ativo

**Tab 2: Categorias**
- Lista hierarquica (receitas e despesas)
- Botao adicionar
- Editar inline
- Campos: nome, tipo, cor, icone

**Tab 3: Centros de Custo**
- Lista de centros
- Botao adicionar
- Campos: nome, codigo, descricao, ativo

---

## Parte 3: Componentes Auxiliares

### Modais de Acao Rapida

#### QuickPaymentModal
**Arquivo:** `src/components/finance/QuickPaymentModal.tsx`

Para registrar recebimento/pagamento sem navegar:
- Valor a pagar/receber
- Conta destino
- Forma de pagamento
- Data do pagamento
- Cria transacao e atualiza status

#### QuickReceivableModal
**Arquivo:** `src/components/finance/QuickReceivableModal.tsx`

Criar recebivel rapidamente do dashboard:
- Campos essenciais
- Redirect para listagem apos salvar

### Seletores

#### ClientSelector
**Arquivo:** `src/components/finance/ClientSelector.tsx`

Combobox com busca para selecionar cliente

#### CaseSelector
**Arquivo:** `src/components/finance/CaseSelector.tsx`

Combobox com busca, filtra por cliente se selecionado

#### CategorySelector
**Arquivo:** `src/components/finance/CategorySelector.tsx`

Select com categorias agrupadas por tipo

---

## Parte 4: Rotas a Adicionar

**Arquivo:** `src/App.tsx`

```text
Novas rotas dentro do MainLayout:

/financeiro                         -> FinanceDashboard (ja existe)
/financeiro/receber                 -> Receivables
/financeiro/receber/novo            -> ReceivableForm
/financeiro/receber/:id/editar      -> ReceivableForm
/financeiro/pagar                   -> Payables
/financeiro/pagar/novo              -> PayableForm
/financeiro/pagar/:id/editar        -> PayableForm
/financeiro/extrato                 -> Transactions
/financeiro/contratos               -> FeeContracts
/financeiro/contratos/novo          -> FeeContractForm
/financeiro/contratos/:id/editar    -> FeeContractForm
/financeiro/config                  -> FinanceSettings
```

---

## Parte 5: Arquivos a Criar

### Paginas (14 arquivos)

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/finance/Receivables.tsx` | Listagem de contas a receber |
| `src/pages/finance/ReceivableForm.tsx` | Formulario de recebivel |
| `src/pages/finance/Payables.tsx` | Listagem de contas a pagar |
| `src/pages/finance/PayableForm.tsx` | Formulario de despesa |
| `src/pages/finance/Transactions.tsx` | Extrato/lancamentos |
| `src/pages/finance/FeeContracts.tsx` | Listagem de contratos |
| `src/pages/finance/FeeContractForm.tsx` | Formulario de contrato |
| `src/pages/finance/FinanceSettings.tsx` | Configuracoes (contas, categorias) |

### Componentes (6 arquivos)

| Arquivo | Descricao |
|---------|-----------|
| `src/components/finance/QuickPaymentModal.tsx` | Modal para pagar/receber rapido |
| `src/components/finance/TransactionModal.tsx` | Modal para novo lancamento |
| `src/components/finance/ClientSelector.tsx` | Combobox de clientes |
| `src/components/finance/CaseSelector.tsx` | Combobox de processos |
| `src/components/finance/CategorySelector.tsx` | Select de categorias |
| `src/components/finance/FinanceFilters.tsx` | Filtros reutilizaveis |

### Modificacoes (2 arquivos)

| Arquivo | Modificacao |
|---------|-------------|
| `src/App.tsx` | Adicionar todas as rotas financeiras |
| `src/components/layout/Sidebar.tsx` | Reescrever com categorias colapsaveis |

---

## Parte 6: Fluxos de Usuario

### Fluxo: Registrar Nova Receita
1. Usuario clica em "Nova Receita" no dashboard
2. Navega para `/financeiro/receber/novo`
3. Preenche formulario com dados
4. Seleciona cliente (opcional)
5. Clica em "Salvar"
6. Recebivel criado com status "pendente"
7. Redirect para listagem

### Fluxo: Receber Pagamento
1. Na listagem de recebiveis, usuario clica em "Receber"
2. Abre modal QuickPaymentModal
3. Confirma valor, conta e forma de pagamento
4. Sistema cria transacao vinculada
5. Atualiza status do recebivel para "pago"
6. Atualiza saldo da conta

### Fluxo: Pagar Conta
1. Na listagem de pagaveis, usuario clica em "Pagar"
2. Abre modal QuickPaymentModal
3. Confirma dados
4. Sistema cria transacao de saida
5. Atualiza status do pagavel para "pago"
6. Atualiza saldo da conta (trigger existente)

---

## Parte 7: Fases de Implementacao

### Fase 1: Sidebar Reorganizado
1. Reescrever Sidebar.tsx com categorias colapsaveis
2. Testar navegacao em desktop e mobile

### Fase 2: Rotas e Estrutura Base
3. Adicionar todas as rotas em App.tsx
4. Criar paginas placeholder para evitar erros 404

### Fase 3: Contas a Receber (Core)
5. Implementar Receivables.tsx (listagem)
6. Implementar ReceivableForm.tsx (formulario)
7. Testar CRUD completo

### Fase 4: Contas a Pagar (Core)
8. Implementar Payables.tsx (listagem)
9. Implementar PayableForm.tsx (formulario)
10. Testar CRUD completo

### Fase 5: Acoes de Pagamento
11. Implementar QuickPaymentModal
12. Integrar com listagens
13. Testar fluxo de pagamento/recebimento

### Fase 6: Extrato
14. Implementar Transactions.tsx
15. Implementar TransactionModal
16. Testar lancamentos manuais

### Fase 7: Contratos de Honorarios
17. Implementar FeeContracts.tsx
18. Implementar FeeContractForm.tsx
19. Testar criacao de contratos

### Fase 8: Configuracoes
20. Implementar FinanceSettings.tsx com tabs
21. CRUD de contas bancarias
22. CRUD de categorias
23. Testar configuracoes

---

## Consideracoes Tecnicas

### Padrao de Codigo
- Seguir estrutura de ClientForm.tsx para formularios
- Seguir estrutura de Clients.tsx para listagens
- Usar componentes shadcn/ui existentes
- Validacao com Zod
- Toast para feedback

### Seguranca
- Todas as queries incluem user_id implicitamente via RLS
- Validar dados antes de enviar ao banco
- Nao expor IDs em URLs desnecessariamente

### Performance
- Paginacao em listagens com muitos registros
- Loading states em todas as operacoes
- Queries paralelas onde possivel

### Responsividade
- Mobile: Cards ao inves de tabelas
- Desktop: Tabelas com todas as colunas
- Modais adaptaveis ao tamanho da tela

---

## Resultado Esperado

1. **Sidebar organizado** - Duas categorias pai claras (Juridico e Financeiro)
2. **CRUD completo** - Criar, ler, atualizar e excluir para todas as entidades
3. **Fluxo de pagamento** - Registrar pagamentos e recebimentos facilmente
4. **Contratos funcionais** - Gerenciar honorarios recorrentes
5. **Configuracoes acessiveis** - Gerenciar contas e categorias
6. **Zero erros 404** - Todas as rotas funcionando
7. **MVP pronto para producao** - Modulo financeiro completo e utilizavel
