
# Corrigir Visibilidade do Checklist de Onboarding

## Diagnostico

O checklist nao aparece porque a logica `shouldShowChecklist` exige duas condicoes que nao estao sendo atendidas:

1. **`firmSettings?.onboarding_completed === true`** - O usuario nao tem registro na tabela `law_firm_settings`, entao `firmSettings` e `null`
2. **`progress.welcome_modal_seen === true`** - Esta como `false` no banco

Essas condicoes fazem com que o checklist nunca seja renderizado, independentemente do posicionamento CSS.

## Solucao

Ajustar a logica no hook `useOnboardingProgress` para que o checklist apareca em mais cenarios:

### Arquivo: `src/hooks/useOnboardingProgress.ts`

Alterar a condicao `shouldShowChecklist` (linha 401-408) para ser mais flexivel:

**Antes:**
```typescript
const shouldShowChecklist = !!(
  !isLoading &&
  firmSettings?.onboarding_completed &&
  progress &&
  progress.welcome_modal_seen &&
  !progress.checklist_dismissed &&
  calculatePercent() < 100
);
```

**Depois:**
```typescript
const shouldShowChecklist = !!(
  !isLoading &&
  progress &&
  !progress.checklist_dismissed &&
  calculatePercent() < 100
);
```

Remover as dependencias de `firmSettings?.onboarding_completed` e `welcome_modal_seen` para o checklist. Isso permite que o checklist apareca assim que o usuario tiver um registro de progresso, sem precisar ter completado o onboarding wizard ou visto o welcome modal.

A logica do welcome modal (`shouldShowWelcome`) permanece inalterada - ele so aparece quando o onboarding foi completado.

### Verificacao do posicionamento

Com o checklist visivel novamente, as posicoes atualizadas serao validadas:
- **Minimizado**: `fixed bottom-6 right-24 z-50` (ao lado do botao de IA)
- **Expandido**: `fixed bottom-24 right-6 z-50` (acima do botao de IA)

---

## Secao Tecnica

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useOnboardingProgress.ts` | Simplificar condicao `shouldShowChecklist` removendo dependencias de `onboarding_completed` e `welcome_modal_seen` |

Apenas 1 arquivo modificado, mudanca de 6 linhas para 4 linhas.
