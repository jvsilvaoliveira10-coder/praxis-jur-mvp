

# Plano: Simplificação da Página de Jurisprudência (Modo Demonstração)

## Resumo

Vamos transformar a página de Jurisprudência em uma **landing page de feature** que comunica claramente que essa funcionalidade está em desenvolvimento, mostrando uma prévia interativa do que está por vir.

---

## Mudanças Planejadas

### 1. Remover Abas e Simplificar Interface

**Antes (atual):**
- 3 abas: STJ (Real), TJSP (Demo), Admin
- Funcionalidades híbridas complexas
- Confusão sobre o que funciona ou não

**Depois:**
- Página única de demonstração
- Banner claro "Em Breve"
- Prévia interativa com dados mock
- Sem funcionalidades reais que possam confundir

### 2. Novo Layout da Página

```text
+--------------------------------------------------+
|  Header: Pesquisa de Jurisprudência               |
+--------------------------------------------------+
|                                                    |
|  +--------------------------------------------+   |
|  |     🚀 BANNER "EM BREVE"                   |   |
|  |                                             |   |
|  |  Esta funcionalidade está em desenvolvimento|   |
|  |  e será lançada em breve!                  |   |
|  |                                             |   |
|  |  [Lista de recursos que virão]             |   |
|  |  • Busca no STJ com dados reais            |   |
|  |  • Busca no TJSP                           |   |
|  |  • Integração com o gerador de petições    |   |
|  |  • Cache inteligente                       |   |
|  |                                             |   |
|  +--------------------------------------------+   |
|                                                    |
|  +--------------------------------------------+   |
|  |     PRÉVIA INTERATIVA (Demo)               |   |
|  |                                             |   |
|  |  [Campo de busca - desabilitado ou mock]   |   |
|  |                                             |   |
|  |  [Cards de exemplo de jurisprudência]      |   |
|  |  - Design mostrando como ficará            |   |
|  |  - Dados fictícios para ilustrar           |   |
|  |                                             |   |
|  +--------------------------------------------+   |
|                                                    |
+--------------------------------------------------+
```

### 3. Componentes de UI

**Banner Principal:**
- Gradiente atrativo com ícone de foguete
- Título: "Pesquisa de Jurisprudência"
- Subtítulo: "Em desenvolvimento - Prévia da funcionalidade"
- Lista de features que virão

**Prévia Interativa:**
- Campo de busca (visual, mas não funcional)
- 2-3 cards de exemplo com jurisprudência fictícia
- Badge "DEMONSTRAÇÃO" nos cards
- Design final mostrando como a funcionalidade será

**Opção de Notificação (opcional):**
- "Quer ser notificado quando lançarmos?"
- Botão simples que registra interesse

---

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/Jurisprudence.tsx` | Reescrever | Remover abas, criar página de demonstração simplificada |
| `src/components/jurisprudence/*` | Manter | Componentes existentes podem ser reutilizados para a prévia |

---

## Dados Mock para Demonstração

Incluir 2-3 cards de exemplo:

```typescript
const mockJurisprudencia = [
  {
    id: 'demo-1',
    processo: 'REsp 1.234.567/SP',
    classe: 'Recurso Especial',
    relator: 'Min. Exemplo Silva',
    orgao: 'Terceira Turma',
    ementa: 'CIVIL. RESPONSABILIDADE CIVIL. DANOS MORAIS. Demonstração de como será exibida a ementa completa do acórdão...',
    data: '2024-01-15',
  },
  // mais 1-2 exemplos
];
```

---

## Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Clareza** | Usuário sabe exatamente que é uma prévia |
| **Expectativa** | Gera antecipação pelo lançamento |
| **Sem bugs** | Remove funcionalidades instáveis |
| **UX limpa** | Interface simples e direta |
| **Profissional** | Mostra que a feature está sendo desenvolvida |

---

## Seção Técnica

### Estrutura do Novo Componente

```typescript
const Jurisprudence = () => {
  // Dados mock fixos para demonstração
  const mockResults = [...];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header />

      {/* Banner "Em Breve" */}
      <ComingSoonBanner features={[...]} />

      {/* Card de Prévia */}
      <Card>
        <CardHeader>
          <CardTitle>Prévia da Funcionalidade</CardTitle>
          <CardDescription>
            Veja como será a busca de jurisprudência
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Campo de busca desabilitado */}
          <DemoSearchField />
          
          {/* Cards de exemplo */}
          <DemoResults results={mockResults} />
        </CardContent>
      </Card>
    </div>
  );
};
```

### Componentes a Reutilizar

- **JurisprudenceCard**: Adaptar para exibir dados mock com badge "Demo"
- **Layout geral**: Manter consistência visual

### Componentes a Remover/Ignorar (por enquanto)

- STJSearch, STJResults (busca real)
- STJSyncPanel (admin)
- Integração com API Datajud

---

## Exemplo de Banner "Em Breve"

```tsx
<Alert className="border-primary bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
  <Rocket className="h-5 w-5 text-primary" />
  <AlertTitle className="text-primary font-semibold flex items-center gap-2">
    <Sparkles className="h-4 w-4" />
    Em Desenvolvimento
  </AlertTitle>
  <AlertDescription className="mt-3 space-y-3">
    <p>
      Estamos desenvolvendo uma ferramenta completa de pesquisa de jurisprudência 
      para fundamentar suas petições automaticamente.
    </p>
    
    <div className="grid gap-2 text-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Busca em tempo real no STJ e tribunais estaduais
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Integração direta com o gerador de petições
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Cache inteligente para buscas mais rápidas
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Seleção e citação automática de acórdãos
      </div>
    </div>
  </AlertDescription>
</Alert>
```

---

## Ordem de Execução

1. Reescrever `src/pages/Jurisprudence.tsx` com layout simplificado
2. Criar dados mock realistas para demonstração
3. Adicionar banner "Em Breve" com lista de features
4. Incluir prévia visual com cards de exemplo
5. Testar página

