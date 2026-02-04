
# Plano Premium: Onboarding Completo e Gamificado para Advogados

## Visão Geral

Transformar o onboarding atual em uma **experiência premium dividida em dois módulos** (Jurídico e Financeiro), com tour guiado mais completo, tooltips responsivos que nunca saem da tela, e checklist gamificado com recompensas visuais.

---

## Estrutura Proposta

```text
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Setup Wizard (já existe) → Coleta dados iniciais       │
│                     ↓                                       │
│  2. Welcome Modal → Introdução + escolha de tour           │
│                     ↓                                       │
│  3. TOUR JURÍDICO (8-10 steps)                             │
│     • Dashboard                                             │
│     • Clientes + Processos                                  │
│     • Petições com IA                                       │
│     • Pipeline Kanban                                       │
│     • Jurisprudência + Acompanhamento                       │
│     • Agenda + Notificações                                 │
│                     ↓                                       │
│  4. TOUR FINANCEIRO (6-8 steps)                            │
│     • Painel Financeiro                                     │
│     • Contas a Receber/Pagar                               │
│     • Contratos de Honorários                              │
│     • Relatórios Financeiros                               │
│                     ↓                                       │
│  5. CHECKLIST GAMIFICADO                                    │
│     • Missões separadas por módulo                         │
│     • Badges/conquistas visuais                            │
│     • Barra de progresso com animações                     │
│     • Celebração ao completar cada módulo                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Problemas Atuais a Resolver

### 1. Tooltip saindo da tela (notificações)
O tooltip do step "Notificações" está posicionado para baixo (`placement: 'bottom'`), mas não há verificação de limites de tela.

### 2. Tour muito curto (5 steps)
Cobre apenas: Dashboard, Clientes, Petições, Pipeline, Notificações. Falta cobrir 70% da plataforma.

### 3. Checklist básico (5 tarefas)
Não cobre módulo financeiro nem gamificação real.

### 4. Falta divisão em módulos
Advogados querem entender primeiro o core jurídico antes de ver financeiro.

---

## Arquitetura de Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/onboarding/ProductTour.tsx` | Refatorar com viewport-aware positioning |
| `src/components/onboarding/TourTooltip.tsx` | **NOVO** - Componente de tooltip inteligente |
| `src/components/onboarding/OnboardingChecklist.tsx` | Expandir com módulos e gamificação |
| `src/components/onboarding/WelcomeModal.tsx` | Adicionar opção de escolher módulo |
| `src/components/onboarding/AchievementBadge.tsx` | **NOVO** - Componente de conquistas |
| `src/hooks/useOnboardingProgress.ts` | Adicionar campos para tour financeiro |
| `src/index.css` | Adicionar animações premium |
| **Migration SQL** | Novos campos no banco |

---

## Detalhes Técnicos

### 1. TourTooltip Inteligente (Viewport-Aware)

O novo componente calcula automaticamente se o tooltip cabe na posição desejada e ajusta:

```typescript
// Lógica de posicionamento seguro
const calculateSafePosition = (
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right'
) => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  // Verificar se cabe na posição preferida
  // Se não couber, tentar posições alternativas
  // Garantir padding mínimo de 16px das bordas
  
  return { top, left, actualPlacement };
};
```

### 2. Novo Tour Jurídico Completo (10 steps)

```typescript
const TOUR_JURIDICO: TourStep[] = [
  { target: '[data-tour="dashboard"]', title: 'Central de Comando', category: 'juridico', ... },
  { target: '[data-tour="clients"]', title: 'Base de Clientes', category: 'juridico', ... },
  { target: '[data-tour="cases"]', title: 'Processos Ativos', category: 'juridico', ... },
  { target: '[data-tour="pipeline"]', title: 'Gestão Visual Kanban', category: 'juridico', ... },
  { target: '[data-tour="petitions"]', title: 'Gerador de Petições IA', category: 'juridico', ... },
  { target: '[data-tour="templates"]', title: 'Biblioteca de Modelos', category: 'juridico', ... },
  { target: '[data-tour="jurisprudence"]', title: 'Pesquisa Jurisprudencial', category: 'juridico', ... },
  { target: '[data-tour="tracking"]', title: 'Acompanhamento Processual', category: 'juridico', ... },
  { target: '[data-tour="agenda"]', title: 'Agenda e Prazos', category: 'juridico', ... },
  { target: '[data-tour="notifications"]', title: 'Central de Alertas', category: 'juridico', ... },
];
```

### 3. Novo Tour Financeiro (7 steps)

```typescript
const TOUR_FINANCEIRO: TourStep[] = [
  { target: '[data-tour="finance-dashboard"]', title: 'Painel Financeiro', category: 'financeiro', ... },
  { target: '[data-tour="receivables"]', title: 'Contas a Receber', category: 'financeiro', ... },
  { target: '[data-tour="payables"]', title: 'Contas a Pagar', category: 'financeiro', ... },
  { target: '[data-tour="transactions"]', title: 'Extrato de Movimentações', category: 'financeiro', ... },
  { target: '[data-tour="contracts"]', title: 'Contratos de Honorários', category: 'financeiro', ... },
  { target: '[data-tour="finance-reports"]', title: 'Relatórios Gerenciais', category: 'financeiro', ... },
  { target: '[data-tour="finance-settings"]', title: 'Configurações Financeiras', category: 'financeiro', ... },
];
```

### 4. Checklist Gamificado com Módulos

```typescript
interface ChecklistModule {
  id: 'juridico' | 'financeiro';
  title: string;
  icon: LucideIcon;
  color: string;  // Teal para jurídico, Green para financeiro
  tasks: ChecklistTask[];
  badge: {
    name: string;
    icon: string;  // emoji ou ícone
  };
}

const MODULES: ChecklistModule[] = [
  {
    id: 'juridico',
    title: 'Módulo Jurídico',
    icon: Scale,
    color: 'from-teal-500 to-cyan-500',
    badge: { name: 'Jurista Digital', icon: '⚖️' },
    tasks: [
      { id: 'profile', title: 'Completar perfil profissional', ... },
      { id: 'client', title: 'Cadastrar primeiro cliente', ... },
      { id: 'case', title: 'Registrar primeiro processo', ... },
      { id: 'petition', title: 'Gerar petição com IA', ... },
      { id: 'pipeline', title: 'Organizar processos no Kanban', ... },
      { id: 'jurisprudence', title: 'Fazer pesquisa jurisprudencial', ... },
      { id: 'tracking', title: 'Monitorar um processo', ... },
    ],
  },
  {
    id: 'financeiro',
    title: 'Módulo Financeiro',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    badge: { name: 'Gestor Financeiro', icon: '💰' },
    tasks: [
      { id: 'finance-visit', title: 'Explorar painel financeiro', ... },
      { id: 'receivable', title: 'Criar conta a receber', ... },
      { id: 'contract', title: 'Cadastrar contrato de honorários', ... },
      { id: 'report', title: 'Gerar relatório financeiro', ... },
    ],
  },
];
```

### 5. Sistema de Conquistas (Badges)

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;  // Emoji
  condition: 'module_juridico' | 'module_financeiro' | 'all_complete';
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'jurista',
    name: 'Jurista Digital',
    description: 'Completou o módulo jurídico',
    icon: '⚖️',
    condition: 'module_juridico',
  },
  {
    id: 'gestor',
    name: 'Gestor Financeiro',
    description: 'Completou o módulo financeiro',
    icon: '💰',
    condition: 'module_financeiro',
  },
  {
    id: 'mestre',
    name: 'Mestre da Práxis',
    description: 'Dominou toda a plataforma',
    icon: '🏆',
    condition: 'all_complete',
  },
];
```

### 6. Migração do Banco de Dados

Adicionar novos campos para suportar tours separados e tarefas expandidas:

```sql
-- Adicionar campos para tour financeiro e tarefas expandidas
ALTER TABLE user_onboarding_progress
ADD COLUMN IF NOT EXISTS juridico_tour_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS juridico_tour_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS finance_tour_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_tour_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jurisprudence_searched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_dashboard_visited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_receivable_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_contract_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_report_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badges_earned TEXT[] DEFAULT '{}';
```

### 7. Sidebar com data-tour Attributes

Atualizar o Sidebar para incluir `data-tour` em todos os itens de navegação:

```typescript
// src/components/layout/Sidebar.tsx
const categories: NavCategory[] = [
  {
    id: 'juridico',
    items: [
      { to: '/dashboard', tourId: 'dashboard', ... },
      { to: '/clients', tourId: 'clients', ... },
      { to: '/cases', tourId: 'cases', ... },  // NOVO
      { to: '/pipeline', tourId: 'pipeline', ... },
      { to: '/petitions', tourId: 'petitions', ... },
      { to: '/templates', tourId: 'templates', ... },  // NOVO
      { to: '/jurisprudence', tourId: 'jurisprudence', ... },  // NOVO
      { to: '/tracking', tourId: 'tracking', ... },  // NOVO
      { to: '/agenda', tourId: 'agenda', ... },  // NOVO
    ],
  },
  {
    id: 'financeiro',
    items: [
      { to: '/financeiro', tourId: 'finance-dashboard', ... },  // NOVO
      { to: '/financeiro/receber', tourId: 'receivables', ... },  // NOVO
      { to: '/financeiro/pagar', tourId: 'payables', ... },  // NOVO
      { to: '/financeiro/extrato', tourId: 'transactions', ... },  // NOVO
      { to: '/financeiro/contratos', tourId: 'contracts', ... },  // NOVO
      { to: '/financeiro/relatorios', tourId: 'finance-reports', ... },  // NOVO
    ],
  },
];
```

---

## UI/UX Premium

### Tooltip Redesenhado

```text
┌─────────────────────────────────────────┐
│  ┌──────┐                          [×]  │
│  │ ICON │  Central de Comando           │
│  │      │  ─────────────────            │
│  └──────┘  Seu painel com visão geral   │
│            de tudo: prazos, processos   │
│            e métricas importantes.       │
│                                          │
│  ┌─────────────────────────────────────┐│
│  │ [◀ Anterior]  ●●●○○○○○○  [Próximo ▶]││
│  └─────────────────────────────────────┘│
│               Step 1 de 10              │
│                                          │
│  ┌─────────────────────────────────────┐│
│  │        [Pular Tour Jurídico]        ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Checklist com Módulos

```text
┌─────────────────────────────────────────┐
│  ✨ Primeiros Passos            [−] [×] │
├─────────────────────────────────────────┤
│  Progresso Total: ████████░░░░ 65%      │
├─────────────────────────────────────────┤
│                                         │
│  ⚖️ MÓDULO JURÍDICO ──────── 80% ✓      │
│  ┌─────────────────────────────────────┐│
│  │ ✓ Completar perfil profissional    ││
│  │ ✓ Cadastrar primeiro cliente       ││
│  │ ✓ Registrar primeiro processo      ││
│  │ ✓ Gerar petição com IA             ││
│  │ ○ Organizar processos no Kanban    ││
│  └─────────────────────────────────────┘│
│                                         │
│  💰 MÓDULO FINANCEIRO ────── 25%        │
│  ┌─────────────────────────────────────┐│
│  │ ✓ Explorar painel financeiro       ││
│  │ ○ Criar conta a receber            ││
│  │ ○ Cadastrar contrato de honorários ││
│  │ ○ Gerar relatório financeiro       ││
│  └─────────────────────────────────────┘│
│                                         │
│  🏆 CONQUISTAS ─────────────────────────│
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ ⚖️   │ │ 💰   │ │ 🔒   │            │
│  │ OK!  │ │ 25%  │ │ ???  │            │
│  └──────┘ └──────┘ └──────┘            │
│                                         │
│  [Ver Tutorial Financeiro]              │
└─────────────────────────────────────────┘
```

---

## Animações Premium (CSS)

```css
/* Animação de unlock de badge */
@keyframes badge-unlock {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.animate-badge-unlock {
  animation: badge-unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Shimmer para tarefas completadas */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer-complete {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255,255,255,0.3) 50%, 
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

/* Pulse suave para próxima tarefa */
@keyframes gentle-pulse {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
  50% { box-shadow: 0 0 0 4px hsl(var(--primary) / 0); }
}

.animate-next-task {
  animation: gentle-pulse 2s ease-in-out infinite;
}
```

---

## Welcome Modal Atualizado

Adicionar opção de escolher qual módulo explorar primeiro:

```text
┌────────────────────────────────────────────┐
│                                            │
│         🎉 Bem-vindo, Dr(a). João!         │
│                                            │
│    Seu escritório está configurado e       │
│    pronto para transformar sua prática.    │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  Escolha como deseja começar:        │  │
│  │                                       │  │
│  │  ┌─────────────┐ ┌─────────────┐     │  │
│  │  │ ⚖️ Jurídico │ │ 💰 Financ.  │     │  │
│  │  │  10 steps   │ │  7 steps    │     │  │
│  │  │   ~4 min    │ │   ~3 min    │     │  │
│  │  └─────────────┘ └─────────────┘     │  │
│  │                                       │  │
│  │  ┌─────────────────────────────┐     │  │
│  │  │   🚀 Tour Completo (~7min)  │     │  │
│  │  └─────────────────────────────┘     │  │
│  └──────────────────────────────────────┘  │
│                                            │
│        Ou explorar por conta própria →     │
│                                            │
└────────────────────────────────────────────┘
```

---

## Ordem de Implementação

1. **Migration SQL** - Adicionar novos campos ao banco
2. **TourTooltip.tsx** - Criar componente de tooltip inteligente
3. **ProductTour.tsx** - Refatorar com steps expandidos e viewport-aware
4. **Sidebar.tsx** - Adicionar data-tour em todos os itens
5. **AchievementBadge.tsx** - Criar componente de conquistas
6. **OnboardingChecklist.tsx** - Expandir com módulos e gamificação
7. **WelcomeModal.tsx** - Adicionar seleção de módulo
8. **useOnboardingProgress.ts** - Atualizar hook com novos campos
9. **index.css** - Adicionar animações premium
10. **Testar fluxo completo** - Verificar todos os cenários

---

## Resultado Esperado

Após a implementação:
- Tour jurídico com 10 steps cobrindo toda a área jurídica
- Tour financeiro com 7 steps cobrindo todo o módulo financeiro
- Tooltips inteligentes que nunca saem da tela
- Checklist dividido em módulos com progresso visual
- Sistema de conquistas (badges) para gamificação
- Celebrações visuais ao completar cada módulo
- Experiência premium digna de advogados exigentes
