
# Plano: Base de Dados de Legislacao para IA Juridica

## Contexto e Objetivo

Criar uma base de conhecimento juridico local no Praxis AI com leis, sumulas e artigos dos principais codigos brasileiros, que sera usada como referencia pela IA durante a geracao de peticoes. Isso eliminara o problema de "alucinacoes" juridicas e garantira citacoes precisas e atualizadas.

---

## Fontes de Dados Publicas Identificadas

### Documentos Oficiais Disponiveis

| Fonte | Tipo de Conteudo | Formato | Disponibilidade |
|-------|-----------------|---------|-----------------|
| Planalto.gov.br | Leis Federais, CPC, CC, CDC, CF | HTML/PDF | Publico |
| STF | Sumulas (1-736), Sumulas Vinculantes (1-58) | PDF | Publico |
| STJ | Sumulas (1-660+) | HTML/PDF | Publico |
| TJSP e-SAJ | Jurisprudencia estadual | HTML | Parcial (reCAPTCHA) |

### Links Oficiais para Coleta

1. **Sumulas STF**: https://www.stf.jus.br/arquivo/cms/jurisprudenciaSumula/anexo/Enunciados_Sumulas_STF_1_a_736_Completo.pdf
2. **Sumulas Vinculantes STF**: https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26
3. **Legislacao Federal**: http://legislacao.planalto.gov.br

---

## Arquitetura da Solucao

```text
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  Edge Function   |     |  Tabelas no       |     |  Edge Function   |
|  populate-laws   +---->+  Banco de Dados   +---->+  generate-       |
|  (importacao)    |     |  (legal_articles, |     |  petition (IA)   |
|                  |     |   sumulas, etc)   |     |                  |
+------------------+     +-------------------+     +------------------+
        ^                         |
        |                         v
+------------------+     +-------------------+
|  Firecrawl API   |     |  Busca Semantica  |
|  (scraping)      |     |  por Tema/Palavra |
+------------------+     +-------------------+
```

---

## Estrutura do Banco de Dados

### Tabela: `legal_codes`
Armazena os codigos e leis principais.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| code_type | ENUM | CF, CC, CPC, CDC, CLT, CP, CPP, LEI, DECRETO |
| name | TEXT | Nome completo (ex: "Codigo de Processo Civil") |
| abbreviation | TEXT | Sigla (ex: "CPC") |
| law_number | TEXT | Numero da lei (ex: "13.105/2015") |
| publication_date | DATE | Data de publicacao |
| last_updated | TIMESTAMPTZ | Ultima atualizacao no sistema |
| source_url | TEXT | URL da fonte oficial |
| active | BOOLEAN | Se esta vigente |

### Tabela: `legal_articles`
Armazena artigos individuais com texto completo.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| code_id | UUID | FK para legal_codes |
| article_number | TEXT | Numero do artigo (ex: "85", "927, §1º") |
| title | TEXT | Titulo/ementa do artigo (se houver) |
| content | TEXT | Texto completo do artigo |
| chapter | TEXT | Capitulo/secao onde esta inserido |
| keywords | TEXT[] | Palavras-chave para busca |
| themes | TEXT[] | Temas juridicos relacionados |
| search_vector | TSVECTOR | Para busca full-text |
| created_at | TIMESTAMPTZ | Data de criacao |
| updated_at | TIMESTAMPTZ | Data de atualizacao |

### Tabela: `sumulas`
Armazena sumulas do STF e STJ.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| court | ENUM | STF, STJ, TST, TSE |
| number | INTEGER | Numero da sumula |
| is_binding | BOOLEAN | Se e sumula vinculante |
| content | TEXT | Texto completo da sumula |
| themes | TEXT[] | Temas juridicos |
| keywords | TEXT[] | Palavras-chave |
| precedents | TEXT[] | Precedentes citados |
| publication_date | DATE | Data de publicacao |
| status | ENUM | VIGENTE, CANCELADA, REVISADA |
| notes | TEXT | Observacoes |
| search_vector | TSVECTOR | Para busca full-text |
| source_url | TEXT | URL da fonte |
| created_at | TIMESTAMPTZ | Data de criacao |

### Tabela: `legal_themes`
Catalogo de temas juridicos para categorizacao.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | UUID | Identificador unico |
| name | TEXT | Nome do tema (ex: "Danos Morais") |
| parent_id | UUID | FK para tema pai (hierarquia) |
| description | TEXT | Descricao do tema |
| related_codes | TEXT[] | Codigos relacionados (CPC, CC, etc) |

---

## Dados a Serem Importados (Fase 1)

### Codigos Prioritarios

1. **Constituicao Federal 1988** - Artigos mais citados (5º, 37, 170, 225, etc)
2. **Codigo de Processo Civil (Lei 13.105/2015)** - Artigos completos
3. **Codigo Civil (Lei 10.406/2002)** - Artigos completos
4. **Codigo de Defesa do Consumidor (Lei 8.078/1990)** - Artigos completos
5. **CLT** - Artigos mais relevantes

### Sumulas Prioritarias

1. **Sumulas Vinculantes STF** (1-58) - Todas
2. **Sumulas STF** - Mais citadas em direito civil/consumidor
3. **Sumulas STJ** - Mais citadas em direito civil/consumidor

### Quantidade Estimada

| Tipo | Quantidade Aproximada |
|------|----------------------|
| Artigos CF | ~250 artigos |
| Artigos CPC | ~1.072 artigos |
| Artigos CC | ~2.046 artigos |
| Artigos CDC | ~119 artigos |
| Sumulas Vinculantes | 58 |
| Sumulas STF | ~300 relevantes |
| Sumulas STJ | ~400 relevantes |
| **TOTAL** | ~4.200+ registros |

---

## Fluxo de Importacao

### Edge Function: `populate-legal-database`

Responsavel por fazer scraping/parsing dos documentos oficiais e popular as tabelas.

```text
1. Recebe parametros (codigo, tipo_dados)
2. Faz requisicao para fonte oficial via Firecrawl
3. Parsea o conteudo HTML/PDF
4. Normaliza e estrutura os dados
5. Insere no banco com busca full-text
6. Retorna estatisticas de importacao
```

### Estrategia de Scraping

1. **Firecrawl API** (ja configurado no projeto) para extrair conteudo de paginas HTML
2. **PDFs** - Parse manual ou API de OCR para sumulas em PDF
3. **Rate Limiting** - Respeitar limites dos sites oficiais
4. **Cache** - Armazenar localmente para evitar requisicoes repetidas

---

## Integracao com Geracao de Peticoes

### Modificacoes na Edge Function `generate-petition`

```text
ANTES (atual):
Usuario -> generate-petition -> IA gera "baseada em conhecimento interno"

DEPOIS (novo):
Usuario -> generate-petition -> Busca artigos/sumulas relevantes -> 
           IA gera com contexto REAL de legislacao
```

### Nova Funcao: `search-legal-references`

1. Recebe: tipo de acao, palavras-chave, tema
2. Busca: artigos e sumulas relevantes usando full-text search
3. Retorna: lista ordenada por relevancia com texto completo

### Prompt Enriquecido para IA

O prompt da IA sera modificado para incluir:

```text
LEGISLACAO APLICAVEL (dados reais do banco):
- Art. 186 do Codigo Civil: "Aquele que, por acao ou omissao..."
- Art. 927 do Codigo Civil: "Aquele que, por ato ilicito..."
- Sumula 37 STJ: "Sao cumulaveis as indenizacoes..."

INSTRUCAO: Use EXATAMENTE estas referencias legislativas ao fundamentar.
NAO invente artigos ou sumulas que nao estejam listados acima.
```

---

## Interface do Usuario

### Nova Secao: Biblioteca Juridica

Pagina `/legal-library` para:
- Visualizar legislacao disponivel
- Buscar artigos por tema/palavra-chave
- Ver sumulas organizadas por tribunal
- Marcar favoritos para uso frequente

### Integracao no Formulario de Peticao

1. Campo "Temas Juridicos" - autocomplete com temas cadastrados
2. Secao "Legislacao Sugerida" - mostra artigos/sumulas relevantes
3. Botao "Adicionar Referencia" - inclui no contexto da IA
4. Preview das referencias que serao usadas

---

## Arquivos a Criar

### Banco de Dados (Migrations)

1. Criar ENUM `code_type` (CF, CC, CPC, CDC, CLT, etc)
2. Criar ENUM `court_type` (STF, STJ, TST, TSE)
3. Criar ENUM `sumula_status` (VIGENTE, CANCELADA, REVISADA)
4. Criar tabela `legal_codes`
5. Criar tabela `legal_articles` com indice GIN para busca
6. Criar tabela `sumulas` com indice GIN para busca
7. Criar tabela `legal_themes`
8. Criar funcao de busca full-text `search_legal_references()`
9. RLS policies para acesso publico de leitura

### Edge Functions

1. `supabase/functions/populate-legal-database/index.ts` - Importacao de dados
2. `supabase/functions/search-legal-references/index.ts` - Busca de referencias

### Frontend

1. `src/pages/LegalLibrary.tsx` - Biblioteca juridica
2. `src/components/petition/LegalReferencesSelector.tsx` - Seletor de referencias
3. `src/lib/api/legal-references.ts` - API client

### Modificacoes

1. `supabase/functions/generate-petition/index.ts` - Integrar busca de referencias
2. `src/pages/PetitionForm.tsx` - Adicionar selecao de referencias
3. `src/App.tsx` - Adicionar rota /legal-library

---

## Fases de Implementacao

### Fase 1: Infraestrutura (Prioridade Alta)

1. Criar tabelas no banco de dados
2. Criar indices de busca full-text
3. Criar edge function de busca

### Fase 2: Dados Iniciais (Prioridade Alta)

4. Importar sumulas vinculantes STF (58)
5. Importar artigos mais citados do CC/CPC/CDC
6. Popular temas juridicos basicos

### Fase 3: Integracao IA (Prioridade Alta)

7. Modificar generate-petition para buscar referencias
8. Atualizar prompt com contexto de legislacao real
9. Testar geracao com referencias

### Fase 4: Interface (Prioridade Media)

10. Criar pagina de biblioteca juridica
11. Adicionar seletor de referencias no formulario
12. Implementar busca por tema/palavra-chave

### Fase 5: Expansao (Prioridade Baixa)

13. Importar mais codigos (CLT, CP, CPP)
14. Adicionar mais sumulas STF/STJ
15. Implementar atualizacao automatica periodica

---

## Consideracoes Tecnicas

### Performance

- Indices GIN para busca full-text eficiente
- Limite de referencias por busca (max 10-15)
- Cache de buscas frequentes

### Manutencao

- Legislacao muda pouco (atualizacoes periodicas)
- Sistema de versionamento para alteracoes
- Flag de "vigencia" para artigos revogados

### Seguranca

- Dados de legislacao sao publicos (sem RLS restritivo)
- Apenas super_admin pode modificar a base
- Usuarios podem apenas ler/buscar

---

## Resultado Esperado

1. **IA com fundamentos reais** - Cita artigos e sumulas que existem de verdade
2. **Peticoes mais robustas** - Fundamentacao juridica precisa e verificavel
3. **Menos revisao manual** - Advogado nao precisa corrigir citacoes erradas
4. **Diferencial competitivo** - Base propria de conhecimento juridico
5. **Escalabilidade** - Adicionar mais codigos e sumulas conforme demanda
