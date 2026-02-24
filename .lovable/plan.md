
# Plano: Melhorar a Geracao de Pecas Juridicas (sem n8n)

## Objetivo
Expandir os tipos de documentos que o advogado pode gerar e melhorar a qualidade da geracao usando RAG (busca na base juridica local) direto na Edge Function, sem depender do n8n.

## Mudancas Propostas

### 1. Expandir Tipos de Peticao e Acao

**Arquivo: `src/types/database.ts`**
- Expandir `PetitionType` para incluir todos os tipos de `PieceType` (recurso, agravo, apelacao, embargos, manifestacao, outros)
- Expandir `ActionType` para incluir mais tipos de acao comuns (trabalhista, familiar, consumidor, tributaria, criminal, previdenciaria, etc.)
- Atualizar os labels correspondentes (`PETITION_TYPE_LABELS`, `ACTION_TYPE_LABELS`)

**Banco de dados:**
- Criar migration para adicionar os novos valores nos ENUMs `petition_type` e `action_type`

### 2. Adicionar RAG na Edge Function

**Arquivo: `supabase/functions/generate-petition/index.ts`**

Antes de chamar a IA, a Edge Function vai:
1. Buscar legislacao relevante usando a funcao `search_legal_references` do banco (full-text search nos artigos e sumulas)
2. Buscar jurisprudencia relevante usando `search_stj_acordaos` do banco
3. Injetar os resultados no prompt como contexto fundamentado
4. Retornar os metadados das referencias encontradas junto com o streaming

Isso garante que a IA cite artigos de lei e sumulas **reais** da base de dados.

### 3. Enriquecer o Prompt com Dados do Escritorio

**Arquivo: `supabase/functions/generate-petition/index.ts`**

- Receber dados do escritorio (nome do advogado, OAB, endereco) do frontend
- Preencher automaticamente os placeholders [NOME DO ADVOGADO], [OAB/UF], [LOCAL] no prompt
- Usar modelo `google/gemini-2.5-pro` para pecas mais complexas (recursos, apelacoes)

### 4. Atualizar o Frontend

**Arquivo: `src/pages/PetitionForm.tsx`**
- Exibir todos os tipos de peca no select (nao apenas 3)
- Exibir todos os tipos de acao
- Adicionar templates padrao (facts, legalBasis, requests) para os novos tipos de acao

**Arquivo: `src/lib/petition-templates.ts`**
- Adicionar templates locais para os novos tipos de peca e acao

**Arquivo: `src/hooks/usePetitionGeneration.ts`**
- Enviar dados do escritorio (law_firm_settings) na requisicao
- Tratar metadados de legislacao/jurisprudencia retornados pela Edge Function com RAG

### 5. Retornar Metadata de RAG ao Frontend

**Arquivo: `supabase/functions/generate-petition/index.ts`**

Antes de iniciar o streaming da IA, enviar um evento SSE com os metadados das referencias encontradas:
```
data: {"metadata": {"legislationFound": [...], "jurisprudenceFound": [...]}}
```
Depois iniciar o streaming normal do conteudo. Assim o componente `PetitionMetadataCard` exibe as referencias reais mesmo sem o n8n.

---

## Secao Tecnica

### Migration SQL (novos ENUMs)

Adicionar valores aos ENUMs existentes:
- `petition_type`: adicionar `recurso`, `agravo`, `apelacao`, `embargos`, `manifestacao`, `outros`
- `action_type`: adicionar `trabalhista`, `familia`, `consumidor`, `tributaria`, `criminal`, `previdenciaria`, `execucao`, `inventario`, `usucapiao`, `despejo`, `outros`

### Logica de RAG na Edge Function

```text
1. Receber request com dados do caso
2. Extrair palavras-chave do tipo de acao + fatos + fundamentos
3. Chamar supabase.rpc('search_legal_references', { search_query, result_limit: 10 })
4. Chamar supabase.rpc('search_stj_acordaos', { search_query, result_limit: 5 })
5. Montar bloco de contexto com artigos e jurisprudencias encontrados
6. Enviar SSE event com metadata das referencias
7. Chamar Lovable AI com o prompt enriquecido
8. Fazer streaming da resposta para o cliente
```

### Arquivos Modificados

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| `src/types/database.ts` | Expandir tipos e labels |
| `src/pages/PetitionForm.tsx` | Novos selects, enviar dados do escritorio |
| `src/lib/petition-templates.ts` | Templates para novos tipos |
| `src/hooks/usePetitionGeneration.ts` | Enviar firm settings, tratar metadata |
| `supabase/functions/generate-petition/index.ts` | RAG + dados do escritorio + metadata SSE |
| Migration SQL | Expandir ENUMs |

### Modelo de IA

- Pecas simples (peticao simples, manifestacao): `google/gemini-3-flash-preview` (rapido e economico)
- Pecas complexas (recursos, apelacoes, embargos): `google/gemini-2.5-pro` (mais preciso em raciocinio juridico)

O tipo de peca determina automaticamente qual modelo usar.
