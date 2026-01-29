

# Plano: Módulo de Pesquisa de Jurisprudência do TJSP

## Visão Geral
Implementar um módulo funcional de busca de jurisprudência do TJSP integrado ao gerador de petições, usando a abordagem mais simples possível para o MVP.

---

## Fase 1: MVP - Busca Básica (Entrega Inicial)

### 1.1 Interface de Pesquisa
- Tela dedicada "Pesquisa de Jurisprudência" (substituir placeholder atual)
- Campo de busca por texto livre / palavras-chave
- Filtro opcional por tipo de decisão (Acórdãos, Decisões Monocráticas)
- Lista de resultados com: ementa, órgão julgador, relator, data do julgamento
- Botão "Usar na petição" em cada resultado

### 1.2 Backend de Consulta
- Edge function que faz a consulta ao portal CJSG do TJSP
- Conectar Firecrawl como serviço de scraping (conector disponível)
- Parsing dos resultados HTML para extrair dados estruturados
- Rate limiting: máximo 1 requisição a cada 3 segundos por usuário
- Limite global de 5 requisições simultâneas ao TJSP

### 1.3 Sistema de Cache
- Tabela no banco para armazenar resultados de buscas
- Cache de 7 dias para a mesma consulta
- Antes de consultar o TJSP, verificar se já existe no cache
- Reduz drasticamente a carga no TJSP e melhora performance

### 1.4 Integração com Petições
- Ao selecionar jurisprudência, salvar vínculo com a petição
- Passar jurisprudência selecionada como contexto para a IA
- IA deve citar a decisão na fundamentação jurídica
- Exibir jurisprudências vinculadas na visualização da petição

---

## Fase 2: Melhorias (Pós-MVP)

### 2.1 Biblioteca Pessoal
- Permitir "favoritar" decisões importantes
- Organizar por pastas/categorias
- Reutilizar decisões salvas em futuras petições

### 2.2 Filtros Avançados
- Busca por número do processo
- Filtro por câmara/seção
- Filtro por período de julgamento
- Filtro por comarca de origem

### 2.3 Extração do Inteiro Teor (PDF)
- Guardar link do PDF para acesso manual (MVP)
- Futuramente: Extração de texto do PDF com OCR
- Resumo automático da decisão com IA

---

## Estrutura Técnica

### Banco de Dados
- `jurisprudence_searches`: Cache das buscas realizadas
- `jurisprudence_results`: Resultados individuais encontrados
- `petition_jurisprudence`: Vínculo entre petições e jurisprudências usadas
- `saved_jurisprudence`: Jurisprudências favoritadas pelo usuário

### Backend (Edge Functions)
- `search-jurisprudence`: Realiza busca com cache e rate limiting
- `get-jurisprudence`: Recupera detalhes de uma decisão

### Frontend
- Página de Pesquisa com busca e resultados
- Modal de seleção durante criação de petição
- Componente para exibir jurisprudência vinculada

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| TJSP mudar estrutura HTML | Monitoramento de erros + logs detalhados |
| Bloqueio de IP | Rate limiting conservador + cache agressivo |
| PDFs escaneados | MVP usa apenas ementa (texto), PDF como link |
| Alta concorrência | Fila de requisições + limite global |

---

## O que entra no MVP
✅ Busca por texto livre  
✅ Exibição de ementa e metadados  
✅ Cache de resultados  
✅ Seleção para usar em petições  
✅ Link para PDF (acesso manual)  
✅ Rate limiting básico  

## O que fica para depois
⏳ Extração de texto do PDF  
⏳ Filtros avançados  
⏳ Biblioteca pessoal de jurisprudências  
⏳ Resumo automático com IA  
⏳ Fila robusta de requisições  

