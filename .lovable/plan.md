
# Plano: Modulo Financeiro Profissional 360 + Central de Relatorios

## Visao Geral

Transformacao completa do modulo financeiro atual em uma ferramenta profissional de gestao financeira para escritorios de advocacia, com dashboard avancado, controles gerenciais completos, e duas centrais de relatorios: uma para o juridico e outra para o financeiro.

---

## Diagnostico do Estado Atual

### O que ja existe e funciona
- Dashboard com 4 cards de metricas (Receita, Despesa, Saldo, Atrasado)
- 2 graficos basicos (Fluxo de Caixa e Receitas vs Despesas)
- Lista de proximos vencimentos e transacoes recentes
- CRUD de Contas a Receber com filtros e modal de recebimento
- CRUD de Contas a Pagar com filtros e modal de pagamento
- Extrato de transacoes com lancamento manual
- Contratos de honorarios com listagem e formulario
- Configuracoes (Contas Bancarias, Categorias, Centros de Custo)
- Sidebar organizado em categorias (Juridico/Financeiro)

### O que precisa ser melhorado
1. **Dashboard basico demais** - precisa de mais metricas, indicadores e graficos
2. **Sem relatorios** - nao ha DRE, analise por cliente, fluxo de caixa projetado
3. **Sem integracao com juridico** - receitas/despesas nao conectadas a processos/clientes de forma visual
4. **Sem alertas visuais** - inadimplencia nao destacada
5. **Sem projecoes** - nao ha fluxo de caixa futuro
6. **Sem comparativos** - nao ha analise periodo x periodo

---

## Parte 1: Dashboard Financeiro Avancado

### Nova Estrutura de Cards (8 metricas)

```text
+------------+  +------------+  +------------+  +------------+
|  Receita   |  |  Despesas  |  |  Lucro     |  |  Saldo     |
|  do Mes    |  |  do Mes    |  |  Liquido   |  |  Total     |
| R$ 45.000  |  | R$ 18.000  |  | R$ 27.000  |  | R$ 85.000  |
|  +15.2%    |  |  +3.5%     |  |  +28.4%    |  |  +12.1%    |
+------------+  +------------+  +------------+  +------------+

+------------+  +------------+  +------------+  +------------+
|  A Receber |  |  A Pagar   |  | Inadimplen |  | Honorarios |
|  Pendente  |  |  Pendente  |  | cia (>30d) |  | Recorrente |
| R$ 32.000  |  | R$ 8.500   |  | R$ 5.200   |  | R$ 28.000  |
|  12 itens  |  |  5 itens   |  |  3 clientes|  |  8 ativos  |
+------------+  +------------+  +------------+  +------------+
```

### Novos Graficos

1. **Fluxo de Caixa Projetado (12 meses)**
   - Linha de receitas previstas (receivables pendentes)
   - Linha de despesas previstas (payables pendentes)
   - Area de saldo projetado
   - Alerta visual quando saldo projetar negativo

2. **Distribuicao por Categoria**
   - Pizza de despesas por categoria
   - Pizza de receitas por tipo (honorarios, consultas, etc)

3. **Analise de Inadimplencia**
   - Barra empilhada: 1-15 dias, 16-30 dias, 31-60 dias, >60 dias
   - Lista de clientes inadimplentes com valores

4. **Comparativo Mensal**
   - Barras lado a lado: mes atual vs mes anterior
   - Indicador de crescimento/queda

5. **Top 5 Clientes por Receita**
   - Ranking com barra de progresso
   - Valor total e percentual do faturamento

6. **Evolucao do Patrimonio**
   - Linha temporal do saldo total das contas
   - Ultimos 12 meses

### Alertas Visuais no Dashboard

- **Alerta Vermelho**: Contas vencidas ha mais de 7 dias
- **Alerta Amarelo**: Contas vencendo nos proximos 3 dias
- **Alerta Azul**: Fluxo de caixa projetado negativo
- **Alerta Verde**: Meta de receita atingida

---

## Parte 2: Melhorias nas Listagens Existentes

### Contas a Receber - Melhorias

1. **Novos filtros**:
   - Por periodo (data inicio/fim)
   - Por valor (minimo/maximo)
   - Por tipo de recebivel
   - Por processo vinculado

2. **Agrupamento visual**:
   - Agrupar por cliente
   - Agrupar por mes de vencimento
   - Agrupar por status

3. **Acoes em lote**:
   - Selecionar multiplos e marcar como pagos
   - Exportar selecionados para Excel/PDF

4. **Indicadores na linha**:
   - Dias de atraso (badge vermelho)
   - Processo vinculado (link clicavel)
   - Cliente vinculado (link clicavel)

### Contas a Pagar - Melhorias

1. **Calendario de pagamentos**:
   - Visualizacao em calendario
   - Cores por status

2. **Novos campos**:
   - Anexar comprovante de pagamento
   - Numero da nota fiscal
   - Centro de custo obrigatorio para analise

3. **Alertas de vencimento**:
   - Notificacao no dashboard
   - Badge de "vence hoje" / "vencido"

### Extrato - Melhorias

1. **Filtro por conta bancaria**
2. **Conciliacao bancaria**:
   - Marcar como conciliado
   - Comparar com extrato importado (futuro)

3. **Totalizadores por periodo**:
   - Saldo inicial
   - Total de entradas
   - Total de saidas
   - Saldo final

---

## Parte 3: Central de Relatorios Financeiros

### Nova Pagina: `/financeiro/relatorios`

**Arquivo**: `src/pages/finance/FinanceReports.tsx`

### Relatorios Disponiveis

#### 1. DRE Simplificado (Demonstrativo de Resultado)
```text
+----------------------------------------+
| RECEITA BRUTA                          |
|   Honorarios Contratuais    R$ 35.000  |
|   Honorarios de Exito       R$ 12.000  |
|   Consultas                 R$  3.000  |
| = RECEITA TOTAL             R$ 50.000  |
+----------------------------------------+
| DEDUCOES                               |
|   Impostos (ISS)            R$  2.500  |
| = RECEITA LIQUIDA           R$ 47.500  |
+----------------------------------------+
| DESPESAS OPERACIONAIS                  |
|   Pessoal                   R$ 15.000  |
|   Aluguel                   R$  5.000  |
|   Software                  R$  1.200  |
|   Custas Processuais        R$  3.800  |
|   Outros                    R$  2.000  |
| = TOTAL DESPESAS            R$ 27.000  |
+----------------------------------------+
| = RESULTADO OPERACIONAL     R$ 20.500  |
+----------------------------------------+
```

#### 2. Fluxo de Caixa Realizado vs Projetado
- Tabela mensal com valores realizados e previstos
- Grafico comparativo
- Desvio percentual

#### 3. Analise por Cliente
- Ranking de clientes por faturamento
- Historico de pagamentos por cliente
- Tempo medio de recebimento por cliente
- Inadimplencia por cliente

#### 4. Analise por Processo
- Receitas vinculadas ao processo
- Custas processuais do processo
- Saldo: receita - custas
- ROI por processo

#### 5. Relatorio de Inadimplencia
- Lista de clientes com valores em atraso
- Aging: 1-15, 16-30, 31-60, >60 dias
- Valor total por faixa
- Acoes sugeridas

#### 6. Relatorio de Custas Processuais
- Despesas por processo
- Comparativo com receitas do mesmo processo
- Processos mais custosos

#### 7. Receita Recorrente (MRR)
- Contratos ativos com valor mensal
- Projecao de receita recorrente
- Churn (contratos encerrados)

#### 8. Comparativo de Periodos
- Selecionar dois periodos
- Comparar receitas, despesas, lucro
- Variacao percentual

### Funcionalidades Comuns

1. **Filtros por periodo**: Hoje, Semana, Mes, Trimestre, Ano, Personalizado
2. **Exportacao**:
   - PDF (usando jsPDF existente)
   - CSV/Excel
3. **Impressao direta**
4. **Salvar como favorito**

---

## Parte 4: Central de Relatorios Juridicos

### Nova Pagina: `/relatorios`

**Arquivo**: `src/pages/LegalReports.tsx`

### Relatorios Disponiveis

#### 1. Clientes Cadastrados
- Lista de clientes por periodo
- Tipo (PF/PJ)
- Quantidade de processos por cliente

#### 2. Processos por Periodo
- Novos processos abertos
- Processos por tipo de acao
- Processos por tribunal
- Processos por status

#### 3. Producao de Peticoes
- Peticoes geradas por periodo
- Por tipo de peticao
- Por processo
- Por advogado (futuro multi-usuario)

#### 4. Prazos e Audiencias
- Agenda da semana/mes
- Prazos cumpridos vs perdidos
- Audiencias realizadas

#### 5. Acompanhamento de Processos
- Processos com movimentacao recente
- Processos sem movimentacao (inativos)
- Alertas de novos andamentos

#### 6. Relatorio de Atendimentos
- Clientes atendidos na semana
- Consultas realizadas
- Tempo medio de resposta

#### 7. Desempenho Geral
- Dashboard consolidado
- Indicadores de produtividade
- Metas vs realizado

### Funcionalidades Comuns

1. **Filtros por periodo**
2. **Exportacao PDF/CSV**
3. **Impressao direta**

---

## Parte 5: Integracao Financeiro + Juridico

### Na Pagina de Cliente

Adicionar aba "Financeiro" mostrando:
- Total recebido do cliente
- Valor em aberto
- Historico de pagamentos
- Contratos de honorarios vinculados
- Botao "Criar Nova Receita" pre-preenchido

### Na Pagina de Processo

Adicionar aba "Custos" mostrando:
- Custas processuais lancadas
- Honorarios recebidos
- Saldo do processo (receita - custo)
- Botao "Adicionar Custo" pre-preenchido

### No Dashboard Principal

Adicionar card "Resumo Financeiro":
- Receita do mes
- Despesas do mes
- Link para dashboard financeiro

---

## Parte 6: Componentes a Criar

### Graficos Novos
```text
src/components/finance/charts/
  - ProjectedCashFlowChart.tsx     (fluxo projetado 12 meses)
  - CategoryDistributionChart.tsx  (pizza de categorias)
  - OverdueAnalysisChart.tsx       (inadimplencia por faixa)
  - MonthlyComparisonChart.tsx     (comparativo mensal)
  - TopClientsChart.tsx            (ranking de clientes)
  - BalanceEvolutionChart.tsx      (evolucao patrimonial)
```

### Cards Avancados
```text
src/components/finance/cards/
  - FinanceMetricCard.tsx          (card com sparkline)
  - AlertCard.tsx                  (alertas visuais)
  - ClientRankingCard.tsx          (ranking com barras)
  - OverdueClientsCard.tsx         (lista de inadimplentes)
```

### Relatorios
```text
src/components/finance/reports/
  - DREReport.tsx                  (demonstrativo de resultado)
  - CashFlowReport.tsx             (fluxo de caixa)
  - ClientAnalysisReport.tsx       (analise por cliente)
  - ProcessCostReport.tsx          (custos por processo)
  - OverdueReport.tsx              (inadimplencia)
  - ReportFilters.tsx              (filtros reutilizaveis)
  - ReportExporter.tsx             (exportacao PDF/CSV)
```

### Relatorios Juridicos
```text
src/components/legal/reports/
  - ClientsReport.tsx              (clientes cadastrados)
  - CasesReport.tsx                (processos por periodo)
  - PetitionsReport.tsx            (producao de peticoes)
  - DeadlinesReport.tsx            (prazos e audiencias)
  - PerformanceReport.tsx          (desempenho geral)
```

---

## Parte 7: Paginas a Criar

| Pagina | Rota | Descricao |
|--------|------|-----------|
| FinanceReports | /financeiro/relatorios | Central de relatorios financeiros |
| LegalReports | /relatorios | Central de relatorios juridicos |

---

## Parte 8: Rotas a Adicionar

```text
No Sidebar (Juridico):
  - Relatorios (/relatorios) - novo item

No Sidebar (Financeiro):
  - Relatorios (/financeiro/relatorios) - novo item

Em App.tsx:
  - /relatorios -> LegalReports
  - /financeiro/relatorios -> FinanceReports
```

---

## Parte 9: Melhorias de UX/UI

### Dashboard Financeiro

1. **Layout responsivo melhorado**
   - 4 cards na primeira linha (metricas principais)
   - 4 cards na segunda linha (metricas secundarias)
   - 2 graficos grandes (fluxo de caixa e comparativo)
   - 2 graficos menores (categorias e inadimplencia)
   - 2 listas (proximos vencimentos e top clientes)

2. **Filtro de periodo global**
   - Dropdown no topo: Hoje, 7 dias, 30 dias, 90 dias, Ano, Personalizado
   - Afeta todos os cards e graficos

3. **Acoes rapidas flutuantes**
   - Botao FAB com: Nova Receita, Nova Despesa, Novo Lancamento

### Alertas Inteligentes

1. **Toast de aviso** ao entrar no dashboard se houver:
   - Contas vencidas
   - Fluxo de caixa projetado negativo

2. **Badge de notificacao** no menu lateral:
   - Numero de itens pendentes

---

## Parte 10: Exportacao de Relatorios

### PDF (usando jsPDF existente)

Criar utilitario melhorado:
```text
src/lib/pdf-report-export.ts
  - generateDREPdf()
  - generateCashFlowPdf()
  - generateClientReportPdf()
  - generateGenericTablePdf()
```

### CSV/Excel

Criar utilitario:
```text
src/lib/csv-export.ts
  - exportToCSV(data, filename)
  - exportToExcel(data, filename) - usando biblioteca simples
```

---

## Parte 11: Fases de Implementacao

### Fase 1: Dashboard Avancado (Prioridade Alta)
1. Criar novos cards de metricas (8 ao total)
2. Criar grafico de fluxo de caixa projetado
3. Criar grafico de distribuicao por categoria
4. Criar card de inadimplencia
5. Adicionar filtro de periodo global
6. Melhorar layout responsivo

### Fase 2: Melhorias nas Listagens (Prioridade Alta)
7. Adicionar filtros avancados em Receivables
8. Adicionar agrupamento visual
9. Adicionar indicadores de atraso
10. Adicionar acoes em lote

### Fase 3: Central de Relatorios Financeiros (Prioridade Alta)
11. Criar pagina FinanceReports
12. Implementar DRE
13. Implementar Fluxo de Caixa
14. Implementar Analise por Cliente
15. Adicionar exportacao PDF/CSV

### Fase 4: Central de Relatorios Juridicos (Prioridade Media)
16. Criar pagina LegalReports
17. Implementar Relatorio de Clientes
18. Implementar Relatorio de Processos
19. Implementar Relatorio de Peticoes
20. Adicionar exportacao PDF/CSV

### Fase 5: Integracoes (Prioridade Media)
21. Adicionar aba Financeiro em Clientes
22. Adicionar aba Custos em Processos
23. Adicionar card financeiro no Dashboard juridico

### Fase 6: Polimento (Prioridade Baixa)
24. Alertas inteligentes
25. Badges de notificacao
26. Botoes de acao rapida (FAB)
27. Testes end-to-end

---

## Arquivos a Criar

### Paginas (2)
- `src/pages/finance/FinanceReports.tsx`
- `src/pages/LegalReports.tsx`

### Componentes de Graficos (6)
- `src/components/finance/charts/ProjectedCashFlowChart.tsx`
- `src/components/finance/charts/CategoryDistributionChart.tsx`
- `src/components/finance/charts/OverdueAnalysisChart.tsx`
- `src/components/finance/charts/MonthlyComparisonChart.tsx`
- `src/components/finance/charts/TopClientsChart.tsx`
- `src/components/finance/charts/BalanceEvolutionChart.tsx`

### Componentes de Relatorios (8)
- `src/components/finance/reports/DREReport.tsx`
- `src/components/finance/reports/CashFlowReport.tsx`
- `src/components/finance/reports/ClientAnalysisReport.tsx`
- `src/components/finance/reports/OverdueReport.tsx`
- `src/components/finance/reports/ReportFilters.tsx`
- `src/components/finance/reports/ReportExporter.tsx`
- `src/components/legal/reports/CasesReport.tsx`
- `src/components/legal/reports/PetitionsReport.tsx`

### Utilitarios (2)
- `src/lib/pdf-report-export.ts`
- `src/lib/csv-export.ts`

### Modificacoes
- `src/pages/finance/FinanceDashboard.tsx` - Dashboard avancado
- `src/pages/finance/Receivables.tsx` - Filtros avancados
- `src/pages/finance/Payables.tsx` - Filtros avancados
- `src/components/layout/Sidebar.tsx` - Adicionar item Relatorios
- `src/App.tsx` - Adicionar rotas de relatorios

---

## Consideracoes Tecnicas

### Performance
- Queries otimizadas com indices
- Paginacao em relatorios grandes
- Cache de metricas do dashboard (React Query)
- Lazy loading de graficos pesados

### Seguranca
- RLS em todas as queries
- Validacao de periodo (nao permitir futuro distante)
- Sanitizacao de dados em exportacoes

### Responsividade
- Mobile: Cards empilhados, graficos simplificados
- Tablet: 2 colunas de cards
- Desktop: Layout completo

### Acessibilidade
- Cores com contraste adequado
- Tooltips descritivos
- Labels em graficos

---

## Resultado Esperado

1. **Dashboard profissional** - 8+ metricas, 6+ graficos, alertas visuais
2. **Controle 360** - Visao completa das financas do escritorio
3. **Relatorios financeiros** - DRE, fluxo de caixa, analises por cliente/processo
4. **Relatorios juridicos** - Producao, clientes, processos, prazos
5. **Exportacao** - PDF e CSV para todos os relatorios
6. **Integracao** - Financeiro conectado a clientes e processos
7. **Alertas** - Notificacoes de vencimentos e inadimplencia
8. **Ferramenta completa** - Tudo em um so lugar para o advogado
