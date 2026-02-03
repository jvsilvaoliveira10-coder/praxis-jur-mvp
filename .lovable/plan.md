
# Plano: Header Profissional para Área Interna

## O Problema

A área superior do aplicativo (circulada em vermelho na imagem) está vazia e sem propósito. Atualmente o layout é:

```text
+--------------------+--------------------------------------------------+
| PRÁXIS AI          |                                           🔔     |
| Hub Jurídico       |    [ÁREA VAZIA - MUITO GRANDE E AMADORA]         |
+--------------------+--------------------------------------------------+
| Sidebar            |  Conteúdo da página                              |
```

Isso dá uma impressão **muito amadora** porque:
1. Há uma área enorme sem conteúdo
2. A separação visual entre sidebar escuro e conteúdo branco é brusca
3. Não há contexto ou informações úteis para o usuário
4. Parece que algo está faltando

---

## Solução Proposta

Criar um **Header Profissional** que aproveita esse espaço com informações úteis e contextuais:

```text
+--------------------+--------------------------------------------------+
| PRÁXIS AI          | Dashboard               [Barra de Busca]    🔔 👤|
| Hub Jurídico       |                                                  |
+--------------------+--------------------------------------------------+
```

### Opções de Design

**Opção A - Header Contextual (Recomendado)**
- Nome da página atual (Dashboard, Clientes, etc.)
- Breadcrumb quando em subpáginas
- Busca global
- Notificações
- Avatar do usuário com dropdown

**Opção B - Header Compacto**
- Só busca + notificações + avatar
- Sem título (confia no título dentro da página)

**Opção C - Remover Header**
- Eliminar completamente a barra
- Mover notificações para a sidebar ou outro lugar

---

## Minha Recomendação: Header Contextual (Opção A)

### Layout Visual Proposto

```text
+------------------------------------------------------------------+
|  📍 Dashboard                      🔍 [Buscar clientes, processos...] 🔔  JL  |
+------------------------------------------------------------------+
```

Ou com breadcrumb:

```text
+------------------------------------------------------------------+
|  Clientes > Dr. João Silva         🔍 [Buscar...]           🔔  JL  |
+------------------------------------------------------------------+
```

### Elementos do Header

| Elemento | Descrição | Funcionalidade |
|----------|-----------|----------------|
| **Título da Página** | Nome da página atual | Ajuda na orientação |
| **Breadcrumb** | Caminho de navegação | Quando em subpáginas |
| **Busca Global** | Campo de busca | Buscar clientes, processos, petições |
| **Notificações** | Sininho (já existe) | Alertas e notificações |
| **Avatar do Usuário** | Iniciais ou foto | Dropdown com perfil, config e sair |

---

## Detalhes de Implementação

### 1. Novo Componente: `TopHeader.tsx`

Criar um componente reutilizável com:
- Título dinâmico baseado na rota
- Breadcrumb opcional
- Busca global (pode ser implementada depois)
- Integração com NotificationBell
- Avatar do usuário com menu dropdown

### 2. Modificar: `MainLayout.tsx`

Substituir a div simples pelo novo `TopHeader`:

```tsx
// ANTES (amador)
<div className="flex justify-end p-4 border-b">
  <NotificationBell />
</div>

// DEPOIS (profissional)
<TopHeader />
```

### 3. Mapeamento de Títulos por Rota

| Rota | Título |
|------|--------|
| `/dashboard` | Dashboard |
| `/clients` | Clientes |
| `/clients/:id` | Detalhes do Cliente |
| `/cases` | Processos |
| `/pipeline` | Gestão de Processos |
| `/petitions` | Petições |
| `/templates` | Modelos |
| `/jurisprudence` | Jurisprudência |
| `/tracking` | Acompanhamento |
| `/agenda` | Agenda |
| `/relatorios` | Relatórios |
| `/financeiro` | Painel Financeiro |
| `/financeiro/receber` | Contas a Receber |
| `/financeiro/pagar` | Contas a Pagar |
| `/financeiro/extrato` | Extrato |
| `/financeiro/contratos` | Contratos |
| `/financeiro/relatorios` | Relatórios Financeiros |
| `/configuracoes` | Configurações |

---

## Design Visual

### Header Desktop

```text
+------------------------------------------------------------------+
|  [Icone] Dashboard                                                |
|                                                                   |
|  [🔍 Buscar clientes, processos, petições...]     🔔    [JL ▾]   |
+------------------------------------------------------------------+
```

### Elementos:
- **Altura**: 64px (h-16) - compacto mas confortável
- **Background**: Mesmo do conteúdo (bg-background)
- **Borda inferior**: Sutil (border-b border-border)
- **Avatar**: Iniciais do nome em círculo colorido
- **Dropdown do Avatar**: Meu Perfil, Configurações, Sair

---

## Arquivos a Criar/Modificar

### Novo Arquivo
**`src/components/layout/TopHeader.tsx`**

Componente com:
- Hook useLocation para detectar rota
- Mapeamento de rotas para títulos
- Integração com NotificationBell
- Avatar dropdown com menu
- Busca global (placeholder inicial)

### Arquivo a Modificar
**`src/components/layout/MainLayout.tsx`**

Substituir linhas 101-103 pelo componente TopHeader

---

## Avatar Dropdown Menu

Opções do menu do usuário:

| Opção | Ação | Ícone |
|-------|------|-------|
| Meu Perfil | Vai para /configuracoes | User |
| Configurações | Vai para /configuracoes | Settings |
| Sair | Faz logout | LogOut |

---

## Benefícios da Mudança

1. **Visual Profissional** - Aproveitamento inteligente do espaço
2. **Orientação** - Usuário sempre sabe onde está
3. **Acesso Rápido** - Perfil e configurações a 1 clique
4. **Consistência** - Header padrão em todas as páginas
5. **Escalável** - Fácil adicionar busca global no futuro

---

## Resultado Esperado

Antes:
```text
[Sidebar escuro] | [Área vazia gigante com só um sininho no canto]
```

Depois:
```text
[Sidebar escuro] | [Header com título + busca + notif + avatar]
                 | [Conteúdo da página]
```

A área deixa de parecer "esquecida" e passa a ter propósito claro, transmitindo profissionalismo.
