

# Plano: Corrigir o Resumo Inteligente do Dashboard

## Problema Identificado

A edge function `dashboard-insights` funciona corretamente (testei e ela retornou alertas, insights e sugestoes mesmo com apenas 1 processo). O problema esta no componente `AIInsightsCard.tsx`:

1. O `useEffect` dispara na montagem do componente, mas nesse momento o `user` do `useAuth()` ainda pode ser `null` (o auth ainda esta carregando)
2. A funcao `fetchInsights` verifica `if (!user) return` e sai sem fazer nada
3. Mesmo quando o `user` fica disponivel depois, o `useEffect` nao re-executa de forma confiavel porque o `loadCached` com `useCallback` sem dependencias retorna sempre `false` (nao ha cache) e o efeito ja rodou
4. Adicionalmente, ha um warning de "Function components cannot be given refs" no `Skeleton`, que e inofensivo mas poluindo o console

## Correcoes

### 1. Corrigir a condição de corrida no AIInsightsCard.tsx

**Problema**: O `useEffect` depende de `loadCached` e `fetchInsights`, mas `fetchInsights` usa `user` que pode ser `null` inicialmente.

**Solucao**: Simplificar a logica para que o efeito dependa diretamente de `user`. Quando `user` mudar de `null` para o objeto do usuario, o efeito re-executa e finalmente chama `fetchInsights`.

```typescript
// Antes (problematico):
useEffect(() => {
  if (!loadCached()) {
    fetchInsights();
  }
}, [loadCached, fetchInsights]);

// Depois (corrigido):
useEffect(() => {
  if (!user) return;
  if (!loadCached()) {
    fetchInsights();
  }
}, [user]); // Re-executa quando user muda de null -> objeto
```

Tambem remover os `useCallback` desnecessarios que complicam as dependencias sem necessidade.

### 2. Adicionar tratamento para erro silencioso

Incluir um `console.error` no catch para facilitar debug futuro:
```typescript
} catch (e) {
  console.error('AI Insights error:', e);
  setError(e instanceof Error ? e.message : 'Erro desconhecido');
}
```

### 3. Melhorar o estado de loading

Mostrar um estado mais amigavel enquanto o auth esta carregando (antes do `user` estar disponivel), ao inves de nao mostrar nada.

## Secao Tecnica

### Arquivo modificado

| Arquivo | Mudanca |
|---------|---------|
| `src/components/dashboard/AIInsightsCard.tsx` | Corrigir condicao de corrida, simplificar useEffect/useCallback, adicionar logging de erro |

### Causa raiz detalhada

O fluxo atual:
1. `Dashboard` monta -> `AIInsightsCard` monta
2. `useAuth()` retorna `user: null` (auth ainda carregando)
3. `useEffect` executa -> `loadCached()` retorna false -> chama `fetchInsights()`
4. `fetchInsights` verifica `if (!user) return` -> sai sem fazer nada, sem setar loading nem erro
5. Auth termina de carregar -> `user` fica disponivel
6. `fetchInsights` e recriado via `useCallback` com novo `user`
7. Mas o `useEffect` pode nao re-executar de forma consistente (depende de como React avalia as refs dos callbacks)

O fluxo corrigido:
1. `Dashboard` monta -> `AIInsightsCard` monta
2. `useAuth()` retorna `user: null`
3. `useEffect` executa -> `if (!user) return` -> nao faz nada (correto)
4. Auth termina -> `user` muda -> `useEffect` re-executa
5. `loadCached()` retorna false -> `fetchInsights()` executa com sucesso

