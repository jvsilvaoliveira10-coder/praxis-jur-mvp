

# Plano: Header com Destaque e Sidebar Polida

## Problemas a Resolver

### 1. TopHeader sem Destaque
Atualmente o header usa `bg-background/95` (branco), mesma cor do conteúdo. Precisa de uma cor de destaque.

### 2. Botão de Recolher em Cima da Scrollbar
O botão está posicionado em `absolute -right-3 top-20`, que conflita com a barra de rolagem quando o sidebar tem muito conteúdo.

### 3. Scrollbar Visível no Sidebar
A barra de rolagem está aparecendo e deixando o visual menos limpo.

---

## Soluções Propostas

### 1. Header com Cor de Destaque

Mudar o TopHeader para usar uma variação mais suave do azul do sidebar:

**Opção: Azul Claro Profissional**
- Usar um tom de azul mais claro que o sidebar, mas que ainda faça parte da paleta
- Criar uma variável CSS nova: `--header-background`
- Texto em contraste apropriado

Visual:
```text
+---------------------------+----------------------------------------+
|  [Sidebar Navy]           |  [Header Azul Claro]                  |
|  #1e2a4a                   |  #2a3f5f (mais claro)                 |
+---------------------------+----------------------------------------+
|                           |  [Conteúdo Branco]                    |
```

### 2. Reposicionar Botão de Recolher

Mover o botão de colapsar para **dentro** da área do header do sidebar, ao lado do logo:

```text
ANTES:
[Logo Práxis AI        ]   (botão flutuando no meio, por cima da scrollbar)
[Menu items             ]
[                      •]  <- botão aqui conflitando

DEPOIS:
[Logo Práxis AI    [<]]    <- botão no header, junto do logo
[Menu items            ]
[                       ]
```

### 3. Esconder Scrollbar do Sidebar

Adicionar CSS para esconder a scrollbar mas manter a funcionalidade de scroll:

```css
/* Esconde scrollbar mas mantém scroll */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

## Mudancas Tecnicas

### Arquivo 1: `src/index.css`

Adicionar novas variaveis CSS e classe utilitaria:

```css
:root {
  /* Header com tom mais claro que sidebar */
  --header-background: 222 40% 25%;
  --header-foreground: 210 20% 95%;
}

/* Classe para esconder scrollbar */
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Arquivo 2: `src/components/layout/TopHeader.tsx`

Mudancas na linha 87:

```tsx
// ANTES
<header className="sticky top-0 z-40 h-[72px] border-b border-border bg-background/95 backdrop-blur ...">

// DEPOIS
<header className="sticky top-0 z-40 h-[72px] border-b border-sidebar-border bg-[hsl(222,40%,25%)] text-white ...">
```

Tambem ajustar cores dos elementos internos para contrastar com o fundo escuro:
- Titulo: texto branco
- Busca: fundo com transparencia, texto claro
- Icones: brancos

### Arquivo 3: `src/components/layout/Sidebar.tsx`

**Mudanca 1**: Mover botao de recolher para dentro do header (linha 258-268):

```tsx
<div className="h-[72px] px-4 flex items-center justify-between border-b border-sidebar-border">
  <div className="flex items-center gap-3">
    <img src="/favicon.svg" alt="Práxis AI" className="w-10 h-10" />
    {!isCollapsed && (
      <div className="overflow-hidden">
        <h1 className="font-serif font-bold text-lg leading-tight">Práxis AI</h1>
        <p className="text-xs text-sidebar-foreground/70">Hub Jurídico Inteligente</p>
      </div>
    )}
  </div>
  {/* Botão de recolher movido para cá */}
  <Button
    variant="ghost"
    size="icon"
    className="w-8 h-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
    onClick={() => setCollapsed(!collapsed)}
  >
    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
  </Button>
</div>
```

**Mudanca 2**: Remover o botao absoluto antigo (linhas 301-313)

**Mudanca 3**: Adicionar classe para esconder scrollbar na nav (linha 271):

```tsx
<nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hidden">
```

---

## Paleta de Cores Resultante

| Elemento | Cor HSL | Hex Aproximado |
|----------|---------|----------------|
| Sidebar | 222 47% 15% | #1a2540 |
| Header | 222 40% 25% | #2e3f5c |
| Conteudo | 210 20% 98% | #f8f9fb |

O header fica visivelmente mais claro que o sidebar, criando uma hierarquia visual, mas ainda mantendo a paleta profissional navy/azul.

---

## Resultado Visual Esperado

```text
+---------------------------+----------------------------------------+
|  [Navy Escuro]            |  [Azul Medio - destaca]               |
|  Logo Práxis    [<]       |  Dashboard  [Busca...]   🔔  [JL]     |
+---------------------------+----------------------------------------+
|  [Menu sem scrollbar]     |  [Conteudo branco]                    |
|  Jurídico v               |                                       |
|    Dashboard              |                                       |
|    Clientes               |                                       |
|    ...                    |                                       |
+---------------------------+----------------------------------------+
```

**Beneficios**:
1. Header com destaque visual - nao se confunde com o conteudo
2. Botao de recolher em lugar logico (no header)
3. Sidebar limpo sem scrollbar visivel
4. Visual profissional e coeso

---

## Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/index.css` | Adicionar variaveis CSS e classe scrollbar-hidden |
| `src/components/layout/TopHeader.tsx` | Mudar background para azul, ajustar cores de texto |
| `src/components/layout/Sidebar.tsx` | Mover botao de recolher para header, esconder scrollbar |

