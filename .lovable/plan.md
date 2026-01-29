
# Plano: Organização de Modelos por Pastas

## Resumo

Esta funcionalidade permitirá organizar os modelos de petições em pastas personalizadas (ex: Procurações, Petições Iniciais, Contestações). Cada escritório poderá criar suas próprias pastas para melhor organização dos seus modelos.

---

## O que será implementado

### 1. Gerenciamento de Pastas
- Criar, renomear e excluir pastas
- Cada pasta terá um nome e uma cor opcional para identificação visual
- Apenas 1 nível de pastas (sem subpastas)

### 2. Associação de Modelos
- Todo modelo será vinculado a uma pasta (campo obrigatório)
- Possibilidade de mover modelos entre pastas
- Visualização filtrada por pasta na listagem

### 3. Salvar Petição como Modelo
- Nova opção na tela de petição para salvar como modelo
- Ao salvar, o usuário escolhe a pasta de destino
- O conteúdo da petição é copiado para um novo modelo

### 4. Interface Atualizada
- Painel lateral com lista de pastas na página de Modelos
- Contador de modelos por pasta
- Drag and drop para mover modelos (opcional MVP)

---

## Detalhes Técnicos

### Banco de Dados

**Nova tabela: `template_folders`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | Vínculo com usuário (multi-tenant) |
| name | text | Nome da pasta |
| color | text | Cor hexadecimal (opcional) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

**Alteração na tabela `petition_templates`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| folder_id | uuid | FK para template_folders (nullable inicialmente) |

**Políticas RLS**
- Usuário pode criar/ler/atualizar/deletar apenas suas próprias pastas
- Consistente com as políticas existentes de `petition_templates`

---

### Novos Componentes

```text
src/
  components/
    templates/
      FolderList.tsx         # Lista de pastas no sidebar
      FolderDialog.tsx       # Modal para criar/editar pasta
      MoveTemplateDialog.tsx # Modal para mover modelo entre pastas
  pages/
    Templates.tsx            # Atualizar para incluir navegação por pastas
    TemplateForm.tsx         # Adicionar seleção de pasta
    PetitionForm.tsx         # Adicionar botão "Salvar como Modelo"
```

---

### Fluxo de Usuário

**Criar Pasta:**
1. Usuário acessa página de Modelos
2. Clica em "+ Nova Pasta" no painel lateral
3. Informa nome e cor (opcional)
4. Pasta aparece na lista

**Organizar Modelo:**
1. Ao criar/editar um modelo, seleciona a pasta
2. Na listagem, pode mover modelo clicando em "Mover para..."
3. Modelos sem pasta aparecem em "Sem categoria"

**Salvar Petição como Modelo:**
1. Na página de edição de petição, clica em "Salvar como Modelo"
2. Dialog pergunta: título, tipo de peça e pasta destino
3. Modelo é criado com o conteúdo da petição

---

## Etapas de Implementação

### Etapa 1: Banco de Dados
- Criar tabela `template_folders` com RLS
- Adicionar coluna `folder_id` em `petition_templates`
- Criar FK e índices

### Etapa 2: Tipos e Interfaces
- Atualizar `src/types/database.ts` com interface `TemplateFolder`
- Adicionar `folder_id` opcional em `PetitionTemplate`

### Etapa 3: Componentes de Pasta
- Criar `FolderList.tsx` (sidebar com pastas)
- Criar `FolderDialog.tsx` (criar/editar pasta)
- Criar `MoveTemplateDialog.tsx` (mover modelo)

### Etapa 4: Página de Modelos
- Redesenhar layout com sidebar de pastas
- Filtrar modelos por pasta selecionada
- Adicionar ações de mover/excluir pasta

### Etapa 5: Formulário de Modelo
- Adicionar campo de seleção de pasta
- Validar que pasta foi selecionada

### Etapa 6: Salvar Petição como Modelo
- Adicionar botão no `PetitionForm.tsx`
- Criar dialog para informar dados do novo modelo
- Implementar lógica de criação

---

## Considerações

**Migração de dados existentes:**
- Modelos existentes terão `folder_id = null`
- Serão exibidos em seção "Sem categoria"
- Usuário pode organizá-los posteriormente

**Exclusão de pasta:**
- Ao excluir pasta, modelos serão movidos para "Sem categoria" (folder_id = null)
- Confirmação antes de excluir

**Performance:**
- Índice em `folder_id` para queries eficientes
- Contagem de modelos calculada no frontend inicialmente

