

# Plano: Correção Completa da Tela Branca no Onboarding

## Problema Identificado

Após análise profunda do código e dos dados do banco, identifiquei **múltiplos problemas** que causam a tela branca:

### 1. Dependência Circular/Duplicada de Hooks

```text
MainLayout
   ├── useFirmSettings() ← Query #1
   │      └── useAuth()
   │
   └── useOnboardingProgress()
          ├── useAuth()
          └── useFirmSettings() ← Query #2 (duplicada!)
                 └── useAuth()
```

O hook `useOnboardingProgress` chama `useFirmSettings` internamente (linha 48), mas o `MainLayout` também chama `useFirmSettings` diretamente. Isso causa:
- Duas queries paralelas para a mesma tabela
- Estados de loading dessincronizados
- Race conditions nos cálculos

### 2. Estado de Loading Inconsistente

No `useOnboardingProgress`:
- `isLoading` é setado para `false` após buscar `user_onboarding_progress`
- MAS o `firmSettings` interno ainda pode estar carregando
- Resultado: `calculatePercent()` retorna 0 e `shouldShowWelcome` fica incorreto

### 3. Cálculo de shouldShowWelcome Falha

```typescript
// Quando firmSettings ainda é null (carregando), retorna false incorretamente
const shouldShowWelcome = !!(
  firmSettings?.onboarding_completed &&  // null?.prop = undefined = false
  progress &&
  !progress.welcome_modal_seen
);
```

---

## Solução Proposta

### Estratégia: Passar `firmSettings` como Dependência Externa

Em vez do `useOnboardingProgress` chamar `useFirmSettings` internamente, ele deve **receber os dados de firmSettings como parâmetro** do `MainLayout`, garantindo consistência.

---

## Mudanças Detalhadas

### 1. Modificar o Hook `useOnboardingProgress`

**Arquivo:** `src/hooks/useOnboardingProgress.ts`

**Mudanças:**
- Remover a chamada interna a `useFirmSettings`
- Aceitar `firmSettings` e `loadingSettings` como parâmetros
- Incluir `loadingSettings` no cálculo de `isLoading`
- Usar `firmSettings` do parâmetro para cálculos

**Antes:**
```typescript
export const useOnboardingProgress = (): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const { firmSettings } = useFirmSettings();  // <- Problema aqui
  // ...
}
```

**Depois:**
```typescript
interface UseOnboardingProgressParams {
  firmSettings: FirmSettings | null;
  loadingSettings: boolean;
}

export const useOnboardingProgress = (
  params: UseOnboardingProgressParams
): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const { firmSettings, loadingSettings } = params;
  // ...
  
  // Incluir loadingSettings no isLoading geral
  const combinedLoading = isLoading || loadingSettings;
  
  return {
    isLoading: combinedLoading,
    // ...
  };
}
```

### 2. Atualizar o MainLayout

**Arquivo:** `src/components/layout/MainLayout.tsx`

**Mudanças:**
- Passar `firmSettings` e `loadingSettings` para o hook
- Garantir que o loading global espera TODOS os estados

**Antes:**
```typescript
const { firmSettings, isLoading: loadingSettings } = useFirmSettings();
const { isLoading: loadingOnboarding, ... } = useOnboardingProgress();
```

**Depois:**
```typescript
const { firmSettings, isLoading: loadingSettings } = useFirmSettings();
const { isLoading: loadingOnboarding, ... } = useOnboardingProgress({
  firmSettings,
  loadingSettings,
});
```

### 3. Atualizar o OnboardingChecklist

**Arquivo:** `src/components/onboarding/OnboardingChecklist.tsx`

**Mudanças:**
- Passar `firmSettings` como parâmetro (já que o componente precisa dele)
- OU buscar `firmSettings` diretamente já que é um componente independente

Como o Checklist é um componente independente que não recebe props do MainLayout, podemos mantê-lo chamando `useFirmSettings` diretamente, pois ele já aguarda o loading global do MainLayout antes de renderizar.

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/hooks/useOnboardingProgress.ts` | Aceitar firmSettings como parâmetro externo |
| `src/components/layout/MainLayout.tsx` | Passar firmSettings para o hook |

---

## Fluxo Corrigido

```text
MainLayout monta
       ↓
useFirmSettings() → loadingSettings = true
       ↓
useOnboardingProgress({ firmSettings, loadingSettings })
       ↓
if (loading || loadingSettings || loadingOnboarding) {
  return <Spinner />  ← Todos os loadings verificados
}
       ↓
Todas queries terminam
       ↓
shouldShowWelcome calcula corretamente
       ↓
UI renderiza corretamente
```

---

## Validação dos Dados

Confirmado no banco que o usuário de teste tem:
- `law_firm_settings.onboarding_completed = true`
- `user_onboarding_progress.welcome_modal_seen = false`

Após a correção, o `WelcomeModal` deve aparecer corretamente.

---

## Código Completo das Correções

### Hook useOnboardingProgress

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FirmSettings } from '@/hooks/useFirmSettings';

interface OnboardingProgress {
  id: string;
  user_id: string;
  welcome_modal_seen: boolean;
  product_tour_completed: boolean;
  product_tour_step: number;
  first_client_created: boolean;
  first_case_created: boolean;
  first_petition_generated: boolean;
  pipeline_visited: boolean;
  checklist_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

interface UseOnboardingProgressParams {
  firmSettings: FirmSettings | null;
  loadingSettings: boolean;
}

interface UseOnboardingProgressReturn {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  percentComplete: number;
  
  markWelcomeModalSeen: () => Promise<void>;
  markTourCompleted: () => Promise<void>;
  updateTourStep: (step: number) => Promise<void>;
  dismissChecklist: () => Promise<void>;
  startTour: () => void;
  stopTour: () => void;
  
  checkAndUpdateProgress: () => Promise<void>;
  markPipelineVisited: () => Promise<void>;
  
  shouldShowWelcome: boolean;
  shouldShowTour: boolean;
  shouldShowChecklist: boolean;
  isTourActive: boolean;
  currentTourStep: number;
}

export const useOnboardingProgress = (
  params: UseOnboardingProgressParams
): UseOnboardingProgressReturn => {
  const { user } = useAuth();
  const { firmSettings, loadingSettings } = params;
  
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  // ... resto do código permanece igual, mas usando firmSettings do params ...

  // Loading combinado
  const isLoading = isLoadingProgress || loadingSettings;

  return {
    progress,
    isLoading,
    // ...
  };
};
```

### MainLayout

```typescript
const MainLayout = () => {
  const { user, loading } = useAuth();
  const { firmSettings, isLoading: loadingSettings, refetch } = useFirmSettings();
  
  // Passar dependências para o hook
  const {
    isLoading: loadingOnboarding,
    shouldShowWelcome,
    // ...
  } = useOnboardingProgress({
    firmSettings,
    loadingSettings,
  });

  // Verificação de loading já inclui tudo
  if (loading || loadingOnboarding) {
    return <Spinner />;
  }
  
  // ...
};
```

---

## Ordem de Implementação

1. Modificar `useOnboardingProgress.ts` para aceitar parâmetros
2. Atualizar `MainLayout.tsx` para passar os parâmetros
3. Testar fluxo completo de signup → wizard → welcome modal

