
# Plano: Versao Mobile e Responsividade Completa

## Objetivo
Transformar todo o sistema em uma experiencia mobile-first extremamente responsiva, garantindo que todas as paginas funcionem perfeitamente em dispositivos moveis, tablets e desktops.

---

## Analise da Situacao Atual

### O que ja esta responsivo:
- Landing page (HeroSection, FeaturesSection, etc.) - usa classes sm:, md:, lg:
- Header da landing com menu hamburger para mobile
- Grids basicos com grid-cols-1 md:grid-cols-2, etc.

### O que precisa de melhorias:
1. **MainLayout + Sidebar** - sidebar fixa de 256px nao funciona em mobile
2. **Tabelas** (Clients, Cases, Agenda, Templates) - nao tem scroll horizontal nem visualizacao alternativa
3. **Formularios** (PetitionForm, ClientForm, CaseForm) - layouts de 2 colunas quebram
4. **Templates** - sidebar de pastas fixa de 256px nao funciona em mobile
5. **Agenda** - calendario + lista lado a lado nao cabe
6. **Headers de pagina** - titulo + botao na mesma linha quebra em telas pequenas

---

## Componentes a Modificar

### 1. MainLayout e Sidebar Mobile

**Problema**: Sidebar fixa de 256px com `ml-64` no conteudo principal.

**Solucao**:
- Criar sidebar que colapsa em drawer/sheet para mobile
- Adicionar botao hamburger no header mobile
- Usar o hook `useIsMobile()` ja existente
- Em desktop: sidebar fixa normal
- Em mobile: sidebar em Sheet (overlay) que abre/fecha

```text
Desktop:                    Mobile:
+--------+------------+     +------------------+
| Sidebar|  Content   |     | [=] Header    [!]|
|        |            |     +------------------+
|        |            |     |                  |
|        |            |     |    Content       |
+--------+------------+     |                  |
                            +------------------+
                            (Sidebar = Sheet overlay)
```

### 2. Tabelas Responsivas

**Problema**: Tables com 5-6 colunas nao cabem em mobile (320-414px).

**Solucao A - Scroll Horizontal**:
- Envolver tabelas em container com `overflow-x-auto`
- Adicionar indicador visual de scroll

**Solucao B - Cards em Mobile**:
- Em desktop: tabela tradicional
- Em mobile: lista de cards com informacoes empilhadas

**Paginas afetadas**:
- Clients.tsx
- Cases.tsx
- Agenda.tsx (lista de prazos)
- Templates.tsx
- Petitions.tsx

### 3. Headers de Pagina Responsivos

**Problema**: `flex items-center justify-between` quebra quando titulo e botao sao grandes.

**Solucao**:
```text
Desktop:                        Mobile:
+---------------------------+   +------------------+
| Titulo         [+ Novo]   |   | Titulo           |
| Subtitulo                 |   | Subtitulo        |
+---------------------------+   | [+ Novo Cliente] |
                                +------------------+
```

Usar `flex-col sm:flex-row` e `gap-4`.

### 4. Formularios Responsivos

**Problema**: Grids de 2 colunas (`grid-cols-2`) nao cabem em mobile.

**Solucao**:
- Usar `grid-cols-1 sm:grid-cols-2` em todos os formularios
- Campos de endereco: empilhar verticalmente em mobile

**Arquivos**:
- ClientForm.tsx
- CaseForm.tsx
- DeadlineForm.tsx
- TemplateForm.tsx
- PetitionForm.tsx

### 5. Templates - Sidebar de Pastas Mobile

**Problema**: `FolderList` tem `w-64` fixo que nao funciona em mobile.

**Solucao**:
- Em desktop: sidebar de pastas a esquerda
- Em mobile: dropdown/select para escolher pasta OU Sheet lateral

```text
Desktop:                    Mobile:
+--------+------------+     +------------------+
| Pastas | Templates  |     | [Pastas v] + Novo|
|        |            |     +------------------+
|        |            |     | Cards/Lista      |
+--------+------------+     +------------------+
```

### 6. Agenda - Layout Responsivo

**Problema**: `grid md:grid-cols-[350px_1fr]` na view de calendario.

**Solucao**:
- Em mobile: calendario empilhado acima da lista
- Reduzir tamanho do calendario
- Cards de prazo menores

```text
Desktop:                    Mobile:
+----------+-----------+    +------------------+
| Calendar | Deadlines |    | [Calendario]     |
|          |           |    +------------------+
|          |           |    | [Prazos do dia]  |
+----------+-----------+    +------------------+
```

### 7. Dashboard - Cards e Graficos

**Problema**: Graficos precisam de espaco minimo para serem legiveis.

**Solucao**:
- Cards de estatisticas: ja esta ok com `grid-cols-1 md:grid-cols-3`
- Graficos: ajustar altura minima, permitir scroll se necessario
- Botoes de acoes rapidas: empilhar em mobile

### 8. Tracking - Grid de Cards

**Solucao**:
- Ja usa `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - verificar se funciona bem
- Ajustar padding interno dos cards

---

## Detalhes Tecnicos

### Hook useIsMobile
Ja existe em `src/hooks/use-mobile.tsx` com breakpoint de 768px.

### CSS Utilities Adicionais
Adicionar no `src/index.css`:
```css
/* Container de tabela responsiva */
.table-responsive {
  @apply overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0;
}

/* Safe area para dispositivos com notch */
.safe-area-padding {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Componentes a Criar

1. **MobileSidebar.tsx** - Wrapper do Sidebar existente em um Sheet
2. **MobileHeader.tsx** - Header com hamburger para mobile
3. **ResponsiveTable.tsx** - Componente que alterna entre Table e Cards

---

## Arquivos a Modificar

### Layout Principal
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Sidebar.tsx`

### Paginas
- `src/pages/Dashboard.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Cases.tsx`
- `src/pages/Petitions.tsx`
- `src/pages/Templates.tsx`
- `src/pages/Agenda.tsx`
- `src/pages/Tracking.tsx`
- `src/pages/ClientForm.tsx`
- `src/pages/CaseForm.tsx`
- `src/pages/PetitionForm.tsx`
- `src/pages/DeadlineForm.tsx`
- `src/pages/TemplateForm.tsx`

### Componentes
- `src/components/templates/FolderList.tsx`
- `src/components/tracking/ProcessMovementsSheet.tsx`
- `src/components/tracking/AddProcessDialog.tsx`

### Estilos
- `src/index.css`

---

## Tarefas de Implementacao

### Fase 1: Layout Principal (Prioridade Alta)
1. Modificar `MainLayout.tsx` para usar Sheet em mobile
2. Atualizar `Sidebar.tsx` para funcionar como conteudo do Sheet
3. Adicionar header mobile com hamburger e notificacoes
4. Ajustar padding do conteudo principal para mobile

### Fase 2: Tabelas Responsivas
5. Criar componente `ResponsiveTable.tsx` ou aplicar scroll horizontal
6. Atualizar `Clients.tsx` com tabela responsiva
7. Atualizar `Cases.tsx` com tabela responsiva
8. Atualizar `Agenda.tsx` (view lista) com tabela responsiva
9. Atualizar `Templates.tsx` com tabela responsiva

### Fase 3: Formularios
10. Atualizar `ClientForm.tsx` com grid responsivo
11. Atualizar `CaseForm.tsx` com grid responsivo
12. Atualizar `PetitionForm.tsx` com grid responsivo
13. Atualizar `DeadlineForm.tsx` com grid responsivo
14. Atualizar `TemplateForm.tsx` com grid responsivo

### Fase 4: Componentes Especificos
15. Atualizar `FolderList.tsx` para mobile (sheet ou select)
16. Atualizar `Agenda.tsx` view calendario para empilhar
17. Revisar `Tracking.tsx` e ajustar cards

### Fase 5: Refinamentos
18. Testar todos os dialogos e sheets em mobile
19. Ajustar touch targets (minimo 44x44px)
20. Verificar espacamentos e padding em todas as paginas
21. Adicionar safe-area-inset para dispositivos com notch

---

## Breakpoints de Referencia

| Dispositivo | Largura | Breakpoint Tailwind |
|-------------|---------|---------------------|
| Mobile S    | 320px   | default             |
| Mobile M    | 375px   | default             |
| Mobile L    | 425px   | default             |
| Tablet      | 768px   | md:                 |
| Desktop     | 1024px  | lg:                 |
| Desktop L   | 1440px  | xl:                 |

---

## Resultado Esperado

- Sidebar em drawer overlay no mobile com hamburger menu
- Tabelas com scroll horizontal ou convertidas em cards
- Formularios com campos empilhados em mobile
- Headers de pagina com titulo e botao em linhas separadas no mobile
- Agenda com calendario e lista empilhados
- Templates com selector de pasta em mobile ao inves de sidebar
- Touch targets adequados (44x44px minimo)
- Espacamentos generosos para toque
- Experiencia fluida em dispositivos de 320px ate 1440px+
