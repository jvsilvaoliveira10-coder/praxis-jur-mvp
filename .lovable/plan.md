

# Integração LexML - Jurisprudência Funcional

## Análise do Arquivo Enviado

O arquivo contém duas partes: uma Edge Function para proxy da API LexML (protocolo SRU/CQL) e um componente React. A abordagem é viável porque:

- A API LexML é **pública e gratuita**, sem necessidade de API key
- O protocolo SRU retorna XML com ementas, datas, autoridades e URNs persistentes
- Já temos infraestrutura similar no projeto (edge functions, componentes de busca)

## O Que Já Temos

- Edge function `search-jurisprudence` que tenta scraping do TJSP (bloqueado por reCAPTCHA) e cai em mock
- Página `Jurisprudence.tsx` totalmente em modo demo (campos desabilitados, dados mock estáticos)
- Componentes UI reutilizáveis (Card, Badge, Input, Button, ScrollArea)

## O Que Será Feito

### 1. Criar Edge Function `buscar-lexml`
- Proxy para `https://www.lexml.gov.br/busca/SRU` com CQL query
- Parser XML para extrair: título, ementa, data, autoridade, tipo, URN/link
- Paginação via `startRecord` e `maximumRecords`
- CORS headers corretos, validação de input (query obrigatória, limites de tamanho)
- Baseado no código do arquivo, mas adaptado às convenções de segurança do projeto

### 2. Reescrever `Jurisprudence.tsx`
- Remover modo demo e dados mock
- Campo de busca **funcional** chamando `supabase.functions.invoke('buscar-lexml')`
- Cards de resultado com: título, ementa (expandível), autoridade, data, badge de tipo, link para documento no LexML
- Paginação real
- Estados de loading, erro e sem resultados
- Usar componentes UI existentes (Card, Badge, Button, Input, ScrollArea) em vez de estilos inline

### 3. Registrar no `config.toml`
- Adicionar `[functions.buscar-lexml]` com `verify_jwt = false`

## Detalhes Técnicos

- **Sem secrets necessários** - API LexML é pública
- A edge function faz sanitização da query (max 500 chars, min 3 chars)
- O parser XML usa regex (mesmo approach do arquivo) pois não há DOM parser nativo no Deno para XML simples
- Mantém compatibilidade com o restante do sistema (mesma estrutura de layout, sidebar, etc.)

