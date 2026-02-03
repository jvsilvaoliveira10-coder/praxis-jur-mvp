

# Plano: Formularios Premium Centralizados

## Problema Identificado

Os formularios atuais (ClientForm, CaseForm, PetitionForm) tem design basico com:
- Alinhamento a esquerda deixando espaco vazio na direita
- Cards com estilo simples sem tratamento premium
- Inputs basicos sem os refinamentos visuais do onboarding
- Falta de hierarquia visual e espacamento elegante

## Solucao: Design Premium Centralizado

### Conceito Visual

Transformar os formularios para seguir o padrao premium do onboarding:

```text
ANTES (Atual):
+--Sidebar--+-------------------------------------+
|           | [Form max-w-3xl]      [VAZIO]       |
|           | [Card basico]                       |
|           | [Inputs simples]                    |
+-----------+-------------------------------------+

DEPOIS (Premium):
+--Sidebar--+-------------------------------------+
|           |         [Conteudo Centralizado]     |
|           |         [Header Premium]            |
|           |         [Card Elegante]             |
|           |         [Inputs h-12 rounded-xl]    |
+-----------+-------------------------------------+
```

---

## Elementos de Design Premium a Aplicar

### 1. Layout Centralizado

Usar `mx-auto` com largura maxima apropriada para cada formulario:
- ClientForm: `max-w-3xl mx-auto` (multi-etapas)
- CaseForm: `max-w-2xl mx-auto` (simples)
- PetitionForm: `max-w-5xl mx-auto` (complexo com 2 colunas)

### 2. Header Premium

Adicionar icone decorativo com gradiente, similar ao onboarding:

```tsx
<div className="flex items-start gap-4 mb-8">
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
    <User className="w-6 h-6 text-primary" />
  </div>
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">
      Novo Cliente
    </h1>
    <p className="text-muted-foreground mt-1 text-sm">
      Preencha a qualificacao completa do cliente
    </p>
  </div>
</div>
```

### 3. Inputs Premium

Padronizar todos os inputs com o estilo do onboarding:

```tsx
className="h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
```

### 4. Labels com Icones

Adicionar icones sutis nas labels como no onboarding:

```tsx
<Label className="text-sm font-medium flex items-center gap-2">
  <User className="w-4 h-4 text-muted-foreground" />
  Nome Completo <span className="text-destructive">*</span>
</Label>
```

### 5. Cards Elevados

Usar cards com sombras sutis e bordas refinadas:

```tsx
<Card className="shadow-sm border-border/50">
```

### 6. Botoes Premium

Botao principal com gradiente e sombra:

```tsx
<Button className="h-11 px-6 bg-gradient-to-r from-primary to-[hsl(222,80%,45%)] hover:from-primary/90 hover:to-[hsl(222,80%,40%)] shadow-lg shadow-primary/25">
```

---

## Arquivos a Modificar

### 1. `src/pages/ClientForm.tsx`

**Mudancas Principais:**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Container | `max-w-3xl` (alinhado esquerda) | `max-w-3xl mx-auto` (centralizado) |
| Header | Titulo simples | Header com icone gradiente |
| Inputs | Basicos | `h-12 rounded-xl bg-muted/30` |
| Step Indicator | Pills simples | Indicadores circulares premium |
| Botao Salvar | Basico | Gradiente com sombra |

**Estrutura do Novo Layout:**

```text
+-------------------------------------------+
|     [<-]  [Icon Gradiente]  Novo Cliente  |
|           Preencha a qualificacao...      |
+-------------------------------------------+
|                                           |
|     [(1) Dados Pessoais]---[(2) Endereco] |
|                                           |
|  +--------------------------------------+ |
|  | Card Header Premium                  | |
|  | [Select Tipo Pessoa]                 | |
|  +--------------------------------------+ |
|  | [Nome Completo *]        [h-12 xl]   | |
|  | [CPF *]  [Nacionalidade *]           | |
|  | [Estado Civil]  [Profissao *]        | |
|  | ...                                  | |
|  +--------------------------------------+ |
|  |   [<- Anterior]      [Proximo ->]    | |
|  +--------------------------------------+ |
|                                           |
+-------------------------------------------+
```

### 2. `src/pages/CaseForm.tsx`

**Mudancas Principais:**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Container | `max-w-2xl` | `max-w-2xl mx-auto` |
| Header | Titulo simples | Header com icone Briefcase |
| Card | Basico | Com sombra e borda refinada |
| Inputs | Basicos | Premium style |

**Estrutura:**

```text
+-------------------------------------------+
|     [<-]  [Briefcase Icon]  Novo Processo |
|           Cadastre um novo processo       |
+-------------------------------------------+
|                                           |
|  +--------------------------------------+ |
|  | Dados do Processo                    | |
|  +--------------------------------------+ |
|  | [Cliente *]              [Select]    | |
|  | [Numero do Processo]     [Input]     | |
|  | [Vara/Comarca *]         [Input]     | |
|  | [Tipo de Acao *]         [Select]    | |
|  | [Parte Contraria *]      [Input]     | |
|  +--------------------------------------+ |
|  |      [Cancelar]    [Salvar ->]       | |
|  +--------------------------------------+ |
|                                           |
+-------------------------------------------+
```

### 3. `src/pages/PetitionForm.tsx`

**Mudancas Principais:**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Container | Sem centralizacao | `max-w-5xl mx-auto` |
| Header | Titulo basico | Header premium com icone |
| Cards | Basicos | Sombras e bordas refinadas |
| Inputs/Textareas | Basicos | Premium rounded-xl |

**Estrutura Visual:**

O formulario de peticao e mais complexo, com grid de 2 colunas. Manter a estrutura mas aplicar:
- Centralizacao geral
- Cards com estilo premium
- Inputs e Textareas com `rounded-xl`
- Botoes com gradiente

---

## Componente Reutilizavel (Opcional)

Criar componente `PremiumFormHeader.tsx` para padronizar headers:

```tsx
interface PremiumFormHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  backPath: string;
}

const PremiumFormHeader = ({ icon, title, subtitle, backPath }: PremiumFormHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-start gap-4 mb-8">
      <Button variant="ghost" size="icon" onClick={() => navigate(backPath)} className="mt-1">
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
```

---

## Classe Utilitaria para Inputs Premium

Adicionar classe reutilizavel no `index.css`:

```css
.input-premium {
  @apply h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors;
}

.select-premium {
  @apply h-12 rounded-xl border-border/50 bg-muted/30;
}

.textarea-premium {
  @apply rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors;
}

.btn-premium {
  @apply h-11 px-6 bg-gradient-to-r from-primary to-[hsl(222,80%,45%)] hover:from-primary/90 hover:to-[hsl(222,80%,40%)] shadow-lg shadow-primary/25;
}
```

---

## Resumo das Mudancas por Arquivo

### Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/forms/PremiumFormHeader.tsx` | Header reutilizavel com icone gradiente |

### Arquivos Modificados

| Arquivo | Mudancas |
|---------|----------|
| `src/index.css` | Adicionar classes utilitarias premium |
| `src/pages/ClientForm.tsx` | Centralizar, aplicar estilo premium em todos inputs/cards |
| `src/pages/CaseForm.tsx` | Centralizar, aplicar estilo premium |
| `src/pages/PetitionForm.tsx` | Centralizar, aplicar estilo premium em cards e inputs |

---

## Ordem de Implementacao

1. Adicionar classes utilitarias em `index.css`
2. Criar componente `PremiumFormHeader.tsx`
3. Refatorar `CaseForm.tsx` (mais simples, bom para validar o padrao)
4. Refatorar `ClientForm.tsx` (multi-etapas, testar indicadores)
5. Refatorar `PetitionForm.tsx` (mais complexo, aplicar em grid de 2 colunas)
6. Testar responsividade em todos os tamanhos

---

## Resultado Visual Esperado

Apos as mudancas, todos os formularios terao:

1. **Centralizacao** - Sem espaco vazio excessivo nas laterais
2. **Header Premium** - Icone com gradiente + titulo + subtitulo
3. **Inputs Refinados** - Altura confortavel, bordas arredondadas, transicoes suaves
4. **Cards Elegantes** - Sombras sutis, bordas refinadas
5. **Botoes Premium** - Gradiente e sombra no botao principal
6. **Consistencia** - Mesmo padrao visual do onboarding em toda a aplicacao

