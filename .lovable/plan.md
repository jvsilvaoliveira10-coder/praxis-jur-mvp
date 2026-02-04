

# Plano: Correção da Tela Branca no Fluxo de Onboarding

## Problema Identificado

O sistema está apresentando tela branca após o primeiro formulário de cadastro devido a uma **condição de corrida** entre múltiplos hooks que carregam dados do banco simultaneamente, combinada com verificações de estado incompletas.

---

## Causa Raiz

O fluxo atual tem uma sequência problemática:

```text
Signup → Navigate /dashboard → MainLayout monta
                                      ↓
                         +---------------------------+
                         | useFirmSettings (Query 1) |
                         +---------------------------+
                                      ↓
                         +---------------------------+
                         | useOnboardingProgress     |
                         |   ↳ useFirmSettings       |
                         |     (Query 2 - duplicada) |
                         +---------------------------+
                                      ↓
                         useEffect verifica estados
                         antes das queries terminarem
                                      ↓
                              TELA BRANCA
```

---

## Correções Necessárias

### 1. Adicionar Estado de Loading Global no MainLayout

**Arquivo:** `src/components/layout/MainLayout.tsx`

Aguardar que TODOS os dados necessários estejam carregados antes de renderizar qualquer componente de onboarding.

**Antes (problemático):**
```typescript
const { firmSettings, isLoading: loadingSettings } = useFirmSettings();
const { shouldShowWelcome, ... } = useOnboardingProgress();

// Apenas verifica loading do auth
if (loading) { return <Spinner /> }
```

**Depois (corrigido):**
```typescript
const { firmSettings, isLoading: loadingSettings } = useFirmSettings();
const { shouldShowWelcome, isLoading: loadingOnboarding, ... } = useOnboardingProgress();

// Verifica TODOS os loadings
if (loading || loadingSettings || loadingOnboarding) {
  return <Spinner />
}
```

### 2. Corrigir Verificação no useEffect do Wizard

**Arquivo:** `src/components/layout/MainLayout.tsx`

**Antes:**
```typescript
useEffect(() => {
  if (!loadingSettings && firmSettings && !firmSettings.onboarding_completed) {
    setShowOnboarding(true);
  }
}, [firmSettings, loadingSettings]);
```

**Depois:**
```typescript
useEffect(() => {
  // Só verificar quando o loading terminar E firmSettings existir
  if (!loadingSettings) {
    if (firmSettings && !firmSettings.onboarding_completed) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }
}, [firmSettings, loadingSettings]);
```

### 3. Corrigir Rotas no OnboardingChecklist

**Arquivo:** `src/components/onboarding/OnboardingChecklist.tsx`

As rotas estão em português mas deveriam estar em inglês:

| Errado | Correto |
|--------|---------|
| `/clientes/novo` | `/clients/new` |
| `/processos/novo` | `/cases/new` |
| `/peticoes/nova` | `/petitions/new` |
| `/configuracoes` | `/configuracoes` (este está correto) |

### 4. Corrigir useEffect sem Dependências

**Arquivo:** `src/components/onboarding/OnboardingChecklist.tsx`

**Antes:**
```typescript
useEffect(() => {
  checkAndUpdateProgress();
}, []); // ESLint warning: missing dependency
```

**Depois:**
```typescript
useEffect(() => {
  checkAndUpdateProgress();
}, [checkAndUpdateProgress]);
```

### 5. Exportar isLoading do Hook

**Arquivo:** `src/hooks/useOnboardingProgress.ts`

Garantir que o `isLoading` está sendo retornado e usado corretamente no MainLayout.

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/layout/MainLayout.tsx` | Adicionar verificação de loading completa |
| `src/components/onboarding/OnboardingChecklist.tsx` | Corrigir rotas e dependências do useEffect |
| `src/hooks/useOnboardingProgress.ts` | Garantir retorno correto do isLoading |

---

## Fluxo Corrigido

```text
Signup → Navigate /dashboard → MainLayout monta
                                      ↓
                         +---------------------------+
                         | loading = true            |
                         | Mostra Spinner            |
                         +---------------------------+
                                      ↓
                         Todas as queries terminam:
                         - Auth loading = false
                         - firmSettings loaded
                         - onboarding progress loaded
                                      ↓
                         +---------------------------+
                         | loading = false           |
                         | Renderiza UI corretamente |
                         +---------------------------+
```

---

## Seção Técnica

### Código Completo da Correção no MainLayout

```typescript
const MainLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { firmSettings, isLoading: loadingSettings, refetch } = useFirmSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const {
    isLoading: loadingOnboarding,  // <- ADICIONAR
    shouldShowWelcome,
    shouldShowChecklist,
    isTourActive,
    currentTourStep,
    markWelcomeModalSeen,
    markTourCompleted,
    updateTourStep,
    startTour,
    stopTour,
    markPipelineVisited,
    checkAndUpdateProgress,
  } = useOnboardingProgress();

  // Check if onboarding wizard should be shown
  useEffect(() => {
    if (!loadingSettings) {
      if (firmSettings && !firmSettings.onboarding_completed) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    }
  }, [firmSettings, loadingSettings]);

  // ... outros useEffects ...

  // CORREÇÃO: Aguardar TODOS os loadings
  if (loading || loadingSettings || loadingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // ... resto do componente ...
};
```

### Código da Correção no OnboardingChecklist

```typescript
const tasks: ChecklistTask[] = [
  {
    id: 'profile',
    title: 'Completar perfil',
    description: 'Preencha seus dados profissionais',
    icon: User,
    completed: !!(firmSettings?.lawyer_name && firmSettings?.oab_number),
    action: () => navigate('/configuracoes'),  // Correto
    actionLabel: 'Configurações',
  },
  {
    id: 'client',
    title: 'Cadastrar primeiro cliente',
    description: 'Adicione seu primeiro cliente',
    icon: Users,
    completed: progress?.first_client_created ?? false,
    action: () => navigate('/clients/new'),  // CORRIGIDO
    actionLabel: 'Novo Cliente',
  },
  {
    id: 'case',
    title: 'Criar primeiro processo',
    description: 'Registre um processo judicial',
    icon: FileText,
    completed: progress?.first_case_created ?? false,
    action: () => navigate('/cases/new'),  // CORRIGIDO
    actionLabel: 'Novo Processo',
  },
  {
    id: 'petition',
    title: 'Gerar primeira petição',
    description: 'Use a IA para criar uma petição',
    icon: FileText,
    completed: progress?.first_petition_generated ?? false,
    action: () => navigate('/petitions/new'),  // CORRIGIDO
    actionLabel: 'Nova Petição',
  },
  // ...
];
```

---

## Ordem de Execução

1. Modificar `MainLayout.tsx` para aguardar todos os loadings
2. Corrigir rotas no `OnboardingChecklist.tsx`
3. Corrigir dependência do useEffect no `OnboardingChecklist.tsx`
4. Testar fluxo completo de signup → onboarding

---

## Resultado Esperado

Após as correções:
1. Usuário faz signup
2. É redirecionado para `/dashboard`
3. Vê spinner enquanto dados carregam
4. Wizard de onboarding aparece corretamente
5. Após completar wizard, Welcome Modal aparece
6. Checklist funciona com rotas corretas

