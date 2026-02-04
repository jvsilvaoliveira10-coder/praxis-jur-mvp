
# Plano: Sistema de Onboarding Premium Completo

## Visão Geral

Implementar um sistema de onboarding em 3 camadas que guia o usuário desde o primeiro login até a ativação completa da plataforma, combinando:

1. **Welcome Modal** - Boas-vindas pós-wizard com introdução animada
2. **Product Tour** - Guia interativo com tooltips destacando áreas-chave
3. **Checklist Gamificado** - Widget persistente com progresso e tarefas verificáveis

---

## Arquitetura do Sistema

```text
+------------------+     +------------------+     +------------------+
|  WIZARD SETUP    |     |  WELCOME MODAL   |     |  PRODUCT TOUR    |
|  (Existente)     |---->|  (Novo)          |---->|  (Novo)          |
+------------------+     +------------------+     +------------------+
      5 etapas              Boas-vindas            5 passos
      Coleta dados          CTA "Fazer Tour"       Tooltips
                                                   Highlight elementos
                                    |
                                    v
                          +------------------+
                          |  CHECKLIST       |
                          |  (Persistente)   |
                          +------------------+
                            Widget flutuante
                            Progresso visual
                            Auto-verificação
```

---

## Fase 1: Preparação do Banco de Dados

### Nova Tabela: `user_onboarding_progress`

Armazena o progresso do usuário em cada etapa do onboarding pós-wizard.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| user_id | uuid | Referência ao usuário |
| welcome_modal_seen | boolean | Viu o modal de boas-vindas |
| product_tour_completed | boolean | Completou o tour do produto |
| product_tour_step | integer | Passo atual do tour (se pausado) |
| first_client_created | boolean | Criou primeiro cliente |
| first_case_created | boolean | Criou primeiro processo |
| first_petition_generated | boolean | Gerou primeira petição |
| checklist_dismissed | boolean | Fechou o checklist |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Última atualização |

### RLS Policy
- Usuário pode ler/atualizar apenas seu próprio progresso
- Insert automático via trigger no signup

---

## Fase 2: Welcome Modal

### Componente: `WelcomeModal.tsx`

Modal animado que aparece após completar o wizard de setup, dando boas-vindas e oferecendo o Product Tour.

**Conteúdo:**
- Saudação personalizada com nome do advogado
- Animação de confetti ou celebração sutil
- 3 cards mostrando o que a plataforma oferece
- Botão principal: "Fazer Tour Guiado"
- Link secundário: "Explorar por conta própria"

**Trigger:**
- Exibir quando `onboarding_completed = true` E `welcome_modal_seen = false`

**Estrutura visual:**
```text
+-----------------------------------------------+
|                                               |
|   🎉  Bem-vindo(a), Dr(a). [Nome]!           |
|                                               |
|   Seu escritório está configurado e pronto   |
|   para transformar sua prática jurídica.     |
|                                               |
|   +--------+  +--------+  +--------+         |
|   |Clientes|  |Petições|  |Pipeline|         |
|   |  AI    |  |  Auto  |  |  Visual|         |
|   +--------+  +--------+  +--------+         |
|                                               |
|   [ 🚀 Fazer Tour Guiado (2 min) ]           |
|                                               |
|        Ou explorar por conta própria →       |
|                                               |
+-----------------------------------------------+
```

---

## Fase 3: Product Tour

### Componente: `ProductTour.tsx`

Tour interativo com 5 passos que destaca as principais áreas da plataforma.

**Passos do Tour:**

| Passo | Alvo | Título | Descrição |
|-------|------|--------|-----------|
| 1 | Sidebar - Dashboard | Central de Comando | Seu painel com visão geral de tudo |
| 2 | Sidebar - Clientes | Base de Clientes | Gerencie todos os seus clientes |
| 3 | Sidebar - Petições | Gerador de Petições | Crie petições com IA em minutos |
| 4 | Sidebar - Pipeline | Gestão Visual | Acompanhe processos estilo Kanban |
| 5 | TopHeader - Notificações | Fique Atualizado | Alertas de prazos e movimentações |

**Implementação Nativa (sem lib externa):**
- Componente `TourStep` com tooltip posicionado
- Overlay escuro com "recorte" no elemento alvo
- Navegação: Anterior / Próximo / Pular
- Scroll automático para elemento fora da viewport
- Persistência do passo atual se usuário pausar

**Estrutura visual do tooltip:**
```text
          +--------------------------+
          | 📌 Gestão Visual          |
          |                          |
          | Acompanhe seus processos |
          | em um quadro Kanban      |
          | intuitivo e visual.      |
          |                          |
          | [← Anterior] [Próximo →] |
          | ________________________ |
          |    ○ ○ ● ○ ○   3/5       |
          +--------------------------+
                    ▼
           [Elemento destacado]
```

---

## Fase 4: Checklist de Primeiros Passos

### Componente: `OnboardingChecklist.tsx`

Widget flutuante no canto inferior direito com lista de tarefas gamificada.

**Tarefas Verificáveis:**

| Tarefa | Verificação Automática | Pontos |
|--------|------------------------|--------|
| Completar perfil | lawyer_name + oab_number preenchidos | 20% |
| Cadastrar primeiro cliente | COUNT(clients) >= 1 | 20% |
| Criar primeiro processo | COUNT(cases) >= 1 | 20% |
| Gerar primeira petição | COUNT(petitions) >= 1 | 20% |
| Explorar gestão de processos | Visitou /pipeline | 20% |

**Estados do Widget:**
- **Minimizado**: Bolinha com ícone e badge de progresso
- **Expandido**: Lista completa com barra de progresso
- **Completado**: Celebração + opção de fechar permanentemente

**Estrutura visual:**
```text
Estado Minimizado:          Estado Expandido:
                           +---------------------------+
  +----+                   | 📋 Primeiros Passos       |
  | 40%|                   | ▓▓▓▓▓▓░░░░░░░░ 40%       |
  +----+                   |---------------------------|
                           | ✓ Completar perfil        |
                           | ✓ Cadastrar cliente       |
                           | ○ Criar processo          |
                           | ○ Gerar petição           |
                           | ○ Explorar pipeline       |
                           |---------------------------|
                           | [Fechar] [Continuar →]    |
                           +---------------------------+
```

---

## Fase 5: Hook de Progresso

### Hook: `useOnboardingProgress.ts`

Hook centralizado para gerenciar todo o estado do onboarding.

**Funcionalidades:**
- Busca/atualiza progresso no banco
- Verifica automaticamente tarefas completadas
- Calcula porcentagem total
- Dispara confetti ao atingir 100%

**API do Hook:**
```typescript
const {
  // Estado
  progress,           // Objeto com todas as flags
  isLoading,          // Carregando dados
  percentComplete,    // 0-100
  
  // Ações
  markWelcomeModalSeen,
  markTourCompleted,
  updateTourStep,
  dismissChecklist,
  
  // Verificações
  checkFirstClient,   // Verifica e atualiza
  checkFirstCase,
  checkFirstPetition,
  
  // Computed
  shouldShowWelcome,
  shouldShowTour,
  shouldShowChecklist,
} = useOnboardingProgress();
```

---

## Fase 6: Integração no MainLayout

### Modificações em `MainLayout.tsx`

Adicionar os novos componentes no fluxo de renderização.

**Ordem de Exibição:**
1. Wizard de Setup (existente) - se `onboarding_completed = false`
2. Welcome Modal (novo) - se wizard completo E modal não visto
3. Product Tour (novo) - se iniciado pelo modal ou botão
4. Checklist (novo) - sempre visível até dismissar ou completar

**Código conceitual:**
```tsx
return (
  <>
    {/* Wizard existente */}
    <OnboardingWizard open={showOnboarding} ... />
    
    {/* Novos componentes */}
    <WelcomeModal open={shouldShowWelcome} onStartTour={...} />
    <ProductTour active={tourActive} step={tourStep} onComplete={...} />
    
    {/* Layout principal */}
    <div className="min-h-screen flex">
      <Sidebar />
      <main>
        <TopHeader />
        <Outlet />
      </main>
    </div>
    
    {/* Checklist flutuante */}
    {shouldShowChecklist && <OnboardingChecklist />}
  </>
);
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useOnboardingProgress.ts` | Hook de gerenciamento do progresso |
| `src/components/onboarding/WelcomeModal.tsx` | Modal de boas-vindas |
| `src/components/onboarding/ProductTour.tsx` | Tour guiado |
| `src/components/onboarding/TourStep.tsx` | Componente de cada passo |
| `src/components/onboarding/OnboardingChecklist.tsx` | Widget de checklist |
| `src/components/onboarding/ChecklistItem.tsx` | Item individual do checklist |

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/layout/MainLayout.tsx` | Integrar novos componentes |
| `src/pages/Dashboard.tsx` | Disparar verificações do checklist |
| `src/pages/ClientForm.tsx` | Marcar tarefa ao criar cliente |
| `src/pages/CaseForm.tsx` | Marcar tarefa ao criar processo |
| `src/pages/PetitionForm.tsx` | Marcar tarefa ao gerar petição |
| `src/pages/Pipeline.tsx` | Marcar visita ao pipeline |

---

## Ordem de Implementação

1. **Migração SQL** - Criar tabela `user_onboarding_progress` com RLS
2. **Hook** - `useOnboardingProgress.ts` com toda a lógica
3. **Welcome Modal** - Componente de boas-vindas
4. **Product Tour** - Tour interativo com tooltips
5. **Checklist** - Widget gamificado
6. **Integração** - Conectar tudo no MainLayout
7. **Verificações** - Adicionar triggers nos formulários
8. **Testes** - Validar fluxo completo

---

## Detalhes Técnicos

### Posicionamento do Tooltip (ProductTour)

```typescript
const getTooltipPosition = (targetRect: DOMRect, placement: 'top' | 'bottom' | 'left' | 'right') => {
  const gap = 12; // Espaço entre tooltip e elemento
  
  switch (placement) {
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2,
        left: targetRect.right + gap,
        transform: 'translateY(-50%)',
      };
    // ... outros casos
  }
};
```

### Overlay com Recorte (Spotlight)

```typescript
// CSS para criar o efeito de spotlight
const overlayStyles = `
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  pointer-events: none;
  
  // Recorte via clip-path
  clip-path: polygon(
    0% 0%, 0% 100%, 
    ${left}px 100%, ${left}px ${top}px, 
    ${right}px ${top}px, ${right}px ${bottom}px, 
    ${left}px ${bottom}px, ${left}px 100%, 
    100% 100%, 100% 0%
  );
`;
```

### Confetti no Checklist Completo

```typescript
// Usar canvas para efeito de confetti
const triggerConfetti = () => {
  // Implementação simples com partículas CSS
  // ou usar biblioteca leve como canvas-confetti
};
```

---

## Benefícios Esperados

| Métrica | Impacto Esperado |
|---------|------------------|
| **Time to First Value** | Redução de 70% (usuário cria primeiro item em minutos) |
| **Activation Rate** | Aumento de 40% (mais usuários completam tarefas-chave) |
| **User Retention D7** | Aumento de 25% (usuários engajados voltam) |
| **Support Tickets** | Redução de 30% (menos "como faço X?") |
| **NPS Score** | Aumento esperado (primeira impressão positiva) |

---

## Resumo Visual do Fluxo

```text
Usuario novo faz signup
         ↓
    ┌─────────────┐
    │   WIZARD    │  ← 5 etapas de setup (existente)
    │   SETUP     │
    └─────────────┘
         ↓
    ┌─────────────┐
    │  WELCOME    │  ← "Bem-vindo! Fazer tour?"
    │   MODAL     │
    └─────────────┘
         ↓
    ┌─────────────┐
    │  PRODUCT    │  ← 5 passos destacando UI
    │   TOUR      │
    └─────────────┘
         ↓
    ┌─────────────┐
    │  CHECKLIST  │  ← Widget persistente
    │  GAMIFICADO │     até completar
    └─────────────┘
         ↓
    Usuario ativado! 🎉
```
