
# Plano: Filtros de Data Profissionais no Modulo Financeiro

## Visao Geral

Vou implementar filtros de data consistentes e profissionais em todas as ferramentas financeiras do sistema, permitindo analises aprofundadas por periodo em cada componente. O objetivo e transformar o modulo financeiro em uma ferramenta de gestao profissional completa.

---

## Analise da Situacao Atual

### Componentes COM filtro de data implementado:
| Componente | Tipo de Filtro | Localizacao |
|------------|----------------|-------------|
| FinanceDashboard | Select simples (7d/30d/90d/year/all) | Dashboard principal |
| DREReport | ReportFilters completo | Relatorios |
| CashFlowReport | ReportFilters completo | Relatorios |
| ClientAnalysisReport | ReportFilters completo | Relatorios |

### Componentes SEM filtro de data (precisam implementacao):
| Componente | Problema | Pagina |
|------------|----------|--------|
| **Transactions.tsx** | Carrega ultimas 100 transacoes sem filtro de periodo | /financeiro/extrato |
| **Receivables.tsx** | Lista todas as contas a receber sem filtro de periodo | /financeiro/receber |
| **Payables.tsx** | Lista todas as contas a pagar sem filtro de periodo | /financeiro/pagar |
| **FeeContracts.tsx** | Lista todos os contratos sem filtro por vigencia | /financeiro/contratos |
| **OverdueReport.tsx** | Nao tem filtro de periodo - sempre mostra tudo | Relatorios |

### Componentes de Dashboard que usam dados fixos:
| Componente | Problema |
|------------|----------|
| TopClientsChart | Usa dateRange do dashboard mas sem controle proprio |
| CategoryDistributionChart | Usa dateRange do dashboard mas sem controle proprio |
| UpcomingBills | Fixo em 7 dias |
| RecentTransactions | Fixo em ultimas 5 |

---

## Solucao Proposta

### 1. Criar Componente de Filtro Reutilizavel

Criar um componente `DateRangeFilter` aprimorado baseado no `ReportFilters` existente, porem mais compacto para uso em listagens:

```text
+----------------------------------------------------------+
| [v Periodo: Este mes] | [01/02/2026 - 28/02/2026] [Limpar]|
+----------------------------------------------------------+
```

**Presets disponiveis:**
- Hoje
- Ultimos 7 dias
- Este mes
- Mes anterior
- Ultimos 3 meses
- Este ano
- Personalizado (Date Range Picker)

### 2. Implementar Filtros por Pagina

#### A. Transactions.tsx (Extrato)
- Adicionar filtro de periodo para `transaction_date`
- Filtrar queries Supabase por data
- Atualizar totais dinamicamente

#### B. Receivables.tsx (Contas a Receber)
- Adicionar filtro de periodo para `due_date`
- Opcao de filtrar por `created_at` ou `payment_date`
- Cards de resumo refletem periodo selecionado

#### C. Payables.tsx (Contas a Pagar)
- Adicionar filtro de periodo para `due_date`
- Mesma logica de Receivables

#### D. FeeContracts.tsx (Contratos)
- Adicionar filtro por vigencia
- Filtrar contratos ativos no periodo selecionado

#### E. OverdueReport.tsx (Inadimplencia)
- Adicionar filtro de periodo
- Filtrar por `due_date` dos titulos atrasados
- Permitir analise historica de inadimplencia

---

## Arquivos a Modificar

### 1. Criar novo componente
**`src/components/finance/DateRangeFilter.tsx`** (novo)

Componente compacto de filtro de data para listagens, com:
- Select de presets (Este mes, Mes anterior, etc.)
- Date Range Picker
- Botao limpar
- Callback onChange

### 2. Modificar paginas de listagem

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/finance/Transactions.tsx` | + estado dateRange, + DateRangeFilter, + filtro na query |
| `src/pages/finance/Receivables.tsx` | + estado dateRange, + DateRangeFilter, + filtro na query |
| `src/pages/finance/Payables.tsx` | + estado dateRange, + DateRangeFilter, + filtro na query |
| `src/pages/finance/FeeContracts.tsx` | + estado dateRange, + DateRangeFilter, + filtro na query |
| `src/components/finance/reports/OverdueReport.tsx` | + ReportFilters, + filtro na query |

---

## Detalhes Tecnicos de Implementacao

### Interface DateRangeFilter

```typescript
interface DateRangeFilterProps {
  dateRange: { from: Date; to: Date } | null;
  onDateRangeChange: (range: { from: Date; to: Date } | null) => void;
  filterField?: 'due_date' | 'transaction_date' | 'created_at' | 'payment_date';
  onFilterFieldChange?: (field: string) => void;
  showFieldSelector?: boolean;
  compact?: boolean;
}
```

### Presets de Periodo

```typescript
type PresetPeriod = 
  | 'today' 
  | 'week' 
  | 'month' 
  | 'last_month' 
  | 'quarter' 
  | 'year' 
  | 'all' 
  | 'custom';
```

### Exemplo de Query Filtrada (Transactions)

```typescript
// Antes
const { data } = await supabase
  .from('transactions')
  .select('*')
  .order('transaction_date', { ascending: false })
  .limit(100);

// Depois
let query = supabase
  .from('transactions')
  .select('*')
  .order('transaction_date', { ascending: false });

if (dateRange) {
  query = query
    .gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'))
    .lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'));
} else {
  query = query.limit(100);
}

const { data } = await query;
```

---

## Layout dos Filtros por Pagina

### Transactions.tsx
```text
+------------------------------------------------------------------+
| Extrato                                            [+ Novo Lanc] |
| Visualize todas as movimentacoes financeiras                     |
+------------------------------------------------------------------+
| [v Periodo: Este mes] [01/02/2026 - 28/02/2026] [Limpar]         |
+------------------------------------------------------------------+
| Cards: Entradas | Saidas | Saldo do Periodo                      |
+------------------------------------------------------------------+
| [Buscar...] [v Tipo: Todos]                                      |
| Tabela de transacoes filtradas                                   |
+------------------------------------------------------------------+
```

### Receivables.tsx / Payables.tsx
```text
+------------------------------------------------------------------+
| Contas a Receber                                   [+ Nova Rec]  |
| Gerencie seus recebiveis e honorarios                            |
+------------------------------------------------------------------+
| [v Periodo: Este mes] [v Filtrar por: Vencimento] [01/02 - 28/02]|
+------------------------------------------------------------------+
| Cards: Pendente | Atrasado                                       |
+------------------------------------------------------------------+
| [Buscar...] [v Status: Todos]                                    |
| Tabela filtrada                                                  |
+------------------------------------------------------------------+
```

### OverdueReport.tsx
```text
+------------------------------------------------------------------+
| Inadimplencia                                      [PDF] [CSV]   |
+------------------------------------------------------------------+
| [v Periodo] [01/01/2026 - 28/02/2026] [Vencidos no periodo]      |
+------------------------------------------------------------------+
| Cards Aging: 1-15 dias | 16-30 dias | 31-60 dias | >60 dias      |
+------------------------------------------------------------------+
| Tabela de titulos atrasados filtrados por periodo                |
+------------------------------------------------------------------+
```

---

## Melhorias Adicionais

### 1. Persistencia de Filtros
- Salvar ultimo filtro usado em localStorage
- Restaurar ao reabrir a pagina

### 2. URL Query Parameters
- Permitir compartilhar links com filtros aplicados
- Ex: `/financeiro/receber?from=2026-01-01&to=2026-01-31`

### 3. Exportacao com Filtros
- Exportar PDF/CSV respeitando o periodo selecionado
- Incluir periodo no cabecalho do relatorio

---

## Ordem de Implementacao

1. **Criar DateRangeFilter.tsx** - Componente base reutilizavel
2. **Transactions.tsx** - Primeira implementacao (mais simples)
3. **Receivables.tsx** - Com seletor de campo de data
4. **Payables.tsx** - Clonar logica de Receivables
5. **FeeContracts.tsx** - Filtro por vigencia
6. **OverdueReport.tsx** - Adicionar ReportFilters

---

## Resultados Esperados

1. **Analises profissionais** - Usuario pode analisar qualquer periodo especifico
2. **Consistencia visual** - Mesmo componente de filtro em todas as paginas
3. **Performance** - Queries filtradas retornam menos dados
4. **Relatorios precisos** - Exportacoes respeitam periodo selecionado
5. **UX profissional** - Presets rapidos + date picker para flexibilidade
