

# Plano: Formulário de Onboarding Premium

## Problemas Identificados

### 1. Dois Botoes X de Fechar
O `DialogContent` do Radix possui um botao X padrao (linha 45-48 de dialog.tsx), e o `OnboardingWizard.tsx` adiciona outro X customizado (linhas 236-238). Resultado: dois botoes X sobrepostos.

### 2. Design Amador
O formulario atual tem varios problemas visuais:
- Sem hierarquia visual clara
- Inputs basicos sem tratamento premium
- Falta de espacamento e respiro
- Progress bar simples demais
- Sem efeitos de transicao entre etapas
- Cards de selecao muito simples
- Falta de gradientes e sombras sutis

---

## Solucao: Redesign Premium Completo

### Conceito Visual

**Antes (Amador)**:
```text
+----------------------------------+
| Logo  Titulo              X   X  |  <- Dois X!
+----------------------------------+
| (o)---(o)---(o)---(o)---(5)      |  <- Progress simples
+----------------------------------+
| [Icone circular]                 |
| Titulo                           |
| [Input basico]                   |
| [Input basico]                   |
+----------------------------------+
| Pular    [Voltar] [Continuar]    |
+----------------------------------+
```

**Depois (Premium)**:
```text
+------------------------------------------+
| [Sidebar Escuro]  |  [Area Principal]    |
|                   |                       |
| Logo Praxis       |  Dados do Advogado   |
|                   |                       |
| 1 Advogado   [*]  |  Preencha suas       |
| 2 Escritorio [ ]  |  informacoes         |
| 3 Endereco   [ ]  |  profissionais       |
| 4 Estrutura  [ ]  |                       |
| 5 Areas      [ ]  |  [Inputs Elegantes]  |
|                   |                       |
| Pular por agora   |     [Continuar ->]   |
+------------------------------------------+
```

---

## Estrutura do Novo Design

### Layout Principal

**Formato: Dialog Split-Screen**
- Largura maior: `max-w-4xl` (896px)
- Altura fixa: `h-[600px]`
- Duas colunas:
  - **Esquerda (280px)**: Sidebar escuro com navegacao vertical
  - **Direita (flex-1)**: Conteudo do formulario

### Sidebar Esquerdo (Premium)

| Elemento | Descricao |
|----------|-----------|
| **Logo** | Praxis AI com tagline |
| **Progress Vertical** | Steps em lista com indicadores |
| **Botao Pular** | Link discreto no rodape |

Design do Progress:
```text
[1] Advogado         <- Atual (highlight)
    |
[*] Escritorio       <- Completo (check)
    |
[ ] Endereco         <- Pendente (cinza)
    |
[ ] Estrutura
    |
[ ] Areas
```

### Area Principal (Direita)

| Secao | Conteudo |
|-------|----------|
| **Header** | Titulo grande + subtitulo |
| **Formulario** | Inputs com labels flutuantes, icones sutis |
| **Footer** | Botoes Voltar/Continuar alinhados a direita |

---

## Detalhes de Design Premium

### Cores e Gradientes

```css
/* Sidebar */
background: linear-gradient(180deg, hsl(222 47% 15%) 0%, hsl(222 47% 12%) 100%);

/* Botao Continuar */
background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(222 80% 45%) 100%);

/* Cards de selecao selecionados */
background: linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, hsl(var(--primary)/0.05) 100%);
border: 2px solid hsl(var(--primary));
```

### Inputs Premium

- Bordas arredondadas (`rounded-xl`)
- Foco com anel colorido (`focus:ring-2 focus:ring-primary/20`)
- Labels com animacao de flutuacao
- Icones a esquerda integrados
- Altura maior para conforto (`h-12`)

### Transicoes entre Steps

- Animacao de slide suave ao trocar etapa
- Fade in/out do conteudo
- Progress bar com transicao animada

### Cards de Selecao (Tipo de Escritorio, Areas)

```text
+-----------------------------------+
| [Icone em circulo com gradiente]  |
| Advogado Solo                     |
| Atuo individualmente              |
|                     [Radio/Check] |
+-----------------------------------+
```

- Borda que muda de cor ao selecionar
- Background com gradiente sutil
- Hover com elevacao (shadow)

---

## Arquivos a Modificar

### 1. `src/components/ui/dialog.tsx`

**Mudanca**: Adicionar prop `hideCloseButton` ao DialogContent

```tsx
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideCloseButton?: boolean;
}

const DialogContent = React.forwardRef<..., DialogContentProps>(
  ({ className, children, hideCloseButton = false, ...props }, ref) => (
    // ...
    {!hideCloseButton && (
      <DialogPrimitive.Close className="...">
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    )}
  )
);
```

### 2. `src/components/onboarding/OnboardingWizard.tsx`

**Redesign completo** com:
- Layout split-screen (sidebar + conteudo)
- Remover botao X duplicado (usar o do Dialog com hideCloseButton=true)
- Adicionar animacoes de transicao
- Estilizacao premium

### 3. `src/components/onboarding/OnboardingProgress.tsx`

**Redesign** para:
- Layout vertical (lista)
- Indicadores circulares com numeros/checks
- Linhas conectoras verticais
- Highlight no step atual

### 4. Steps Individuais (LawyerDataStep, FirmDataStep, etc.)

**Melhorias em cada step**:
- Remover icone/titulo central (vai para o header principal)
- Inputs com altura maior e estilo premium
- Cards de selecao com gradientes
- Espacamento maior entre elementos

---

## Componentes Novos a Criar

### `src/components/onboarding/OnboardingSidebar.tsx`

Sidebar esquerdo com:
- Logo
- Progress vertical
- Link "Pular por agora"

### `src/components/onboarding/OnboardingStepContent.tsx`

Wrapper para cada step com:
- Header (titulo + descricao)
- Area de scroll para conteudo
- Footer com botoes

---

## Fluxo de Navegacao Atualizado

```text
Usuario abre app pela primeira vez
        |
        v
[Dialog Premium abre]
        |
        v
Step 1: Dados do Advogado
        |
        v [Continuar]
Step 2: Dados do Escritorio
        |
        v [Continuar]
Step 3: Endereco Comercial
        |
        v [Continuar]
Step 4: Estrutura do Escritorio
        |
        v [Continuar]
Step 5: Areas de Atuacao
        |
        v [Finalizar]
[Toast de sucesso]
[Redireciona para Dashboard]
```

---

## Animacoes

| Elemento | Animacao |
|----------|----------|
| **Entrada do Dialog** | Fade + scale suave |
| **Transicao de Step** | Slide horizontal (esquerda/direita) |
| **Progress indicator** | Transicao de cor suave |
| **Inputs** | Focus ring com expand |
| **Botoes** | Hover com lift (translateY) |

Implementacao via CSS/Tailwind:
```css
/* Transicao de step */
.step-enter {
  opacity: 0;
  transform: translateX(20px);
}
.step-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}
```

---

## Resultado Visual Esperado

O novo formulario tera:

1. **Aparencia Premium** - Gradientes, sombras sutis, espacamento generoso
2. **Navegacao Clara** - Sidebar mostra progresso e permite visualizar todas as etapas
3. **Experiencia Fluida** - Animacoes suaves entre steps
4. **Um unico X** - Problema dos dois botoes resolvido
5. **Mobile Friendly** - Layout responsivo que empilha em telas pequenas
6. **Profissionalismo** - Transmite confianca desde o primeiro contato

---

## Ordem de Implementacao

1. Modificar `dialog.tsx` para suportar `hideCloseButton`
2. Criar novo `OnboardingSidebar.tsx`
3. Redesenhar `OnboardingProgress.tsx` para layout vertical
4. Refatorar `OnboardingWizard.tsx` com layout split-screen
5. Atualizar cada Step com estilo premium
6. Adicionar animacoes de transicao
7. Testar responsividade

