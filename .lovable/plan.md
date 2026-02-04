
# Plano Completo: Correção da Tela Branca e Estabilização do Onboarding

## Resumo do Problema

O sistema está inutilizável para novos usuários porque:

1. **Crash no OnboardingWizard**: Quando o usuário avança para o step 5 e clica "Continuar", o sistema salva `onboarding_step = 6` no banco. Na próxima renderização, o código tenta acessar `stepInfo[5]` (que não existe), causando crash.

2. **Wizard sempre monta**: O `MainLayout` renderiza `<OnboardingWizard open={...} />` incondicionalmente. Mesmo com `open={false}`, o componente interno executa lógica que causa o crash.

3. **Usuários já afetados**: Existem registros no banco com `onboarding_step = 6`, travando esses usuários permanentemente.

---

## Correções Necessárias

### 1. Corrigir o OnboardingWizard

**Arquivo:** `src/components/onboarding/OnboardingWizard.tsx`

**Problemas:**
- Linha 121: `onboarding_step: currentStep + 1` salva 6 quando step=5
- Linha 234: `stepInfo[currentStep - 1]` retorna undefined quando step=6
- Linha 103: Carrega step inválido do banco sem validação

**Correções:**

```typescript
// Linha 103 - Clamp ao carregar do banco
setCurrentStep(Math.min(Math.max(firmSettings.onboarding_step || 1, 1), TOTAL_STEPS));

// Linha 121 - Não salvar step > TOTAL_STEPS
const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);
await updateSettings.mutateAsync({
  ...formData,
  onboarding_step: nextStep,
} as Partial<FirmSettings>);

// Linha 234 - Guard antes de acessar
const safeStep = Math.min(Math.max(currentStep, 1), TOTAL_STEPS);
const currentStepInfo = stepInfo[safeStep - 1];
```

### 2. Renderização Condicional do Wizard

**Arquivo:** `src/components/layout/MainLayout.tsx`

**Problema:** O wizard é montado sempre, mesmo quando `open={false}`.

**Correção:** Só montar quando necessário.

```typescript
// Antes (problemático)
<OnboardingWizard 
  open={showOnboarding} 
  onClose={handleOnboardingClose} 
  onComplete={handleOnboardingComplete} 
/>

// Depois (corrigido)
{showOnboarding && (
  <OnboardingWizard 
    open={showOnboarding} 
    onClose={handleOnboardingClose} 
    onComplete={handleOnboardingComplete} 
  />
)}
```

### 3. Corrigir Dados no Banco

**Ação:** Atualizar registros onde `onboarding_step > 5` para `onboarding_step = 5`.

```sql
UPDATE law_firm_settings 
SET onboarding_step = 5 
WHERE onboarding_step > 5;
```

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/onboarding/OnboardingWizard.tsx` | Clamp do step (1-5), não salvar step 6 |
| `src/components/layout/MainLayout.tsx` | Renderizar wizard apenas quando `showOnboarding=true` |
| **Migration SQL** | Corrigir dados existentes no banco |

---

## Detalhes Técnicos

### OnboardingWizard.tsx - Correções Completas

```typescript
// Constante para validação
const TOTAL_STEPS = 5;

// useEffect para carregar dados (linha ~73-105)
useEffect(() => {
  if (firmSettings) {
    setFormData({
      // ... campos existentes ...
    });
    // CORREÇÃO: Garantir que step está no range válido
    const savedStep = firmSettings.onboarding_step || 1;
    setCurrentStep(Math.min(Math.max(savedStep, 1), TOTAL_STEPS));
  }
}, [firmSettings]);

// saveCurrentStep (linha ~116-128)
const saveCurrentStep = async () => {
  setSaving(true);
  try {
    // CORREÇÃO: Não salvar step maior que TOTAL_STEPS
    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS);
    await updateSettings.mutateAsync({
      ...formData,
      onboarding_step: nextStep,
    } as Partial<FirmSettings>);
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    setSaving(false);
  }
};

// Antes de usar stepInfo (linha ~234)
// CORREÇÃO: Garantir acesso seguro ao array
const safeCurrentStep = Math.min(Math.max(currentStep, 1), TOTAL_STEPS);
const currentStepInfo = stepInfo[safeCurrentStep - 1];
```

### MainLayout.tsx - Renderização Condicional

```typescript
// Mobile layout (linha ~112-117)
{showOnboarding && (
  <OnboardingWizard 
    open={showOnboarding} 
    onClose={handleOnboardingClose} 
    onComplete={handleOnboardingComplete} 
  />
)}

// Desktop layout (linha ~172-176) - mesma alteração
{showOnboarding && (
  <OnboardingWizard 
    open={showOnboarding} 
    onClose={handleOnboardingClose} 
    onComplete={handleOnboardingComplete} 
  />
)}
```

---

## Fluxo Corrigido

```text
Usuário cria conta
       ↓
law_firm_settings criado (onboarding_step = 1)
       ↓
MainLayout carrega
       ↓
onboarding_completed = false → showOnboarding = true
       ↓
{showOnboarding && <OnboardingWizard />} → Wizard monta
       ↓
Wizard carrega step com clamp: Math.min(Math.max(step, 1), 5)
       ↓
Usuário navega steps 1→2→3→4→5
       ↓
No step 5, salva onboarding_step = 5 (não 6!)
       ↓
Clica "Finalizar" → completeOnboarding() → onboarding_completed = true
       ↓
showOnboarding = false → Wizard desmonta (não crasheia)
       ↓
WelcomeModal aparece corretamente
```

---

## Ordem de Implementação

1. **Criar migration SQL** para corrigir dados existentes (`onboarding_step > 5`)
2. **Modificar OnboardingWizard.tsx** com clamp e guards
3. **Modificar MainLayout.tsx** para renderização condicional
4. **Testar fluxo completo** de novo usuário

---

## Resultado Esperado

Após as correções:
- Novos usuários conseguem completar o wizard sem tela branca
- Usuários já afetados são destravados pela migration
- O wizard só é montado quando necessário
- O step nunca ultrapassa 5, mesmo em edge cases
