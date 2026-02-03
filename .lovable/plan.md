
# Plano: Correção do Header e Layout Responsivo

## Problemas Identificados

Após análise detalhada do código e dos seus comentários, identifiquei 4 problemas principais:

### Problema 1: Botão de Fechar Sobrepondo a Scrollbar
O botão X de fechar o Sheet (menu lateral mobile) está posicionado com `right-4` que conflita com a scrollbar quando o conteúdo é longo.

**Causa no código:**
```tsx
// sheet.tsx linha 60
<SheetPrimitive.Close className="absolute right-4 top-4 ...">
```

### Problema 2: Logo Estático vs Header que Rola
O Sidebar é `fixed` e não rola, mas o TopHeader não é sticky/fixed, então quando você rola a página o header desaparece enquanto o logo fica parado. Isso causa a "sensação estranha".

**Causa no código:**
```tsx
// MainLayout.tsx linha 101-106
<main className="ml-64">
  <TopHeader />  // <- Rola junto com o conteúdo
  <div className="p-6">
    <Outlet />
  </div>
</main>
```

### Problema 3: Alturas Inconsistentes
- Sidebar header (logo): altura do padding + logo (cerca de 72px)
- TopHeader: `h-16` = 64px

Essa diferença de 8px causa desalinhamento visual.

### Problema 4: Responsividade Geral
O TopHeader não está otimizado para telas médias e pequenas.

---

## Solução Proposta

### 1. Tornar o TopHeader Sticky

Fazer o header ficar "grudado" no topo quando rolar:

```text
ANTES:
[Logo fixo] | [Header que some ao rolar]
           | [Conteúdo]

DEPOIS:
[Logo fixo] | [Header sticky - sempre visível]
           | [Conteúdo que rola por baixo]
```

### 2. Alinhar Alturas

Padronizar ambos os headers com a mesma altura:

| Elemento | Altura Atual | Altura Nova |
|----------|-------------|-------------|
| Sidebar header (logo) | ~72px | 72px (h-[72px]) |
| TopHeader | 64px (h-16) | 72px (h-[72px]) |

### 3. Corrigir Botão do Sheet

Mover o botão X para não conflitar com scrollbar:

```text
ANTES:
[Logo] [Conteúdo scrollavel] [X]
       |------------------|[Scrollbar]
                           ^ Conflito!

DEPOIS:
[Logo] [X] [Conteúdo scrollavel]
            |------------------|[Scrollbar]
```

### 4. Melhorar Responsividade

Ajustar breakpoints do TopHeader para funcionar melhor em tablets e telas médias.

---

## Arquivos a Modificar

### 1. `src/components/layout/TopHeader.tsx`

**Mudanças:**
- Aumentar altura de `h-16` para `h-[72px]`
- Adicionar `sticky top-0 z-40` para ficar fixo
- Adicionar sombra sutil quando scrolla: `shadow-sm`
- Melhorar responsividade da busca
- Esconder título em telas muito pequenas

**Layout atualizado:**
```text
Desktop (lg+):
[Título da Página] ..................... [Busca 320px] [🔔] [Avatar]

Tablet (md):
[Título] ..................... [Busca 200px] [🔔] [Avatar]

Mobile (sm):
[Título curto] ..................... [🔔] [Avatar]
```

### 2. `src/components/layout/Sidebar.tsx`

**Mudanças:**
- Padronizar altura do header do logo para `h-[72px]`
- Garantir consistência visual

### 3. `src/components/layout/MainLayout.tsx`

**Mudanças:**
- Ajustar estrutura do main para funcionar com sticky header
- Adicionar `overflow-y-auto` no container correto

### 4. `src/components/ui/sheet.tsx`

**Mudanças:**
- Mover botão X de `right-4` para junto do logo (dentro do header do sidebar)
- Ou: esconder botão X padrão e usar um customizado no Sidebar mobile

---

## Detalhes Técnicos

### TopHeader.tsx - Nova Estrutura

```tsx
<header className="sticky top-0 z-40 h-[72px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-6">
```

- `sticky top-0`: Fica fixo no topo ao rolar
- `z-40`: Abaixo do sidebar (z-50) mas acima do conteúdo
- `bg-background/95 backdrop-blur`: Efeito de blur suave quando conteúdo passa por baixo

### Sidebar.tsx - Altura do Header

```tsx
// Linha 258 - trocar p-4 por altura fixa
<div className="h-[72px] px-4 flex items-center border-b border-sidebar-border">
```

### Sheet.tsx - Botão X

Opção escolhida: **Esconder o botão X padrão no side="left"** e deixar o usuário clicar fora para fechar (comportamento padrão do Sheet).

```tsx
// Adicionar prop hideCloseButton ou verificar side
{side !== "left" && (
  <SheetPrimitive.Close className="...">
    <X className="h-4 w-4" />
  </SheetPrimitive.Close>
)}
```

---

## Resultado Visual Esperado

```text
+---------------------------+----------------------------------------+
|  [Logo Práxis AI]         |  Dashboard     [Buscar...]  🔔  [JL]  |
|  Hub Jurídico (h=72px)    |  (h=72px - sticky)                    |
+---------------------------+----------------------------------------+
|  [Menu items]             |  [Conteúdo da página]                 |
|  [que rolam]              |  [que rola por baixo do header]       |
|  [independente]           |                                       |
+---------------------------+----------------------------------------+
```

Benefícios:
1. **Alinhamento perfeito** - Ambos os headers com 72px
2. **Header sempre visível** - Busca e navegação acessíveis
3. **Sem conflito de scroll** - Botão X reposicionado
4. **Visual profissional** - Blur suave no header ao rolar
5. **Responsivo** - Adapta bem a todas as telas

---

## Ordem de Implementação

1. Corrigir sheet.tsx (botão X)
2. Atualizar Sidebar.tsx (altura do header)
3. Atualizar TopHeader.tsx (sticky + altura + responsividade)
4. Ajustar MainLayout.tsx (estrutura de scroll)
5. Testar em diferentes tamanhos de tela
