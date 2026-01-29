

# Plano: Melhorar Scraping do Portal CJSG do TJSP

## Visão Geral

Ajustar a Edge Function `search-jurisprudence` para simular corretamente as requisições do formulário do CJSG, incluindo o fluxo correto de POST e os parâmetros necessários para contornar as limitações atuais.

---

## Análise do Problema Atual

O scraping atual não funciona porque:
1. **URL incorreta**: Usamos `pesquisar.do` com query strings, mas o formulário faz POST para `resultadoCompleta.do`
2. **Parâmetros incorretos**: O campo `tipoDecisao` foi substituído por `tipoDecisaoSelecionados` (checkbox)
3. **reCAPTCHA**: O portal inclui reCAPTCHA invisível que pode bloquear requisições automatizadas
4. **Sessão/Cookies**: O formulário requer um `jsessionid` válido obtido na página inicial

---

## Estratégia de Implementação

### Abordagem 1: POST Direto com Form Data (Principal)

Simular o envio do formulário HTML exatamente como um navegador faria:

1. **Primeira requisição (GET)**: Acessar `consultaCompleta.do` para obter:
   - Cookie de sessão (`JSESSIONID`)
   - Token reCAPTCHA (se necessário)
   - URL do action com jsessionid

2. **Segunda requisição (POST)**: Enviar os dados do formulário para `resultadoCompleta.do;jsessionid=XXX`

---

## Detalhes Técnicos

### Parâmetros do Formulário (Mapeamento Correto)

| Campo do Formulário | Descrição | Valor Padrão |
|---------------------|-----------|--------------|
| `dados.buscaInteiroTeor` | Pesquisa livre (inteiro teor) | Query do usuário |
| `dados.buscaEmenta` | Pesquisa só na ementa | (vazio) |
| `dados.pesquisarComSinonimos` | Pesquisar sinônimos | S |
| `tipoDecisaoSelecionados` | A=Acórdãos, D=Monocráticas, H=Homologações | A |
| `dados.origensSelecionadas` | T=2º grau, R=Recursais | T |
| `dados.ordenarPor` | dtPublicacao ou relevancia | dtPublicacao |
| `dados.dtJulgamentoInicio` | Data inicial julgamento | (vazio) |
| `dados.dtJulgamentoFim` | Data final julgamento | (vazio) |

### Fluxo de Requisições

```text
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE SCRAPING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GET consultaCompleta.do                                 │
│     └─> Extrai JSESSIONID do Set-Cookie                     │
│     └─> Extrai action URL do formulário                     │
│                                                             │
│  2. POST resultadoCompleta.do;jsessionid=XXX                │
│     └─> Content-Type: application/x-www-form-urlencoded     │
│     └─> Cookie: JSESSIONID=XXX                              │
│     └─> Body: dados.buscaInteiroTeor=danos+morais&...       │
│                                                             │
│  3. Parse HTML de resultados                                │
│     └─> Extrair ementas, relatores, datas                   │
│     └─> Extrair links para PDFs                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Headers HTTP Necessários

```text
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: pt-BR,pt;q=0.9,en;q=0.8
Content-Type: application/x-www-form-urlencoded
Referer: https://esaj.tjsp.jus.br/cjsg/consultaCompleta.do
Cookie: JSESSIONID={session_id}
```

---

## Mudanças na Edge Function

### 1. Substituir Firecrawl por Fetch Nativo

O Firecrawl é ótimo para scraping genérico, mas para este caso específico precisamos de controle total sobre cookies e headers. Usaremos `fetch()` nativo do Deno.

### 2. Implementar Gerenciamento de Sessão

- Fazer GET inicial para obter cookies
- Manter JSESSIONID entre requisições
- Usar Referer correto para simular navegação

### 3. Melhorar Parser de Resultados

- Identificar padrões específicos da página de resultados do CJSG
- Extrair links de PDF (formato: `obterVotosAcordaos.do?numRegistro=XXX`)
- Tratar encoding UTF-8/ISO-8859-1

---

## Estrutura do Código Atualizado

```text
search-jurisprudence/index.ts
├── Constantes de configuração
│   └── URLs, Headers padrão, Rate limits
│
├── Funções auxiliares
│   ├── getSession() - Obtém JSESSIONID
│   ├── buildFormData() - Monta dados do formulário
│   └── parseResults() - Extrai dados do HTML
│
├── Handler principal
│   ├── Validação de input
│   ├── Rate limiting
│   ├── Verificação de cache
│   ├── Execução do scraping (2 requisições)
│   └── Salvamento em cache
│
└── Tratamento de erros
    └── Logs detalhados para debugging
```

---

## Mitigação de Riscos

### reCAPTCHA

- O reCAPTCHA invisível geralmente só é ativado para tráfego suspeito
- Com rate limiting conservador (3s entre requisições) e User-Agent válido, é improvável ser bloqueado
- Se bloqueado, o erro será logado e retornado ao usuário

### Mudanças no HTML

- Logs detalhados do conteúdo recebido
- Testes automatizados para verificar estrutura
- Fallback para retornar "site indisponível" com mensagem clara

### Bloqueio de IP

- Rate limiting já implementado
- Cache de 7 dias reduz requisições
- Limite global de 5 requisições simultâneas

---

## Tarefas de Implementação

1. **Atualizar Edge Function** (Principal)
   - Implementar fluxo de duas requisições (GET + POST)
   - Gerenciar cookies/sessão manualmente
   - Melhorar parsing do HTML de resultados

2. **Adicionar Logs de Debug**
   - Logar tamanho do conteúdo recebido
   - Logar se encontrou indicadores de resultados
   - Logar erros de parsing específicos

3. **Testes**
   - Testar com termos comuns ("danos morais", "furto")
   - Verificar extração de ementas e metadados
   - Validar links de PDF

---

## Resultado Esperado

Após a implementação:
- Busca por "danos morais" retornará resultados reais do TJSP
- Cada resultado incluirá: ementa, relator, órgão julgador, data, link PDF
- Cache funcionará corretamente, reduzindo carga no portal

