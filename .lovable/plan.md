
# Plano: Integracao de Jurisprudencia Real do STJ (Portal de Dados Abertos)

## Contexto e Descobertas

### O que o Portal de Dados Abertos do STJ oferece

O portal `dadosabertos.web.stj.jus.br` disponibiliza **11 conjuntos de dados de "Espelhos de Acordaos"** organizados por orgao julgador:

| Orgao | Dataset |
|-------|---------|
| Corte Especial | `espelhos-de-acordaos-corte-especial` |
| Primeira Secao | `espelhos-de-acordaos-primeira-secao` |
| Segunda Secao | `espelhos-de-acordaos-segunda-secao` |
| Terceira Secao | `espelhos-de-acordaos-terceira-secao` |
| Primeira Turma | `espelhos-de-acordaos-primeira-turma` |
| Segunda Turma | `espelhos-de-acordaos-segunda-turma` |
| Terceira Turma | `espelhos-de-acordaos-terceira-turma` |
| Quarta Turma | `espelhos-de-acordaos-quarta-turma` |
| Quinta Turma | `espelhos-de-acordaos-quinta-turma` |
| Sexta Turma | `espelhos-de-acordaos-sexta-turma` |

**Formato dos dados:**
- Arquivo ZIP inicial com historico completo (desde maio/2022)
- Arquivos JSON mensais incrementais (AAAAMMDD.json)
- Dicionario de dados em CSV
- Atualizacao mensal

**Estrutura estimada de cada acordao (baseado na documentacao do STJ):**
- ID unico
- Numero do processo
- Classe processual
- Relator
- Orgao julgador
- Data do julgamento
- Data da publicacao
- Ementa completa
- Palavras de destaque/indexacao
- Notas/observacoes
- Referencia legislativa
- Jurisprudencia citada

---

## Arquitetura da Solucao

### Visao Geral

```text
+------------------+     +-------------------+     +------------------+
| Portal Dados     |     | Edge Function     |     | Supabase         |
| Abertos STJ      |---->| sync-stj-data     |---->| stj_acordaos     |
| (JSON mensais)   |     | (Scheduled/Manual)|     | (Full-text search)|
+------------------+     +-------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +-------------------+     +------------------+
| Frontend         |<----| Edge Function     |<----| Busca local      |
| JurisprudenceSTJ |     | search-stj        |     | PostgreSQL FTS   |
+------------------+     +-------------------+     +------------------+
```

### Por que essa abordagem

1. **Dados reais e verificaveis** - Fonte oficial do STJ
2. **Busca local rapida** - Full-text search no PostgreSQL (sem latencia de API externa)
3. **Controle total** - Dados armazenados localmente, sem dependencia em tempo real
4. **Custo zero** - Dados publicos, sem API key necessaria

---

## Fase 1: Infraestrutura de Dados

### 1.1 Nova Tabela: `stj_acordaos`

```sql
CREATE TABLE stj_acordaos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stj_id TEXT UNIQUE NOT NULL,           -- ID original do STJ
  processo TEXT,                          -- Numero do processo
  classe TEXT,                            -- Classe processual (REsp, AgInt, etc)
  relator TEXT,                           -- Ministro relator
  orgao_julgador TEXT NOT NULL,          -- Turma/Secao
  data_julgamento DATE,                   -- Data do julgamento
  data_publicacao DATE,                   -- Data de publicacao no DJe
  ementa TEXT NOT NULL,                   -- Texto da ementa
  palavras_destaque TEXT[],               -- Keywords de indexacao
  referencias_legais TEXT[],              -- Leis citadas
  notas TEXT,                             -- Observacoes adicionais
  search_vector TSVECTOR,                 -- Vetor de busca
  source_file TEXT,                       -- Arquivo de origem (para rastreabilidade)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX idx_stj_acordaos_search ON stj_acordaos USING GIN(search_vector);
CREATE INDEX idx_stj_acordaos_orgao ON stj_acordaos(orgao_julgador);
CREATE INDEX idx_stj_acordaos_data ON stj_acordaos(data_julgamento DESC);
CREATE INDEX idx_stj_acordaos_classe ON stj_acordaos(classe);
```

### 1.2 Trigger para Search Vector

```sql
CREATE OR REPLACE FUNCTION update_stj_acordaos_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.ementa, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.processo, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.relator, '')), 'C') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.palavras_destaque, ' ')), 'A') ||
    setweight(to_tsvector('portuguese', array_to_string(NEW.referencias_legais, ' ')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stj_acordaos_search_vector
  BEFORE INSERT OR UPDATE ON stj_acordaos
  FOR EACH ROW
  EXECUTE FUNCTION update_stj_acordaos_search_vector();
```

### 1.3 Tabela de Controle de Sincronizacao

```sql
CREATE TABLE stj_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orgao TEXT NOT NULL,
  arquivo TEXT NOT NULL,
  registros_importados INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(orgao, arquivo)
);
```

---

## Fase 2: Edge Function de Sincronizacao

### 2.1 `sync-stj-jurisprudence`

Edge Function que:
1. Busca a lista de arquivos JSON disponiveis no portal STJ
2. Verifica quais arquivos ja foram importados (via `stj_sync_log`)
3. Baixa e processa os arquivos pendentes
4. Insere os acordaos na tabela `stj_acordaos`

**Estrategia de importacao:**
- Importar 1 orgao por vez para evitar timeout
- Processar em lotes de 100-500 registros por transacao
- Usar `ON CONFLICT (stj_id) DO UPDATE` para evitar duplicatas

**Parametros:**
- `orgao`: qual turma/secao sincronizar (opcional, padrao: todas)
- `force`: reimportar arquivos ja processados (boolean)

### 2.2 Mapeamento de URLs

Os arquivos JSON seguem o padrao:
```
https://dadosabertos.web.stj.jus.br/dataset/{dataset-id}/resource/{resource-id}/download/{AAAAMMDD}.json
```

A Edge Function precisara:
1. Fazer scraping da pagina do dataset para obter lista de recursos
2. OU manter um mapeamento estatico dos datasets conhecidos

---

## Fase 3: Edge Function de Busca

### 3.1 `search-stj-jurisprudence`

Edge Function otimizada para busca local:

```typescript
// Parametros de entrada
interface SearchParams {
  query: string;              // Texto de busca
  orgao?: string;             // Filtro por turma/secao
  classe?: string;            // Filtro por classe (REsp, AgInt, etc)
  dataInicio?: string;        // Filtro por periodo
  dataFim?: string;
  page?: number;
  limit?: number;
}

// Retorno
interface SearchResult {
  success: boolean;
  data: STJAcordao[];
  total: number;
  page: number;
  source: 'stj_local';        // Indica fonte real
}
```

**Query SQL otimizada:**
```sql
SELECT *,
  ts_rank(search_vector, websearch_to_tsquery('portuguese', $1)) as relevance
FROM stj_acordaos
WHERE search_vector @@ websearch_to_tsquery('portuguese', $1)
  AND ($2 IS NULL OR orgao_julgador = $2)
  AND ($3 IS NULL OR classe = $3)
  AND ($4 IS NULL OR data_julgamento >= $4)
  AND ($5 IS NULL OR data_julgamento <= $5)
ORDER BY relevance DESC, data_julgamento DESC
LIMIT $6 OFFSET $7;
```

---

## Fase 4: Frontend

### 4.1 Novo Componente: `JurisprudenceSTJ.tsx`

Nova aba ou secao na pagina de Jurisprudencia especifica para STJ:

**Elementos:**
- Filtros especificos: Turma, Classe processual, Periodo
- Indicador de "Fonte: STJ - Dados Abertos"
- Badge de "Dados Reais" (substituindo o aviso de "Demonstracao")
- Indicador de ultima atualizacao da base

### 4.2 Atualizacao do `JurisprudenceSearch.tsx`

Adicionar:
- Toggle ou tabs: "TJSP (Demo)" | "STJ (Real)"
- Filtros dinamicos baseados na fonte selecionada

### 4.3 Atualizacao do `JurisprudenceResults.tsx`

- Renderizar badge de tribunal (STJ)
- Link para acordao original no site do STJ (quando disponivel)
- Exibir referencias legais e palavras-chave

---

## Fase 5: Administracao (Opcional)

### 5.1 Painel de Status da Base

Componente para administradores visualizarem:
- Total de acordaos por turma
- Ultima sincronizacao
- Botao para disparar sincronizacao manual
- Log de erros

---

## Cronograma de Implementacao

| Ordem | Item | Descricao |
|-------|------|-----------|
| 1 | Migracao SQL | Criar tabelas `stj_acordaos` e `stj_sync_log` |
| 2 | Edge Function Sync | Implementar `sync-stj-jurisprudence` |
| 3 | Importacao Inicial | Popular base com dados de 1-2 turmas (teste) |
| 4 | Edge Function Search | Implementar `search-stj-jurisprudence` |
| 5 | API Client | Atualizar `jurisprudenceApi` para suportar STJ |
| 6 | Frontend STJ | Criar componentes de busca STJ |
| 7 | Integracao | Conectar com fluxo de peticoes |
| 8 | Importacao Completa | Popular base com todas as turmas |

---

## Estimativa de Volume

Baseado na estrutura do portal:
- ~10 orgaos julgadores
- Dados desde maio/2022 + atualizacoes mensais
- Estimativa: **50.000 a 150.000 acordaos** no total

**Armazenamento estimado:** 200MB - 500MB

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Mudanca na estrutura do JSON | Media | Parser flexivel + validacao |
| Timeout na importacao | Alta | Processar em lotes pequenos |
| Volume muito grande | Media | Limitar orgaos mais relevantes inicialmente |
| Portal indisponivel | Baixa | Retry com backoff + cache local |

---

## Secao Tecnica Detalhada

### Estrutura Esperada do JSON (baseado no dicionario STJ)

```json
{
  "id": 12345,
  "numeroProcesso": "REsp 1234567/SP",
  "classe": "REsp",
  "relator": "Ministro(a) NOME DO MINISTRO",
  "orgaoJulgador": "TERCEIRA TURMA",
  "dataJulgamento": "2024-01-15",
  "dataPublicacao": "2024-01-20",
  "ementa": "CIVIL E PROCESSUAL CIVIL. RECURSO ESPECIAL...",
  "palavrasDestaque": ["CONTRATO", "RESCISAO", "DANO MORAL"],
  "notasJurisprudencia": "...",
  "referenciaLegislativa": ["Art. 927 do CC/2002", "Art. 5o do CDC"]
}
```

### Edge Function - Fluxo de Sincronizacao

```text
sync-stj-jurisprudence(orgao)
    |
    v
[1] Buscar lista de arquivos do dataset
    |
    v
[2] Comparar com stj_sync_log
    |
    v
[3] Para cada arquivo pendente:
    |
    +---> Baixar JSON
    |
    +---> Parse e validacao
    |
    +---> INSERT em lotes (500 registros)
    |
    +---> Atualizar stj_sync_log
    |
    v
[4] Retornar estatisticas
```

### RLS Policies

```sql
-- Leitura publica (dados sao publicos)
ALTER TABLE stj_acordaos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acordaos sao publicos para leitura"
  ON stj_acordaos FOR SELECT
  USING (true);

-- Apenas service role pode inserir/atualizar
CREATE POLICY "Apenas sistema pode modificar acordaos"
  ON stj_acordaos FOR ALL
  USING (auth.role() = 'service_role');
```
