

# Correção da Busca de Jurisprudência (STF + TJDFT)

## Diagnóstico

Testei a edge function `buscar-lexml` e ela retorna status 200, mas ambas as fontes retornam 0 resultados. Os motivos:

1. **TJDFT**: URL e parâmetros completamente errados
   - URL usada: `jurisprudencia.tjdft.jus.br/api/v1/pesquisar` (inexistente)
   - URL correta (documentação oficial): `jurisdf.tjdft.jus.br/api/v1/pesquisa`
   - Parâmetros errados: `texto`, `quantidadePorPagina` → correto: `query`, `tamanho`
   - Paginação começa em 0, não em 1

2. **STF**: Não possui API pública REST documentada
   - O endpoint `jurisprudencia.stf.jus.br/api/search/search` retorna 405 Method Not Allowed
   - O portal é uma SPA sem API aberta; scrapers usam Playwright/browser automation
   - Não há como consultar diretamente sem scraping

## Plano

### 1. Corrigir Edge Function `buscar-lexml`
- **TJDFT**: Atualizar para endpoint correto com parâmetros oficiais:
  ```
  POST https://jurisdf.tjdft.jus.br/api/v1/pesquisa
  { "query": "...", "pagina": 0, "tamanho": 10 }
  ```
  Mapear resposta: `registros[].ementa`, `registros[].processo`, `registros[].nomeRelator`, `registros[].dataPublicacao`, `hits` para total
- **STF**: Remover a função `buscarSTF` que nunca funciona. Substituir por consulta ao DataJud STF (`api_publica_stf`) usando a mesma chave `DATAJUD_API_KEY` já configurada. Isso **não mexe** na edge function `search-datajud` existente -- é código novo dentro de `buscar-lexml` apenas.

### 2. Atualizar Frontend `Jurisprudence.tsx`
- Ajustar badges para mostrar "TJDFT" e "STF (DataJud)" com cores distintas
- Manter toda a estrutura existente (cards, paginação, loading states)

### Detalhes Técnicos
- Sem secrets novos (DATAJUD_API_KEY já existe)
- TJDFT: paginação 0-based, resposta tem `hits` (total) e `registros` (array)
- STF via DataJud: `POST https://api-publica.datajud.cnj.jus.br/api_publica_stf/_search` com Elasticsearch query

