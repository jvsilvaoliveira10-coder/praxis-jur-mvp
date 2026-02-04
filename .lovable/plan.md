
# Plano: Script Automatizado de Importacao STJ

## Resumo Executivo

Vou criar um sistema automatizado que busca, baixa e importa todos os acordaos do Portal de Dados Abertos do STJ, usando a API CKAN do portal para descobrir dinamicamente todos os arquivos disponiveis.

## Descobertas da Analise

### Estrutura Real dos Dados JSON do STJ

Os arquivos JSON tem uma estrutura diferente do mapeamento atual:

| Campo Real STJ | Campo no Banco |
|----------------|----------------|
| `id` | `stj_id` |
| `numeroProcesso` + `siglaClasse` | `processo` |
| `siglaClasse` | `classe` |
| `ministroRelator` | `relator` |
| `nomeOrgaoJulgador` | `orgao_julgador` |
| `dataDecisao` (YYYYMMDD) | `data_julgamento` |
| `dataPublicacao` | `data_publicacao` |
| `ementa` | `ementa` |
| `referenciasLegislativas` | `referencias_legais` |
| `termosAuxiliares` | `palavras_destaque` |

### API CKAN do Portal

O portal usa CKAN, com endpoints disponiveis:
- `package_show?id={dataset}` - Lista todos os recursos de um dataset
- Recursos incluem URL de download direta

### Volume Estimado

- 10 orgaos julgadores
- ~40 arquivos por orgao (mai/2022 ate fev/2026)
- Estimativa: **150.000 a 300.000 acordaos** no total

---

## Arquitetura da Solucao

```text
+------------------+     +--------------------+     +------------------+
| API CKAN STJ     |     | Edge Function      |     | Frontend Admin   |
| package_show     |---->| auto-sync-stj      |<----| Painel Controle  |
+------------------+     +--------------------+     +------------------+
                                |
                                v
                         +-------------+
                         | stj_acordaos|
                         | stj_sync_log|
                         +-------------+
```

---

## Fase 1: Atualizar Edge Function de Sincronizacao

### 1.1 Novo Modo: `discoverAndSync`

Adicionar funcionalidade para descobrir automaticamente todos os recursos via API CKAN:

```typescript
// Consulta a API CKAN para obter lista de arquivos
const response = await fetch(
  `https://dadosabertos.web.stj.jus.br/api/3/action/package_show?id=${datasetId}`
);
const { result } = await response.json();
const resources = result.resources.filter(r => 
  r.format?.toLowerCase() === 'json' && 
  r.name.match(/\d{8}\.json/)
);
```

### 1.2 Corrigir Mapeamento de Campos

Atualizar a funcao `mapAcordao` para usar os campos reais:

```typescript
function mapAcordao(raw: STJAcordaoRaw, orgaoNome: string, sourceFile: string) {
  return {
    stj_id: raw.id,
    processo: `${raw.siglaClasse} ${raw.numeroProcesso}`,
    classe: raw.siglaClasse,
    relator: raw.ministroRelator,
    orgao_julgador: raw.nomeOrgaoJulgador || orgaoNome,
    data_julgamento: parseDateYYYYMMDD(raw.dataDecisao),
    data_publicacao: parseDate(raw.dataPublicacao),
    ementa: raw.ementa || '',
    palavras_destaque: normalizeArray(raw.termosAuxiliares),
    referencias_legais: raw.referenciasLegislativas || [],
    notas: raw.notas || raw.teseJuridica,
    source_file: sourceFile,
  };
}
```

### 1.3 Processamento em Lotes

Estrategia para evitar timeout:

1. **Por chamada**: Processar 1 arquivo de cada vez
2. **Dentro do arquivo**: Inserir em lotes de 200 registros
3. **Controle de estado**: Usar `stj_sync_log` para retomar de onde parou

---

## Fase 2: Edge Function para Importacao Completa

### 2.1 Nova Edge Function: `auto-sync-stj`

Orquestrador que:
1. Lista todos os datasets (10 orgaos)
2. Para cada dataset, consulta API CKAN
3. Identifica arquivos nao importados
4. Chama sync para cada arquivo pendente

```typescript
interface SyncJob {
  orgao: string;
  datasetId: string;
  pendingFiles: {
    name: string;
    url: string;
    created: string;
  }[];
}

// Fluxo principal
for (const orgao of ORGAOS) {
  const resources = await fetchCKANResources(orgao.datasetId);
  const imported = await getImportedFiles(orgao.name);
  const pending = resources.filter(r => !imported.includes(r.name));
  
  for (const file of pending.slice(0, MAX_PER_RUN)) {
    await syncFile(file.url, orgao.name, file.name);
  }
}
```

### 2.2 Parametros de Controle

```typescript
interface AutoSyncParams {
  orgao?: string;        // Opcional: sincronizar apenas um orgao
  maxFiles?: number;     // Limite de arquivos por execucao (padrao: 5)
  startFrom?: string;    // Nome do arquivo para comecar (retomar)
  skipZip?: boolean;     // Pular arquivo ZIP inicial (muito grande)
}
```

---

## Fase 3: Painel de Administracao

### 3.1 Novo Componente: `STJSyncPanel.tsx`

Interface para monitorar e controlar a sincronizacao:

**Elementos:**
- Cards com estatisticas por orgao (total importado, ultima sync)
- Barra de progresso global
- Botao "Iniciar Sincronizacao Completa"
- Botao "Sincronizar Orgao Especifico"
- Log de atividades em tempo real
- Indicador de arquivos pendentes

### 3.2 Integracao na Pagina de Jurisprudencia

Adicionar aba "Administracao" ou botao de config visivel apenas para admins.

---

## Fase 4: Cron Job (Opcional)

### 4.1 Sincronizacao Mensal Automatica

Usar pg_cron para executar sincronizacao todo dia 5 do mes:

```sql
SELECT cron.schedule(
  'stj-monthly-sync',
  '0 3 5 * *',  -- Todo dia 5 as 03:00
  $$
  SELECT net.http_post(
    url := 'https://htxpsggxvbjqsojaabxu.supabase.co/functions/v1/auto-sync-stj',
    headers := '{"Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{"maxFiles": 20}'::jsonb
  );
  $$
);
```

---

## Implementacao Detalhada

### Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/sync-stj-jurisprudence/index.ts` | Modificar | Corrigir mapeamento, adicionar modo CKAN |
| `supabase/functions/auto-sync-stj/index.ts` | Criar | Orquestrador de sincronizacao completa |
| `src/components/jurisprudence/STJSyncPanel.tsx` | Criar | Painel de controle admin |
| `src/lib/api/stj-jurisprudence.ts` | Modificar | Adicionar funcoes de sync e stats |
| `src/pages/Jurisprudence.tsx` | Modificar | Adicionar tab de administracao |

### Ordem de Execucao

1. Atualizar Edge Function `sync-stj-jurisprudence` com mapeamento correto
2. Criar Edge Function `auto-sync-stj`
3. Testar importacao de 1 arquivo real
4. Criar componente `STJSyncPanel`
5. Importar dados de 1-2 orgaos para teste
6. Importar todos os orgaos
7. (Opcional) Configurar cron mensal

---

## Secao Tecnica

### Estrutura Completa do JSON STJ

```typescript
interface STJAcordaoRaw {
  id: string;                    // "000897322"
  numeroProcesso: string;        // "2583484"
  numeroRegistro: string;        // "202400682179"
  siglaClasse: string;           // "RCD no AgInt no AREsp"
  descricaoClasse: string;       // "PEDIDO DE RECONSIDERACAO..."
  nomeOrgaoJulgador: string;     // "TERCEIRA TURMA"
  ministroRelator: string;       // "RICARDO VILLAS BOAS CUEVA"
  dataPublicacao: string | null;
  ementa: string;
  tipoDeDecisao: string;         // "ACORDAO"
  dataDecisao: string;           // "20241209" (YYYYMMDD)
  decisao: string;               // Texto da decisao
  jurisprudenciaCitada: string | null;
  notas: string | null;
  informacoesComplementares: string | null;
  termosAuxiliares: string | null;
  teseJuridica: string | null;
  tema: string | null;
  referenciasLegislativas: string[];
  acordaosSimilares: string[];
}
```

### Parser de Data YYYYMMDD

```typescript
function parseDateYYYYMMDD(dateStr: string | null): string | null {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}
```

### Resposta da API CKAN

```typescript
interface CKANResource {
  id: string;           // UUID do recurso
  name: string;         // "20250131.json"
  format: string;       // "JSON"
  url: string;          // URL completa de download
  created: string;      // ISO date
  last_modified: string;
}

interface CKANPackage {
  id: string;
  name: string;
  resources: CKANResource[];
}
```

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Timeout em arquivos grandes | Alta | Processar em lotes pequenos |
| API CKAN indisponivel | Baixa | Retry com backoff exponencial |
| Mudanca na estrutura JSON | Media | Validacao de campos obrigatorios |
| Limite de storage | Media | Monitorar uso, comprimir se necessario |
| Rate limiting do STJ | Baixa | Delay entre requisicoes |

---

## Metricas de Sucesso

- [ ] 100% dos arquivos JSON descobertos automaticamente
- [ ] Retomada automatica em caso de falha
- [ ] Log completo de cada importacao
- [ ] Painel mostrando progresso em tempo real
- [ ] Busca retornando acordaos reais
