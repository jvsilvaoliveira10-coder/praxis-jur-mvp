

# Plano: Correção dos Erros no Módulo Financeiro

## Diagnóstico Completo

Após análise profunda do código, identifiquei **uma causa raiz principal** que está quebrando todos os formulários do módulo financeiro:

### Erro Principal: `SelectItem` com valor vazio

O erro nos logs é claro:
```
A <Select.Item /> must have a value prop that is not an empty string
```

**Arquivos afetados e linhas específicas:**

| Arquivo | Linha | Problema |
|---------|-------|----------|
| `ReceivableForm.tsx` | 269 | `<SelectItem value="">Nenhum</SelectItem>` |
| `ReceivableForm.tsx` | 284 | `<SelectItem value="">Nenhum</SelectItem>` |
| `PayableForm.tsx` | 264 | `<SelectItem value="">Nenhum</SelectItem>` |
| `FeeContractForm.tsx` | 249 | `<SelectItem value="">Nenhum</SelectItem>` |

O componente `@radix-ui/react-select` **não permite** valores vazios em `SelectItem` porque o Select usa string vazia internamente para representar "sem seleção" (mostrar placeholder).

---

## Solução Técnica

### Correção 1: Usar valor especial em vez de string vazia

Mudar de:
```tsx
<SelectItem value="">Nenhum</SelectItem>
```

Para:
```tsx
<SelectItem value="none">Nenhum</SelectItem>
```

E ajustar a lógica de submit para tratar "none" como null:
```tsx
client_id: form.client_id === 'none' ? null : form.client_id || null,
case_id: form.case_id === 'none' ? null : form.case_id || null,
```

---

## Arquivos a Modificar

### 1. `src/pages/finance/ReceivableForm.tsx`

**Alterações:**
- Linha 269: Mudar `value=""` para `value="none"`
- Linha 284: Mudar `value=""` para `value="none"`
- Linha 139-140: Ajustar payload para tratar "none" como null
- Linha 91-92: Ao carregar dados para edição, converter null para "none"

### 2. `src/pages/finance/PayableForm.tsx`

**Alterações:**
- Linha 264: Mudar `value=""` para `value="none"`
- Linha 124: Ajustar payload para tratar "none" como null
- Linha 79: Ao carregar dados para edição, converter null para "none"

### 3. `src/pages/finance/FeeContractForm.tsx`

**Alterações:**
- Linha 249: Mudar `value=""` para `value="none"`
- Linha 152: Ajustar payload para tratar "none" como null
- Linha 95: Ao carregar dados para edição, converter null para "none"

---

## Detalhes da Implementação

### ReceivableForm.tsx - Mudanças

```text
Linha 91-92 (carregar form):
  Antes:
    client_id: data.client_id || '',
    case_id: data.case_id || '',
  
  Depois:
    client_id: data.client_id || 'none',
    case_id: data.case_id || 'none',

Linha 139-140 (payload):
  Antes:
    client_id: form.client_id || null,
    case_id: form.case_id || null,
  
  Depois:
    client_id: form.client_id && form.client_id !== 'none' ? form.client_id : null,
    case_id: form.case_id && form.case_id !== 'none' ? form.case_id : null,

Linha 269 e 284 (SelectItem):
  Antes:
    <SelectItem value="">Nenhum</SelectItem>
  
  Depois:
    <SelectItem value="none">Nenhum</SelectItem>

Estado inicial (linha 52-53):
  Antes:
    client_id: '',
    case_id: '',
  
  Depois:
    client_id: 'none',
    case_id: 'none',
```

### PayableForm.tsx - Mudanças

```text
Estado inicial (linha 46):
  Antes:
    case_id: '',
  
  Depois:
    case_id: 'none',

Linha 79 (carregar form):
  Antes:
    case_id: data.case_id || '',
  
  Depois:
    case_id: data.case_id || 'none',

Linha 124 (payload):
  Antes:
    case_id: form.case_id || null,
  
  Depois:
    case_id: form.case_id && form.case_id !== 'none' ? form.case_id : null,

Linha 264 (SelectItem):
  Antes:
    <SelectItem value="">Nenhum</SelectItem>
  
  Depois:
    <SelectItem value="none">Nenhum</SelectItem>
```

### FeeContractForm.tsx - Mudanças

```text
Estado inicial (linha 51):
  Antes:
    case_id: '',
  
  Depois:
    case_id: 'none',

Linha 95 (carregar form):
  Antes:
    case_id: data.case_id || '',
  
  Depois:
    case_id: data.case_id || 'none',

Linha 152 (payload):
  Antes:
    case_id: form.case_id || null,
  
  Depois:
    case_id: form.case_id && form.case_id !== 'none' ? form.case_id : null,

Linha 249 (SelectItem):
  Antes:
    <SelectItem value="">Nenhum</SelectItem>
  
  Depois:
    <SelectItem value="none">Nenhum</SelectItem>
```

---

## Resumo das Correções

| Arquivo | Tipo de Correção | Quantidade de Alterações |
|---------|-----------------|-------------------------|
| ReceivableForm.tsx | SelectItem + Estado + Payload | 6 pontos |
| PayableForm.tsx | SelectItem + Estado + Payload | 4 pontos |
| FeeContractForm.tsx | SelectItem + Estado + Payload | 4 pontos |

---

## Resultado Esperado

1. **Nova Receita** funcionará sem erro
2. **Nova Despesa** funcionará sem erro
3. **Novo Contrato** funcionará sem erro
4. **Novo Lançamento** (Extrato) já está funcionando (não usa SelectItem com valor vazio)
5. **Configurações** já está funcionando (não usa SelectItem com valor vazio)

---

## Validação

Após as correções, testar:
1. Navegar para `/financeiro/receber/novo` e criar uma receita
2. Navegar para `/financeiro/pagar/novo` e criar uma despesa
3. Navegar para `/financeiro/contratos/novo` e criar um contrato
4. Testar também a edição de registros existentes

