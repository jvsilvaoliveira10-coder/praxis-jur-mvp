
# Plano: Tornar o Kanban da Landing Page Responsivo para Mobile

## Problema Identificado

A seção de "Gestão de Processos" da landing page contém um demo interativo do Kanban com 4 colunas. No desktop funciona bem, mas no mobile:

- As 4 colunas são exibidas em `flex` horizontal com `overflow-x-auto`
- Cada coluna tem largura fixa de `w-36` (144px)
- Total: 4 × 144px + gaps = ~600px de largura mínima
- Em telas mobile (< 400px), isso causa overflow e quebra do layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    PROBLEMA ATUAL NO MOBILE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────── Viewport Mobile (375px) ─────────────────┐      │
│  │                                                           │      │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │      │
│  │  │Consulta│ │Documen.│ │Protoc. │ │Encerr. │ <-- OVERFLOW│      │
│  │  │ 144px  │ │ 144px  │ │ 144px  │ │ 144px  │             │      │
│  │  └────────┘ └────────┘ └────────┘ └────────┘             │      │
│  │                        ^^^^^^^^^^^^^^^^^                  │      │
│  │                        Conteúdo fora da tela              │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Solução Proposta

Implementar **duas visualizações distintas**:
- **Desktop/Tablet**: Layout horizontal atual com 4 colunas
- **Mobile**: Layout em **grid 2x2** ou **scroll controlado** com indicadores visuais

### Opção Escolhida: Grid 2x2 no Mobile

No mobile, as 4 colunas serão reorganizadas em um grid 2x2, que cabe perfeitamente na tela:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    SOLUÇÃO: GRID 2x2 NO MOBILE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────── Viewport Mobile (375px) ─────────────────┐      │
│  │                                                           │      │
│  │  ┌─────────────────┐  ┌─────────────────┐                │      │
│  │  │    Consulta     │  │  Documentação   │                │      │
│  │  │   [Maria S.]    │  │    [João P.]    │                │      │
│  │  │   [Carlos R.]   │  │                 │                │      │
│  │  └─────────────────┘  └─────────────────┘                │      │
│  │                                                           │      │
│  │  ┌─────────────────┐  ┌─────────────────┐                │      │
│  │  │   Protocolado   │  │    Encerrado    │                │      │
│  │  │  [Empresa ABC]  │  │    [Pedro R.]   │                │      │
│  │  └─────────────────┘  └─────────────────┘                │      │
│  │                                                           │      │
│  │  ✓ Tudo visível sem scroll horizontal                    │      │
│  │  ✓ Drag-and-drop continua funcionando                    │      │
│  │                                                           │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/landing/ProcessManagementSection.tsx` | MODIFICAR | Adicionar lógica de layout responsivo |
| `src/components/landing/kanban-demo/KanbanColumn.tsx` | MODIFICAR | Ajustar largura para ser flexível |
| `src/components/landing/kanban-demo/KanbanCard.tsx` | MODIFICAR | Pequenos ajustes de tamanho no mobile |

---

## Detalhes Técnicos

### 1. ProcessManagementSection.tsx

Alterar o container das colunas de `flex` fixo para grid responsivo:

```typescript
// ANTES (linha 259):
<div className="flex gap-3 overflow-x-auto pb-2">

// DEPOIS:
<div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:overflow-x-auto sm:pb-2">
```

Isso faz com que:
- **Mobile (< 640px)**: Grid de 2 colunas
- **Desktop (≥ 640px)**: Flex horizontal como antes

### 2. KanbanColumn.tsx

Remover a largura fixa no mobile:

```typescript
// ANTES (linha 18-19):
className={cn(
  'flex-shrink-0 w-36 bg-muted/50 rounded-lg p-2 ...',

// DEPOIS:
className={cn(
  'w-full sm:w-36 sm:flex-shrink-0 bg-muted/50 rounded-lg p-2 ...',
```

No mobile:
- `w-full` faz a coluna ocupar 100% da célula do grid
- No desktop, volta ao `w-36` fixo

### 3. KanbanCard.tsx

Ajustar padding e texto para melhor visualização:

```typescript
// ANTES (linha 24-26):
className={cn(
  'bg-card border rounded-md p-2 shadow-sm cursor-grab ...',

// DEPOIS:
className={cn(
  'bg-card border rounded-md p-2 sm:p-2 shadow-sm cursor-grab ...',
```

Os cards já estão bem otimizados, mas podemos reduzir ligeiramente o padding em telas muito pequenas se necessário.

### 4. Instrução de Drag (Mobile)

Ajustar texto de instrução para mobile:

```typescript
// ANTES:
<span>Experimente! Arraste os cards entre as colunas</span>

// DEPOIS (com responsividade):
<span className="hidden sm:inline">Experimente! Arraste os cards entre as colunas</span>
<span className="sm:hidden">Toque e arraste os cards</span>
```

---

## Comportamento do Drag-and-Drop

O `@dnd-kit/core` já está configurado corretamente com `TouchSensor`:

```typescript
useSensor(TouchSensor, {
  activationConstraint: {
    delay: 100,
    tolerance: 5,
  },
})
```

Isso garante que o drag funcione bem em dispositivos touch. O grid 2x2 não interfere nessa funcionalidade.

---

## Visualização Final Esperada

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  MOBILE (< 640px)              DESKTOP (≥ 640px)                   │
│                                                                    │
│  ┌────────┐ ┌────────┐         ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │Consulta│ │Document│         │Con.│ │Doc.│ │Prot│ │Enc.│        │
│  │  ██    │ │  ██    │         │ ██ │ │ ██ │ │ ██ │ │ ██ │        │
│  │  ██    │ │        │         │ ██ │ │    │ │    │ │    │        │
│  └────────┘ └────────┘         └────┘ └────┘ └────┘ └────┘        │
│  ┌────────┐ ┌────────┐                                            │
│  │Protoc. │ │Encerr. │         ← Flex horizontal com scroll       │
│  │  ██    │ │  ██    │                                            │
│  └────────┘ └────────┘                                            │
│                                                                    │
│  ↑ Grid 2x2 sem scroll                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Ordem de Implementação

1. **KanbanColumn.tsx** - Remover largura fixa, adicionar `w-full sm:w-36`
2. **ProcessManagementSection.tsx** - Trocar container para `grid grid-cols-2 sm:flex`
3. **Ajustar texto de instrução** - Versão curta para mobile
4. **Testar drag-and-drop** - Verificar que funciona no grid 2x2

---

## Resultado Esperado

Após a implementação:
- O Kanban demo será exibido em grid 2x2 em telas mobile
- Todas as 4 colunas ficam visíveis sem scroll horizontal
- O drag-and-drop continua funcionando normalmente
- Em desktop, o layout horizontal é mantido
- A transição entre layouts é suave via Tailwind breakpoints
