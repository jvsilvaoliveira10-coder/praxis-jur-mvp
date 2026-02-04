
# Plano: Busca sob Demanda de Jurisprudencia STJ

## Resumo Executivo

Vou implementar um sistema **hibrido** de busca de jurisprudencia que:
1. **Primeiro** busca nos acordaos ja importados localmente (rapido)
2. **Se nao encontrar resultados suficientes**, consulta a **API publica do Datajud** em tempo real
3. **Automaticamente importa** os novos acordaos encontrados para a base local (cache progressivo)

Isso permite que a base de dados cresca **organicamente** conforme a demanda real dos advogados, sem precisar baixar todos os dados de uma vez.

---

## Arquitetura da Solucao

```text
+--------------------+          +-------------------+
| Advogado busca     |          | Base Local        |
| "danos morais"     |--------->| stj_acordaos      |
+--------------------+          +-------------------+
                                      |
                                      v
                               [Encontrou >= 10?]
                                 /          \
                               SIM           NAO
                                |             |
                                v             v
                      [Retorna resultados]  [Busca na API Datajud]
                                               |
                                               v
                                      +-------------------+
                                      | API Datajud CNJ   |
                                      | (tempo real)      |
                                      +-------------------+
                                               |
                                               v
                                      [Importa novos acordaos]
                                      [para base local]
                                               |
                                               v
                                      [Retorna resultados]
```

---

## Descoberta Importante: API Publica Datajud

O CNJ disponibiliza uma API publica (Elasticsearch) para consultar processos do STJ em tempo real:

| Item | Valor |
|------|-------|
| **Endpoint STJ** | `https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search` |
| **API Key** | `cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==` |
| **Formato** | Elasticsearch Query DSL |
| **Dados** | Metadados de processos + movimentacoes |

Esta API permite buscar por:
- Palavras-chave em movimentacoes
- Numero do processo
- Classe processual
- Periodo

---

## Fase 1: Atualizar Edge Function de Busca

### 1.1 Nova Logica Hibrida em `search-stj-jurisprudence`

A Edge Function tera 3 etapas:

```text
[1] Busca Local (Full-Text Search)
    |
    v
[2] Verifica quantidade de resultados
    - Se >= minResults (padrao: 5): retorna
    - Se < minResults: continua
    |
    v
[3] Busca na API Datajud (tempo real)
    |
    v
[4] Importa acordaos novos para base local
    |
    v
[5] Retorna resultados combinados
```

### 1.2 Parametros Adicionais

```typescript
interface SearchParams {
  query: string;
  orgao?: string;
  classe?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
  // NOVOS
  fetchRemote?: boolean;     // Forcar busca na API (padrao: auto)
  minLocalResults?: number;  // Minimo para considerar busca local suficiente (padrao: 5)
}
```

### 1.3 Resposta Enriquecida

```typescript
interface SearchResponse {
  success: boolean;
  data: STJAcordao[];
  pagination: {...};
  source: 'local' | 'datajud' | 'mixed';  // De onde vieram os dados
  imported?: number;  // Quantos novos acordaos foram importados
}
```

---

## Fase 2: Integracao com API Datajud

### 2.1 Funcao para Consultar Datajud

```typescript
async function searchDatajud(query: string, filters: Filters): Promise<DatajudResult[]> {
  const response = await fetch(
    'https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search',
    {
      method: 'POST',
      headers: {
        'Authorization': 'ApiKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          bool: {
            must: [
              { match: { movimentos.complementosTabelados.descricao: query } }
            ],
            filter: [
              // Filtros opcionais
            ]
          }
        },
        size: 20,
        sort: [{ dataAjuizamento: "desc" }]
      }),
    }
  );
  
  return parseDatajudResponse(response);
}
```

### 2.2 Mapeamento de Dados Datajud para Base Local

A API Datajud retorna uma estrutura diferente dos JSONs de Espelhos de Acordaos. Precisaremos mapear:

| Campo Datajud | Campo Local |
|---------------|-------------|
| `numeroProcesso` | `processo` |
| `classeProcessual.nome` | `classe` |
| `relator.nome` | `relator` |
| `orgaoJulgador.nome` | `orgao_julgador` |
| `movimentos[*].dataHora` | `data_julgamento` |
| `movimentos[*].nome` (ACORDAO) | Identificar ementa |

---

## Fase 3: Atualizacao do Frontend

### 3.1 Indicador de Fonte dos Dados

Adicionar no componente `STJResults.tsx`:

- Badge indicando fonte: "Base Local" ou "API em Tempo Real"
- Indicador de quantos acordaos foram importados na busca
- Mensagem quando a busca remota e acionada

### 3.2 Opcao para Forcar Busca Remota

Adicionar no componente `STJSearch.tsx`:

- Toggle/checkbox: "Buscar na fonte oficial (mais lento, mais resultados)"
- Tooltip explicando a diferenca

---

## Fase 4: Cache Inteligente

### 4.1 Logica de Cache

Quando um acordao e encontrado via API Datajud:
1. Verificar se ja existe na base local (por numero do processo)
2. Se nao existe: inserir
3. Se existe: atualizar se houver dados novos

### 4.2 Controle de Origem

Adicionar campo `source_type` na tabela `stj_acordaos`:

```sql
ALTER TABLE stj_acordaos 
ADD COLUMN source_type TEXT DEFAULT 'portal_dados_abertos';
-- Valores: 'portal_dados_abertos', 'datajud_api', 'manual'
```

---

## Implementacao Detalhada

### Arquivos a Modificar/Criar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/search-stj-jurisprudence/index.ts` | Modificar | Adicionar busca hibrida com API Datajud |
| `src/components/jurisprudence/STJSearch.tsx` | Modificar | Adicionar toggle para busca remota |
| `src/components/jurisprudence/STJResults.tsx` | Modificar | Mostrar indicador de fonte |
| Migracao SQL | Criar | Adicionar campo `source_type` |

### Ordem de Execucao

1. Criar migracao SQL para adicionar campo `source_type`
2. Atualizar Edge Function com logica hibrida
3. Testar busca local + fallback para API
4. Atualizar componentes do frontend
5. Testar fluxo completo end-to-end

---

## Exemplo de Fluxo

**Cenario: Advogado busca "danos morais"**

1. Frontend envia: `{ query: "danos morais", limit: 20 }`
2. Edge Function busca na base local
3. Base local retorna 3 acordaos (menos que minLocalResults=5)
4. Edge Function consulta API Datajud
5. API Datajud retorna 15 processos relacionados
6. Edge Function importa os 15 para base local (cache)
7. Retorna 18 acordaos (3 locais + 15 novos) com `source: 'mixed'`
8. Na proxima busca por "danos morais", tudo vem da base local (rapido)

---

## Beneficios

| Beneficio | Descricao |
|-----------|-----------|
| **Crescimento organico** | Base cresce conforme demanda real |
| **Economia de storage** | So armazena o que e realmente usado |
| **Busca rapida** | Cache local para temas recorrentes |
| **Dados atualizados** | API fornece processos mais recentes |
| **Sem pre-carregamento** | Nao precisa importar 300k acordaos |

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Rate limiting da API | Media | Implementar cache agressivo |
| API Datajud indisponivel | Baixa | Fallback para base local |
| Estrutura diferente dos dados | Alta | Parser robusto com validacao |
| Latencia na primeira busca | Media | Mostrar indicador de carregamento |

---

## Secao Tecnica

### Query Elasticsearch para Datajud

```json
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "movimentos.complementosTabelados.descricao": {
              "query": "danos morais",
              "operator": "and"
            }
          }
        },
        {
          "match": {
            "assuntos.nome": "danos morais"
          }
        }
      ],
      "minimum_should_match": 1,
      "filter": [
        {
          "term": {
            "tribunal": "STJ"
          }
        }
      ]
    }
  },
  "size": 20,
  "sort": [
    { "dataAjuizamento": "desc" }
  ],
  "_source": [
    "numeroProcesso",
    "classeProcessual",
    "relator",
    "orgaoJulgador",
    "dataAjuizamento",
    "movimentos",
    "assuntos"
  ]
}
```

### Headers da API Datajud

```typescript
const headers = {
  'Authorization': 'ApiKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  'Content-Type': 'application/json',
  'User-Agent': 'Praxis-Juridico/1.0',
};
```
